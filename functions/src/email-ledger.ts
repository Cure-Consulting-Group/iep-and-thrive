/**
 * Durable email outbox/ledger.
 *
 * A deterministic key makes repeated scheduler runs converge on one record.
 * Provider delivery is still an external side effect, so a short lease keeps
 * concurrent workers from sending the same attempt while allowing a crashed
 * worker to be retried after the lease expires.
 */

import * as crypto from "crypto";
import * as admin from "firebase-admin";
import {
  EmailOptions,
  SendEmailResult,
  redactError,
  sendEmailWithResult,
} from "./email-service";

export type EmailLedgerStatus = "pending" | "delivered" | "failed" | "skipped";

export interface EmailLedgerKey {
  template: string;
  recipient: string;
  program: string;
  phase: string;
}

export interface EmailLedgerRecord {
  keyHash: string;
  template: string;
  recipientHash: string;
  program: string;
  phase: string;
  status: EmailLedgerStatus;
  attempts: number;
  providerMessageId: string | null;
  lastError: string | null;
  createdAt: unknown;
  updatedAt: unknown;
  deliveredAt?: unknown;
  failedAt?: unknown;
  skippedAt?: unknown;
}

export interface EmailLedgerClaim {
  claimed: boolean;
  attempt: number;
  record: EmailLedgerRecord;
}

export interface EmailLedgerStore {
  claim(key: EmailLedgerKey): Promise<EmailLedgerClaim>;
  markDelivered(key: EmailLedgerKey, attempt: number, providerMessageId: string | null): Promise<void>;
  markFailed(key: EmailLedgerKey, attempt: number, error: string): Promise<void>;
  markSkipped(key: EmailLedgerKey, attempt: number, reason: string): Promise<void>;
}

export interface LedgerDeliveryRequest {
  key: EmailLedgerKey;
  options: EmailOptions;
  timeoutMs?: number;
}

export interface LedgerDeliveryResult {
  ok: boolean;
  messageId: string | null;
  error?: string;
  status: EmailLedgerStatus;
  attempts: number;
}

const LEDGER_COLLECTION = "emailLedger";
const CLAIM_LEASE_MS = 5 * 60 * 1000;
const DEFAULT_SEND_TIMEOUT_MS = 30 * 1000;

function keyHash(key: EmailLedgerKey): string {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify([key.template, key.recipient, key.program, key.phase]))
    .digest("hex");
}

function recipientHash(recipient: string): string {
  return crypto.createHash("sha256").update(recipient.trim().toLowerCase()).digest("hex");
}

function timestampDate(value: unknown): Date | null {
  if (value instanceof Date) return value;
  if (value && typeof (value as { toDate?: unknown }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
}

function statusOf(value: unknown): EmailLedgerStatus {
  return value === "delivered" || value === "failed" || value === "skipped" || value === "pending"
    ? value
    : "pending";
}

function recordFromData(key: EmailLedgerKey, data: Record<string, unknown>): EmailLedgerRecord {
  return {
    keyHash: keyHash(key),
    template: key.template,
    recipientHash: recipientHash(key.recipient),
    program: key.program,
    phase: key.phase,
    status: statusOf(data.status),
    attempts: typeof data.attempts === "number" ? data.attempts : 0,
    providerMessageId: typeof data.providerMessageId === "string" ? data.providerMessageId : null,
    lastError: typeof data.lastError === "string" ? data.lastError : null,
    createdAt: data.createdAt ?? null,
    updatedAt: data.updatedAt ?? null,
    deliveredAt: data.deliveredAt,
    failedAt: data.failedAt,
    skippedAt: data.skippedAt,
  };
}

function pendingData(key: EmailLedgerKey, attempt: number): Record<string, unknown> {
  const now = new Date();
  return {
    keyHash: keyHash(key),
    template: key.template,
    // Store only a hash. The address/UID is used to derive the idempotency key,
    // but it should not be copied into operational records or logs.
    recipientHash: recipientHash(key.recipient),
    program: key.program,
    phase: key.phase,
    status: "pending",
    attempts: attempt,
    providerMessageId: null,
    lastError: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    leaseUntil: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + CLAIM_LEASE_MS)),
  };
}

/** Firestore implementation used by scheduled functions and HTTP handlers. */
export class FirestoreEmailLedger implements EmailLedgerStore {
  private readonly db: FirebaseFirestore.Firestore;

  constructor(db: FirebaseFirestore.Firestore = admin.firestore()) {
    this.db = db;
  }

  private ref(key: EmailLedgerKey): FirebaseFirestore.DocumentReference {
    return this.db.collection(LEDGER_COLLECTION).doc(keyHash(key));
  }

  async claim(key: EmailLedgerKey): Promise<EmailLedgerClaim> {
    const ref = this.ref(key);
    let claim: EmailLedgerClaim | undefined;
    const now = new Date();

    await this.db.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      const data = (snap.data() ?? {}) as Record<string, unknown>;
      const current = recordFromData(key, data);

      if (snap.exists && (current.status === "delivered" || current.status === "skipped")) {
        claim = { claimed: false, attempt: current.attempts, record: current };
        return;
      }

      const leaseUntil = timestampDate(data.leaseUntil);
      if (snap.exists && current.status === "pending" && leaseUntil && leaseUntil.getTime() > now.getTime()) {
        claim = { claimed: false, attempt: current.attempts, record: current };
        return;
      }

      const attempt = (current.attempts || 0) + 1;
      const next = pendingData(key, attempt);
      if (snap.exists) {
        // Preserve the original creation timestamp across retries; only the
        // attempt lease and delivery state change.
        delete next.createdAt;
        transaction.update(ref, next);
      }
      else transaction.create(ref, next);

      claim = {
        claimed: true,
        attempt,
        record: {
          ...recordFromData(key, next),
          createdAt: current.createdAt ?? next.createdAt,
          updatedAt: next.updatedAt,
        },
      };
    });

    if (!claim) throw new Error("email ledger claim did not complete");
    return claim;
  }

  async markDelivered(key: EmailLedgerKey, attempt: number, providerMessageId: string | null): Promise<void> {
    await this.finish(key, attempt, {
      status: "delivered",
      providerMessageId,
      lastError: null,
      deliveredAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async markFailed(key: EmailLedgerKey, attempt: number, error: string): Promise<void> {
    await this.finish(key, attempt, {
      status: "failed",
      lastError: redactError(error),
      failedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  async markSkipped(key: EmailLedgerKey, attempt: number, reason: string): Promise<void> {
    await this.finish(key, attempt, {
      status: "skipped",
      lastError: redactError(reason),
      skippedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }

  private async finish(
    key: EmailLedgerKey,
    attempt: number,
    fields: Record<string, unknown>
  ): Promise<void> {
    const ref = this.ref(key);
    await this.db.runTransaction(async (transaction) => {
      const snap = await transaction.get(ref);
      if (!snap.exists) throw new Error("email ledger record is missing");
      const data = (snap.data() ?? {}) as Record<string, unknown>;
      if (data.attempts !== attempt || data.status !== "pending") return;
      transaction.update(ref, {
        ...fields,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        leaseUntil: admin.firestore.FieldValue.delete(),
      });
    });
  }
}

/** Small deterministic store for unit tests and local orchestration checks. */
export class InMemoryEmailLedger implements EmailLedgerStore {
  private readonly records = new Map<string, EmailLedgerRecord>();
  private readonly leases = new Map<string, number>();

  async claim(key: EmailLedgerKey): Promise<EmailLedgerClaim> {
    const id = keyHash(key);
    const current = this.records.get(id);
    const now = Date.now();
    if (current && (current.status === "delivered" || current.status === "skipped")) {
      return { claimed: false, attempt: current.attempts, record: { ...current } };
    }
    if (current?.status === "pending" && (this.leases.get(id) ?? 0) > now) {
      return { claimed: false, attempt: current.attempts, record: { ...current } };
    }

    const attempt = (current?.attempts ?? 0) + 1;
    const nowDate = new Date(now);
    const next: EmailLedgerRecord = {
      keyHash: id,
      template: key.template,
      recipientHash: recipientHash(key.recipient),
      program: key.program,
      phase: key.phase,
      status: "pending",
      attempts: attempt,
      providerMessageId: null,
      lastError: null,
      createdAt: current?.createdAt ?? nowDate,
      updatedAt: nowDate,
    };
    this.records.set(id, next);
    this.leases.set(id, now + CLAIM_LEASE_MS);
    return { claimed: true, attempt, record: { ...next } };
  }

  async markDelivered(key: EmailLedgerKey, attempt: number, providerMessageId: string | null): Promise<void> {
    this.finish(key, attempt, { status: "delivered", providerMessageId, lastError: null, deliveredAt: new Date() });
  }

  async markFailed(key: EmailLedgerKey, attempt: number, error: string): Promise<void> {
    this.finish(key, attempt, { status: "failed", lastError: redactError(error), failedAt: new Date() });
  }

  async markSkipped(key: EmailLedgerKey, attempt: number, reason: string): Promise<void> {
    this.finish(key, attempt, { status: "skipped", lastError: redactError(reason), skippedAt: new Date() });
  }

  get(key: EmailLedgerKey): EmailLedgerRecord | undefined {
    const record = this.records.get(keyHash(key));
    return record ? { ...record } : undefined;
  }

  private finish(key: EmailLedgerKey, attempt: number, fields: Partial<EmailLedgerRecord>): void {
    const id = keyHash(key);
    const record = this.records.get(id);
    if (!record || record.attempts !== attempt || record.status !== "pending") return;
    Object.assign(record, fields, { updatedAt: new Date() });
    this.leases.delete(id);
  }
}

type EmailSender = (options: EmailOptions) => Promise<SendEmailResult | boolean>;

function normalizeResult(result: SendEmailResult | boolean): SendEmailResult {
  if (typeof result === "boolean") {
    return result
      ? { ok: true, messageId: null, status: "delivered" }
      : { ok: false, messageId: null, error: "provider_rejected", status: "failed" };
  }
  return result;
}

function isSkippedResult(result: SendEmailResult): boolean {
  return result.status === "skipped" ||
    result.error === "recipient_unsubscribed" ||
    result.error === "recipient_is_test" ||
    result.error === "recipient_preferences_missing" ||
    result.error === "recipient_preferences_unavailable";
}

function withTimeout<T>(operation: () => Promise<T>, timeoutMs: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("provider_timeout")), timeoutMs);
    try {
      operation().then(
        (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        (error) => {
          clearTimeout(timer);
          reject(error);
        }
      );
    } catch (error) {
      clearTimeout(timer);
      reject(error);
    }
  });
}

/**
 * Drive one idempotent delivery through an injected ledger. The injected store
 * makes failure and duplicate behavior testable without an emulator.
 */
export async function deliverEmailWithLedger(
  request: LedgerDeliveryRequest,
  store: EmailLedgerStore,
  sender: EmailSender,
): Promise<LedgerDeliveryResult> {
  const claim = await store.claim(request.key);
  if (!claim.claimed) {
    const terminal = claim.record.status === "delivered" || claim.record.status === "skipped";
    return {
      ok: claim.record.status === "delivered",
      messageId: claim.record.providerMessageId,
      error: terminal ? claim.record.lastError ?? undefined : "delivery_in_progress",
      status: claim.record.status,
      attempts: claim.record.attempts,
    };
  }

  let result: SendEmailResult;
  try {
    result = normalizeResult(
      await withTimeout(
        () => sender(request.options),
        request.timeoutMs ?? DEFAULT_SEND_TIMEOUT_MS
      )
    );
  } catch (error) {
    result = {
      ok: false,
      messageId: null,
      error: redactError(error),
      status: "failed",
    };
  }

  try {
    if (result.ok) {
      await store.markDelivered(request.key, claim.attempt, result.messageId);
      return { ...result, status: "delivered", attempts: claim.attempt };
    }
    if (isSkippedResult(result)) {
      await store.markSkipped(request.key, claim.attempt, result.error ?? "suppressed");
      return { ...result, status: "skipped", attempts: claim.attempt };
    }
    await store.markFailed(request.key, claim.attempt, result.error ?? "provider_rejected");
    return { ...result, status: "failed", attempts: claim.attempt };
  } catch (error) {
    // A provider success without a durable ledger success is not safe to count
    // as delivered, so callers must leave their phase/counter unchanged.
    return {
      ok: false,
      messageId: null,
      error: "ledger_write_failed",
      status: "failed",
      attempts: claim.attempt,
    };
  }
}

/** Production convenience wrapper around the Firestore ledger and email service. */
export async function deliverEmail(request: LedgerDeliveryRequest): Promise<LedgerDeliveryResult> {
  return deliverEmailWithLedger(request, new FirestoreEmailLedger(), sendEmailWithResult);
}
