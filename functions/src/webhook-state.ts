import { createHash, randomUUID } from "node:crypto";
import * as admin from "firebase-admin";

/**
 * Firestore is the coordination store for Stripe deliveries. The event log is
 * server-owned; clients must never be given a way to manufacture a succeeded
 * payment by writing these documents.
 */
export const WEBHOOK_EVENT_COLLECTION = "webhookEventLog";
export const WEBHOOK_OUTBOX_COLLECTION = "webhookOutbox";
export const WEBHOOK_BILLING_EFFECT_COLLECTION = "stripeBillingEffects";

/**
 * The function is expected to finish well inside this 15-minute lease. It is
 * intentionally longer than the configured/default HTTPS execution window and
 * the normal Stripe, Firestore, and email-provider calls, so a slow but live
 * invocation is not reclaimed by a concurrent delivery. The lease ID still
 * fences a worker that overruns the lease or resumes after a crash.
 */
export const WEBHOOK_LEASE_DURATION_MS = 15 * 60 * 1000;

export type WebhookStatus = "processing" | "succeeded" | "failed";
export type WebhookFailureKind = "transient" | "permanent";

export interface WebhookEventRecord {
  eventId: string;
  eventType: string;
  status: WebhookStatus;
  attempts: number;
  leaseExpiresAt: admin.firestore.Timestamp | null;
  leaseId?: string | null;
  firstSeenAt: admin.firestore.Timestamp;
  lastAttemptAt?: admin.firestore.Timestamp;
  lastError: string | null;
  failureKind?: WebhookFailureKind | null;
  succeededAt?: admin.firestore.Timestamp;
  failedAt?: admin.firestore.Timestamp;
  updatedAt?: admin.firestore.Timestamp;
}

export interface WebhookEventLike {
  id: string;
  type: string;
}

export interface AcquiredWebhookEvent {
  outcome: "acquired";
  leaseId: string;
  attempts: number;
  leaseExpiresAt: admin.firestore.Timestamp;
}

export type WebhookAcquisition =
  | AcquiredWebhookEvent
  | { outcome: "succeeded" }
  | { outcome: "processing"; leaseExpiresAt: admin.firestore.Timestamp | null }
  | { outcome: "failed"; failureKind: "permanent" }
  | { outcome: "legacy" }
  | { outcome: "conflict" };

export interface WebhookExecutionResult<T> {
  statusCode: 200 | 409 | 500;
  body: Record<string, unknown>;
  value?: T;
}

export interface WebhookStateOptions {
  now?: () => admin.firestore.Timestamp;
  leaseDurationMs?: number;
  onFailure?: (error: unknown, failureKind: WebhookFailureKind) => void;
}

export class PermanentWebhookError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PermanentWebhookError";
    this.code = code;
  }
}

export class RetryableWebhookError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "RetryableWebhookError";
    this.code = code;
  }
}

export function isPermanentWebhookError(error: unknown): error is PermanentWebhookError {
  return error instanceof PermanentWebhookError;
}

/**
 * Keep error text useful for operators without persisting provider payloads,
 * addresses, payment credentials, or an unbounded exception string.
 */
export function redactWebhookError(error: unknown): string {
  if (!(error instanceof Error)) return "Non-error webhook failure";

  const raw = `${error.name}: ${error.message}`;
  const redacted = raw
    .replace(/[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}/g, "[redacted-email]")
    .replace(/\b(?:sk|rk|pk|whsec)_[A-Za-z0-9]+\b/gi, "[redacted-secret]")
    .replace(
      /\b(?:payment[_-]?method|paymentMethod|card|cvc|cvv|customer[_-]?email|customerEmail|email)\s*[:=]\s*[^\s,;]+/gi,
      "[redacted-sensitive-field]"
    )
    .replace(/\b(?:\d[ -]?){13,19}\b/g, "[redacted-payment-identifier]")
    .replace(/\s+/g, " ")
    .trim();

  if (!redacted) return "Webhook processing failed";
  return redacted.length > 240 ? `${redacted.slice(0, 237)}...` : redacted;
}

function timestampMillis(value: unknown): number | null {
  if (value instanceof admin.firestore.Timestamp) return value.toMillis();
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (value && typeof value === "object") {
    const candidate = value as {
      toMillis?: () => number;
      seconds?: number;
      _seconds?: number;
    };
    if (typeof candidate.toMillis === "function") {
      const millis = candidate.toMillis();
      return Number.isFinite(millis) ? millis : null;
    }
    const seconds = candidate.seconds ?? candidate._seconds;
    if (typeof seconds === "number" && Number.isFinite(seconds)) return seconds * 1000;
  }

  return null;
}

function safeAttempts(value: unknown): number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0
    ? value
    : 0;
}

function leaseExpiresAt(
  now: admin.firestore.Timestamp,
  leaseDurationMs: number
): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromMillis(now.toMillis() + leaseDurationMs);
}

function newLease(
  now: admin.firestore.Timestamp,
  attempts: number,
  leaseDurationMs: number
): AcquiredWebhookEvent {
  return {
    outcome: "acquired",
    leaseId: randomUUID(),
    attempts,
    leaseExpiresAt: leaseExpiresAt(now, leaseDurationMs),
  };
}

function leaseUpdate(
  event: WebhookEventLike,
  now: admin.firestore.Timestamp,
  acquired: AcquiredWebhookEvent,
  existing: Record<string, unknown>
): Record<string, unknown> {
  return {
    eventId: event.id,
    eventType:
      typeof existing.eventType === "string"
        ? existing.eventType
        : typeof existing.type === "string"
          ? existing.type
          : event.type,
    type: event.type,
    status: "processing",
    attempts: acquired.attempts,
    leaseId: acquired.leaseId,
    leaseExpiresAt: acquired.leaseExpiresAt,
    firstSeenAt:
      timestampMillis(existing.firstSeenAt) === null ? now : existing.firstSeenAt,
    lastAttemptAt: now,
    lastError: null,
    failureKind: null,
    updatedAt: now,
  };
}

/**
 * Atomically acquire a delivery. A failed transient attempt is deliberately
 * reacquirable; a permanent failure is acknowledged without running again.
 * Legacy records from the old claim-only implementation are left untouched so
 * an operator can reconcile them against Stripe before replaying them.
 */
export async function acquireWebhookEvent(
  db: admin.firestore.Firestore,
  event: WebhookEventLike,
  options: WebhookStateOptions = {}
): Promise<WebhookAcquisition> {
  const nowFactory = options.now ?? (() => admin.firestore.Timestamp.now());
  const leaseDurationMs = options.leaseDurationMs ?? WEBHOOK_LEASE_DURATION_MS;
  if (!Number.isFinite(leaseDurationMs) || leaseDurationMs <= 0) {
    throw new Error("Invalid webhook lease duration");
  }

  const ref = db.collection(WEBHOOK_EVENT_COLLECTION).doc(event.id);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    const now = nowFactory();

    if (!snapshot.exists) {
      const acquired = newLease(now, 1, leaseDurationMs);
      transaction.create(ref, {
        eventId: event.id,
        eventType: event.type,
        type: event.type,
        status: acquired.outcome === "acquired" ? "processing" : acquired.outcome,
        attempts: acquired.attempts,
        leaseId: acquired.leaseId,
        leaseExpiresAt: acquired.leaseExpiresAt,
        firstSeenAt: now,
        receivedAt: now,
        lastAttemptAt: now,
        lastError: null,
        failureKind: null,
        updatedAt: now,
      });
      return acquired;
    }

    const existing = snapshot.data() ?? {};
    if (
      (existing.eventType && existing.eventType !== event.type) ||
      (existing.type && existing.type !== event.type)
    ) {
      return { outcome: "conflict" } as const;
    }

    if (
      existing.status !== "processing" &&
      existing.status !== "succeeded" &&
      existing.status !== "failed"
    ) {
      // The old implementation wrote only eventId/type/receivedAt. Do not
      // guess whether such a record's business work committed.
      return { outcome: "legacy" } as const;
    }

    if (existing.status === "succeeded") return { outcome: "succeeded" } as const;
    if (existing.status === "failed" && existing.failureKind === "permanent") {
      return { outcome: "failed", failureKind: "permanent" } as const;
    }

    const existingExpiry = timestampMillis(existing.leaseExpiresAt);
    if (
      existing.status === "processing" &&
      existingExpiry !== null &&
      existingExpiry > now.toMillis()
    ) {
      return {
        outcome: "processing",
        leaseExpiresAt: existing.leaseExpiresAt as admin.firestore.Timestamp,
      } as const;
    }

    // A missing lease timestamp is treated as expired rather than wedging the
    // event. Unknown/legacy records are handled above and are never overwritten.
    const acquired = newLease(now, safeAttempts(existing.attempts) + 1, leaseDurationMs);
    transaction.update(ref, leaseUpdate(event, now, acquired, existing));
    return acquired;
  });
}

export async function markWebhookSucceeded(
  db: admin.firestore.Firestore,
  eventId: string,
  leaseId: string,
  options: WebhookStateOptions = {}
): Promise<boolean> {
  const now = (options.now ?? (() => admin.firestore.Timestamp.now()))();
  const ref = db.collection(WEBHOOK_EVENT_COLLECTION).doc(eventId);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return false;

    const existing = snapshot.data() ?? {};
    if (existing.status === "succeeded") return true;
    if (existing.status !== "processing" || existing.leaseId !== leaseId) return false;

    transaction.update(ref, {
      status: "succeeded",
      leaseExpiresAt: null,
      leaseId: null,
      lastError: null,
      failureKind: null,
      succeededAt: now,
      updatedAt: now,
    });
    return true;
  });
}

export async function markWebhookFailed(
  db: admin.firestore.Firestore,
  eventId: string,
  leaseId: string,
  failureKind: WebhookFailureKind,
  error: unknown,
  options: WebhookStateOptions = {}
): Promise<boolean> {
  const now = (options.now ?? (() => admin.firestore.Timestamp.now()))();
  const ref = db.collection(WEBHOOK_EVENT_COLLECTION).doc(eventId);
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return false;

    const existing = snapshot.data() ?? {};
    if (existing.status !== "processing" || existing.leaseId !== leaseId) return false;

    transaction.update(ref, {
      status: "failed",
      leaseExpiresAt: null,
      leaseId: null,
      lastError: redactWebhookError(error),
      failureKind,
      failedAt: now,
      updatedAt: now,
    });
    return true;
  });
}

/**
 * Run one signed event under the state machine. The callback owns business
 * idempotency; this layer only coordinates delivery attempts and acknowledgement.
 */
export async function runWebhookEvent<T>(
  db: admin.firestore.Firestore,
  event: WebhookEventLike,
  process: (claim: AcquiredWebhookEvent) => Promise<T>,
  options: WebhookStateOptions = {}
): Promise<WebhookExecutionResult<T>> {
  let acquisition: WebhookAcquisition;
  try {
    acquisition = await acquireWebhookEvent(db, event, options);
  } catch {
    return {
      statusCode: 500,
      body: { error: "Idempotency claim failed." },
    };
  }

  switch (acquisition.outcome) {
    case "succeeded":
      return { statusCode: 200, body: { received: true, duplicate: true } };
    case "failed":
      return { statusCode: 200, body: { received: true, duplicate: true } };
    case "processing":
      return { statusCode: 409, body: { error: "Event is already being processed." } };
    case "legacy":
    case "conflict":
      return { statusCode: 409, body: { error: "Event requires reconciliation." } };
    case "acquired":
      break;
  }

  let value: T;
  try {
    value = await process(acquisition);
  } catch (error) {
    const failureKind: WebhookFailureKind = isPermanentWebhookError(error)
      ? "permanent"
      : "transient";
    try {
      options.onFailure?.(error, failureKind);
    } catch {
      // Observability must never prevent the failure state from being stored.
    }
    try {
      const marked = await markWebhookFailed(
        db,
        event.id,
        acquisition.leaseId,
        failureKind,
        error,
        options
      );
      if (!marked) {
        return { statusCode: 500, body: { error: "Webhook lease lost." } };
      }
    } catch {
      return { statusCode: 500, body: { error: "Webhook state update failed." } };
    }

    if (failureKind === "permanent") {
      // Invalid or unsupported signed events cannot be repaired by Stripe
      // retrying them. A durable failed record plus 200 prevents an endless
      // retry loop while preserving an operator-visible audit state.
      return { statusCode: 200, body: { received: true } };
    }

    return { statusCode: 500, body: { received: true, error: "Processing failed" } };
  }

  try {
    const marked = await markWebhookSucceeded(db, event.id, acquisition.leaseId, options);
    if (!marked) return { statusCode: 500, body: { error: "Webhook lease lost." } };
  } catch {
    // Do not acknowledge work whose terminal state was not durably recorded.
    // Stripe will retry after the lease expires, and business effects are
    // independently idempotent.
    return { statusCode: 500, body: { error: "Webhook state update failed." } };
  }

  return { statusCode: 200, body: { received: true }, value };
}

/** Stable IDs keep an outbox task idempotent without exposing event payload data. */
export function webhookStableId(...parts: string[]): string {
  const value = parts.join("\u001f");
  return `wh_${createHash("sha256").update(value).digest("hex")}`;
}
