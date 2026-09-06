/**
 * Stripe Webhook Cloud Function
 *
 * Originally handled `checkout.session.completed` to auto-enroll parents
 * paying a one-time deposit/balance. H4 extends it to handle the tutoring
 * subscription lifecycle:
 *
 *   - customer.subscription.created   → write users/{uid}.subscription per
 *                                       SubscriptionState; send welcome email
 *   - customer.subscription.updated   → patch state (status, periodEnd,
 *                                       cancelAtPeriodEnd); send the matching
 *                                       email when the status transitions to
 *                                       paused / past_due / canceled
 *   - customer.subscription.deleted   → status='canceled'; send canceled email
 *   - invoice.paid (subscription_cycle) → reset sessionsUsedThisCycle, update
 *                                         period, send monthly receipt
 *   - invoice.payment_failed          → status='past_due', send recover email
 *
 * Delivery state: webhookEventLog/{event.id} is acquired atomically, remains
 * processing while a lease is held, and is marked succeeded only after the
 * billing effect is durable. Transient failures are marked failed and return
 * 5xx so Stripe retries; permanent invalid events are marked failed and return
 * 200 because another provider retry cannot repair them.
 *
 * The existing one-time payment business result (cohort deposits/balances)
 * remains intact; its mutation is now transactionally paired with its ledger
 * and outbox records.
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { sendEmailWithResult, logEmail } from "./email-service";
import type { EmailTemplateType, SendEmailResult } from "./email-service";
import {
  depositConfirmationTemplate,
  balanceConfirmationTemplate,
  operatorPaymentNotificationTemplate,
} from "./stripe-webhook-emails";
import { renderEmail } from "./email-templates";
import {
  subscriptionWelcomeTemplate,
  subscriptionMonthlyReceiptTemplate,
  subscriptionPausedTemplate,
  subscriptionCanceledTemplate,
  subscriptionPastDueTemplate,
} from "./lifecycle-email-templates";
import type {
  SubscriptionState,
  SubscriptionStatus,
  SubscriptionTier,
} from "./subscription-types";
import { tierPrice } from "./subscription-types";
import {
  PermanentWebhookError,
  RetryableWebhookError,
  WEBHOOK_LEASE_DURATION_MS,
  WEBHOOK_OUTBOX_COLLECTION,
  WEBHOOK_BILLING_EFFECT_COLLECTION,
  redactWebhookError,
  runWebhookEvent,
  webhookStableId,
} from "./webhook-state";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

const programLabels: Record<string, string> = {
  full: "Full Academic Intensive",
  reading: "Reading & Language Intensive",
  math: "Math & Numeracy Intensive",
};

// ────────────────────────────────────────────────────────────────────────
//   Subscription helpers
// ────────────────────────────────────────────────────────────────────────

function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return value === "weekly" || value === "twice-weekly";
}

/**
 * Map the Stripe subscription status to our reduced set. Stripe has a
 * larger set (trialing, unpaid, incomplete_expired, etc.). We collapse
 * everything we don't explicitly handle into 'incomplete'.
 */
function mapStripeStatus(s: Stripe.Subscription.Status): SubscriptionStatus {
  if (s === "active" || s === "trialing") return "active";
  if (s === "past_due") return "past_due";
  if (s === "paused") return "paused";
  if (s === "canceled" || s === "incomplete_expired" || s === "unpaid") return "canceled";
  return "incomplete";
}

function unixToISO(epoch: number | null | undefined): string {
  if (!epoch) return "";
  return new Date(epoch * 1000).toISOString();
}

function tierFromSubscription(sub: Stripe.Subscription): SubscriptionTier | null {
  // Prefer the metadata stamped at checkout creation by H3.
  const fromMeta = sub.metadata?.plan;
  if (isSubscriptionTier(fromMeta)) return fromMeta;

  // Fallback: match the price ID against the configured env vars.
  const priceId = sub.items?.data?.[0]?.price?.id;
  if (priceId) {
    if (priceId === process.env.STRIPE_TUTORING_WEEKLY_PRICE_ID) return "weekly";
    if (priceId === process.env.STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID) return "twice-weekly";
  }
  return null;
}

interface SubscriptionPeriod {
  startEpoch: number | null;
  endEpoch: number | null;
}

/**
 * Stripe types changed location for current_period_start/end across
 * recent API versions. Read defensively from both `.current_period_*`
 * (legacy) and the `items.data[0]` shape (current at time of writing).
 */
function readSubscriptionPeriod(sub: Stripe.Subscription): SubscriptionPeriod {
  const root = sub as unknown as Record<string, unknown>;
  const startRoot = typeof root.current_period_start === "number" ? (root.current_period_start as number) : null;
  const endRoot = typeof root.current_period_end === "number" ? (root.current_period_end as number) : null;
  const item = sub.items?.data?.[0] as unknown as Record<string, unknown> | undefined;
  const startItem = item && typeof item.current_period_start === "number" ? (item.current_period_start as number) : null;
  const endItem = item && typeof item.current_period_end === "number" ? (item.current_period_end as number) : null;
  return {
    startEpoch: startRoot ?? startItem,
    endEpoch: endRoot ?? endItem,
  };
}

/**
 * Look up the parent's Firestore uid for a Stripe customerId. Falls back
 * to clientReferenceId (set by H3 at checkout) when the user document
 * doesn't yet have a stripeCustomerId field on file.
 */
async function findUidForCustomer(
  db: admin.firestore.Firestore,
  customerId: string | null,
  clientReferenceId?: string | null
): Promise<string | null> {
  if (clientReferenceId) {
    const direct = await db.collection("users").doc(clientReferenceId).get();
    if (direct.exists) return clientReferenceId;
  }

  if (customerId) {
    const q = await db
      .collection("users")
      .where("stripeCustomerId", "==", customerId)
      .limit(1)
      .get();
    if (!q.empty) return q.docs[0].id;
  }

  return null;
}

type WebhookResponseLike = {
  status: (n: number) => { json: (body: unknown) => void };
};

type FirestoreWrite =
  | {
      operation: "create";
      ref: admin.firestore.DocumentReference;
      data: Record<string, unknown>;
    }
  | {
      operation: "update";
      ref: admin.firestore.DocumentReference;
      data: Record<string, unknown>;
    }
  | {
      operation: "set";
      ref: admin.firestore.DocumentReference;
      data: Record<string, unknown>;
      options?: admin.firestore.SetOptions;
    };

interface EmailOutboxInput {
  taskKey: string;
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  templateType: EmailTemplateType;
  recipientUid?: string;
}

interface BillingEffectPlan {
  writes: FirestoreWrite[];
  emails: EmailOutboxInput[];
}

/**
 * A business-effect ledger is separate from webhookEventLog. Its document and
 * the billing writes/outbox records are committed in one transaction, so a
 * retry cannot apply a second payment transition even if the delivery claim
 * was lost after the transaction committed.
 */
async function runAtomicBillingEffect(
  db: admin.firestore.Firestore,
  event: Stripe.Event,
  effectKey: string,
  build: (
    transaction: admin.firestore.Transaction,
    now: admin.firestore.Timestamp
  ) => Promise<BillingEffectPlan>
): Promise<void> {
  await db.runTransaction(async (transaction) => {
    const effectRef = db
      .collection(WEBHOOK_BILLING_EFFECT_COLLECTION)
      .doc(webhookStableId(effectKey));
    const effectSnapshot = await transaction.get(effectRef);
    if (effectSnapshot.exists) return;

    const now = admin.firestore.Timestamp.now();
    // `build` only reads and returns staged writes. All Firestore writes happen
    // below, after the outbox existence reads, to satisfy transaction ordering.
    const plan = await build(transaction, now);
    const outboxRefs = plan.emails.map((email) =>
      db
        .collection(WEBHOOK_OUTBOX_COLLECTION)
        .doc(webhookStableId(effectKey, email.taskKey))
    );
    const outboxSnapshots = outboxRefs.length
      ? await transaction.getAll(...outboxRefs)
      : [];

    for (const write of plan.writes) {
      if (write.operation === "create") transaction.create(write.ref, write.data);
      else if (write.operation === "update") transaction.update(write.ref, write.data);
      else transaction.set(write.ref, write.data, write.options ?? { merge: true });
    }

    transaction.create(effectRef, {
      effectKey,
      eventId: event.id,
      eventType: event.type,
      status: "applied",
      appliedAt: now,
      updatedAt: now,
    });

    for (let index = 0; index < plan.emails.length; index += 1) {
      if (outboxSnapshots[index]?.exists) continue;
      const email = plan.emails[index];
      transaction.create(outboxRefs[index], {
        effectKey,
        eventId: event.id,
        eventType: event.type,
        taskKey: email.taskKey,
        channel: "email",
        status: "pending",
        attempts: 0,
        leaseId: null,
        leaseExpiresAt: null,
        firstSeenAt: now,
        lastError: null,
        to: email.to,
        subject: email.subject,
        htmlBody: email.htmlBody,
        textBody: email.textBody ?? null,
        templateType: email.templateType,
        recipientUid: email.recipientUid ?? null,
        updatedAt: now,
      });
    }
  });

  // Email delivery is deliberately best-effort after the billing transaction.
  // A provider failure leaves a durable outbox task and never causes billing to
  // be rolled back or retried by Stripe.
  await dispatchEmailOutboxForEffect(db, effectKey);
}

function timestampMillis(value: unknown): number | null {
  if (value instanceof admin.firestore.Timestamp) return value.toMillis();
  if (value && typeof value === "object") {
    const candidate = value as { toMillis?: () => number; seconds?: number; _seconds?: number };
    if (typeof candidate.toMillis === "function") return candidate.toMillis();
    const seconds = candidate.seconds ?? candidate._seconds;
    if (typeof seconds === "number") return seconds * 1000;
  }
  return null;
}

async function claimEmailOutboxTask(
  db: admin.firestore.Firestore,
  ref: admin.firestore.DocumentReference
): Promise<{ task: Record<string, unknown>; leaseId: string } | null> {
  return db.runTransaction(async (transaction) => {
    const snapshot = await transaction.get(ref);
    if (!snapshot.exists) return null;

    const task = snapshot.data() ?? {};
    if (task.status === "sent") return null;
    const now = admin.firestore.Timestamp.now();
    const expiresAt = timestampMillis(task.leaseExpiresAt);
    if (task.status === "processing" && expiresAt !== null && expiresAt > now.toMillis()) {
      return null;
    }

    const attempts =
      typeof task.attempts === "number" && Number.isInteger(task.attempts) && task.attempts >= 0
        ? task.attempts + 1
        : 1;
    const leaseId = webhookStableId(ref.id, String(now.toMillis()), String(attempts));
    transaction.update(ref, {
      status: "processing",
      attempts,
      leaseId,
      leaseExpiresAt: admin.firestore.Timestamp.fromMillis(
        now.toMillis() + WEBHOOK_LEASE_DURATION_MS
      ),
      updatedAt: now,
    });
    return { task, leaseId };
  });
}

async function finishEmailOutboxTask(
  db: admin.firestore.Firestore,
  ref: admin.firestore.DocumentReference,
  leaseId: string,
  result: SendEmailResult
): Promise<void> {
  try {
    await db.runTransaction(async (transaction) => {
      const snapshot = await transaction.get(ref);
      if (!snapshot.exists) return;
      const task = snapshot.data() ?? {};
      if (task.status !== "processing" || task.leaseId !== leaseId) return;
      const now = admin.firestore.Timestamp.now();
      transaction.update(ref, {
        status: result.ok ? "sent" : "failed",
        leaseId: null,
        leaseExpiresAt: null,
        providerMessageId: result.messageId ?? null,
        lastError: result.ok ? null : redactWebhookError(new Error(result.error ?? "Email delivery failed")),
        deliveredAt: result.ok ? now : null,
        updatedAt: now,
      });
    });
  } catch (error) {
    console.error("[StripeWebhook] Email outbox state update failed:", redactWebhookError(error));
  }
}

async function dispatchEmailOutboxTask(
  db: admin.firestore.Firestore,
  ref: admin.firestore.DocumentReference
): Promise<void> {
  const claimed = await claimEmailOutboxTask(db, ref);
  if (!claimed) return;

  const task = claimed.task;
  let result: SendEmailResult;
  try {
    result = await sendEmailWithResult({
      to: String(task.to ?? ""),
      subject: String(task.subject ?? ""),
      htmlBody: String(task.htmlBody ?? ""),
      textBody: typeof task.textBody === "string" ? task.textBody : undefined,
      kind: "transactional",
      recipientUid: typeof task.recipientUid === "string" ? task.recipientUid : undefined,
    });
  } catch (error) {
    result = {
      ok: false,
      messageId: null,
      error: redactWebhookError(error),
    };
  }

  try {
    const redactedEmailError = result.error
      ? redactWebhookError(new Error(result.error))
      : undefined;
    await logEmail(
      String(task.to ?? ""),
      String(task.subject ?? ""),
      (task.templateType as EmailTemplateType) || "general",
      result.ok,
      {
        messageId: result.messageId,
        error: redactedEmailError,
        meta: {
          source: "stripe-webhook-outbox",
          effectKey: task.effectKey,
          eventId: task.eventId,
          taskKey: task.taskKey,
        },
      }
    );
  } catch (error) {
    // `logEmail` is already fail-safe, but keep the billing path isolated if
    // its implementation ever changes.
    console.error("[StripeWebhook] Email audit failed:", redactWebhookError(error));
  }

  await finishEmailOutboxTask(db, ref, claimed.leaseId, result);
  if (!result.ok) {
    console.warn(
      `[StripeWebhook] Email outbox task failed: ${ref.id}; billing effect remains committed`
    );
  }
}

async function dispatchEmailOutboxForEffect(
  db: admin.firestore.Firestore,
  effectKey: string
): Promise<void> {
  try {
    const snapshot = await db
      .collection(WEBHOOK_OUTBOX_COLLECTION)
      .where("effectKey", "==", effectKey)
      .get();
    for (const task of snapshot.docs) await dispatchEmailOutboxTask(db, task.ref);
  } catch (error) {
    console.error("[StripeWebhook] Email outbox dispatch failed:", redactWebhookError(error));
  }
}

// ────────────────────────────────────────────────────────────────────────
//   Per-event handlers
// ────────────────────────────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  res: WebhookResponseLike
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;

  // SUBSCRIPTION MODE: H4 hands off to subscription.created which carries
  // the full subscription object. Here we just persist the customer id
  // mapping so customer-portal lookups work even if the subscription
  // event lands first.
  if (session.mode === "subscription") {
    const uid = (session.client_reference_id as string | null) || null;
    const customerId =
      typeof session.customer === "string"
        ? session.customer
        : session.customer?.id || null;
    if (!uid || !customerId) {
      throw new PermanentWebhookError(
        "invalid_subscription_checkout",
        "Subscription checkout is missing its account or customer reference."
      );
    }

    const db = admin.firestore();
    await runAtomicBillingEffect(
      db,
      event,
      `checkout.session.completed:${session.id}`,
      async (_transaction, now) => ({
        writes: [
          {
            operation: "set",
            ref: db.collection("users").doc(uid),
            data: {
              stripeCustomerId: customerId,
              updatedAt: now,
            },
            options: { merge: true },
          },
        ],
        emails: [],
      })
    );
    res.status(200).json({ received: true });
    return;
  }

  // ── Original one-time payment flow (cohort deposit / balance) ──
  const program = session.metadata?.program || "unknown";
  const paymentType = session.metadata?.payment_type || "deposit";
  const programLabel =
    session.metadata?.program_label || programLabels[program] || program;

  const customerEmail = session.customer_details?.email;
  const customerName = session.customer_details?.name || "Parent/Guardian";

  if (!customerEmail) {
    throw new PermanentWebhookError(
      "missing_customer_email",
      "Checkout session has no customer email for payment association."
    );
  }

  const amountTotal = session.amount_total
    ? `$${(session.amount_total / 100).toFixed(2)}`
    : "N/A";

  const db = admin.firestore();
  const isDeposit = paymentType === "deposit";
  const isBalance = paymentType === "balance";
  if (!isDeposit && !isBalance) {
    throw new PermanentWebhookError(
      "invalid_payment_type",
      "Checkout session has an unsupported payment type."
    );
  }

  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id || null;
  const usersRef = db.collection("users");

  await runAtomicBillingEffect(
    db,
    event,
    `checkout.session.completed:${session.id}`,
    async (transaction, now) => {
      const existingQuery = await transaction.get(
        usersRef.where("email", "==", customerEmail).limit(1)
      );
      const pipelineQuery = await transaction.get(
        db.collection("enrollmentInquiries").where("email", "==", customerEmail).limit(1)
      );

      const paymentData: Record<string, unknown> = {
        email: customerEmail,
        displayName: customerName,
        program,
        programLabel,
        paymentType,
        stripeSessionId: session.id,
        stripePaymentIntentId: paymentIntentId,
        updatedAt: now,
      };

      if (isDeposit) {
        paymentData.depositPaid = true;
        paymentData.depositPaidAt = now;
        paymentData.status = "enrolled";
        paymentData.enrolledAt = now;
      }

      if (isBalance) {
        paymentData.balancePaid = true;
        paymentData.balancePaidAt = now;
        paymentData.status = "paid_in_full";
      }

      const writes: FirestoreWrite[] = [];
      if (!existingQuery.empty) {
        const userDoc = existingQuery.docs[0];
        if (userDoc.data().enrolledAt && isDeposit) delete paymentData.enrolledAt;
        writes.push({ operation: "update", ref: userDoc.ref, data: paymentData });
      } else {
        const userDocRef = usersRef.doc();
        writes.push({
          operation: "create",
          ref: userDocRef,
          data: { ...paymentData, createdAt: now },
        });
      }

      if (!pipelineQuery.empty) {
        writes.push({
          operation: "update",
          ref: pipelineQuery.docs[0].ref,
          data: {
            status: isBalance ? "paid_in_full" : "deposit_paid",
            stripeSessionId: session.id,
            paymentReceivedAt: now,
          },
        });
      }

      const emails: EmailOutboxInput[] = [];
      if (isDeposit) {
        const template = depositConfirmationTemplate({
          name: customerName,
          program: programLabel,
          amount: amountTotal,
        });
        emails.push({
          taskKey: "parent:deposit_confirmation",
          to: customerEmail,
          subject: template.subject,
          htmlBody: template.html,
          templateType: "deposit_confirmation",
        });
      } else {
        const template = balanceConfirmationTemplate({
          name: customerName,
          program: programLabel,
          amount: amountTotal,
        });
        emails.push({
          taskKey: "parent:balance_confirmation",
          to: customerEmail,
          subject: template.subject,
          htmlBody: template.html,
          templateType: "balance_confirmation",
        });
      }

      const operatorEmail = process.env.OPERATOR_EMAIL || "hello@iepandthrive.com";
      const notifTemplate = operatorPaymentNotificationTemplate({
        name: customerName,
        email: customerEmail,
        program: programLabel,
        type: paymentType,
        amount: amountTotal,
        sessionId: session.id,
      });
      emails.push({
        taskKey: "operator:payment_notification",
        to: operatorEmail,
        subject: notifTemplate.subject,
        htmlBody: notifTemplate.html,
        templateType: "operator_payment_notification",
      });

      return { writes, emails };
    }
  );

  console.log(
    `[StripeWebhook] Processed ${paymentType} checkout session ${session.id}`
  );
  res.status(200).json({ received: true });
}

async function handleSubscriptionCreated(
  event: Stripe.Event,
  res: WebhookResponseLike
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const tier = tierFromSubscription(sub);
  if (!tier) {
    throw new PermanentWebhookError(
      "unknown_subscription_tier",
      "Subscription event has no supported tutoring tier."
    );
  }

  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;

  // metadata.uid is set by H3; client_reference_id falls through via
  // checkout.session.completed (handled above), so by this point users/{uid}
  // typically already has stripeCustomerId.
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid =
    uidFromMeta || (await findUidForCustomer(db, customerId, uidFromMeta));

  if (!uid) {
    throw new RetryableWebhookError(
      "subscription_account_not_ready",
      "Subscription event cannot yet be associated with a user account."
    );
  }

  const period = readSubscriptionPeriod(sub);
  const status = mapStripeStatus(sub.status);
  const allowance = tierPrice(tier).sessionsPerCycle;

  await runAtomicBillingEffect(
    db,
    event,
    `customer.subscription.created:${sub.id}`,
    async (transaction, now) => {
      const userRef = db.collection("users").doc(uid);
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw new RetryableWebhookError(
          "subscription_user_not_ready",
          "Resolved subscription user document is not available yet."
        );
      }
      const userData = userSnapshot.data() ?? {};
      const parentName =
        (userData.displayName as string | undefined) ||
        (userData.parentName as string | undefined) ||
        "Parent";
      const parentEmail = (userData.email as string | undefined) || "";
      const studentName = (userData.studentName as string | undefined) || "";

      const state: Omit<SubscriptionState, "createdAt" | "updatedAt"> & {
        createdAt: admin.firestore.Timestamp;
        updatedAt: admin.firestore.Timestamp;
      } = {
        tier,
        status,
        stripeCustomerId: customerId || "",
        stripeSubscriptionId: sub.id,
        currentPeriodStart: unixToISO(period.startEpoch),
        currentPeriodEnd: unixToISO(period.endEpoch),
        sessionsAllowedPerCycle: allowance,
        sessionsUsedThisCycle: 0,
        cancelAtPeriodEnd: !!sub.cancel_at_period_end,
        createdAt: now,
        updatedAt: now,
      };

      const emails: EmailOutboxInput[] = [];
      if (parentEmail) {
        const tpl = subscriptionWelcomeTemplate({
          tier,
          parentName,
          studentName,
          sessionsAllowed: allowance,
        });
        const rendered = renderEmail({
          subject: tpl.subject,
          layout: tpl.layout,
          recipientUid: uid,
        });
        emails.push({
          taskKey: "parent:subscription_welcome",
          to: parentEmail,
          subject: rendered.subject,
          htmlBody: rendered.html,
          textBody: rendered.text,
          templateType: "general",
          recipientUid: uid,
        });
      }

      return {
        writes: [
          {
            operation: "set",
            ref: userRef,
            data: {
              stripeCustomerId: customerId || admin.firestore.FieldValue.delete(),
              subscription: state,
              updatedAt: now,
            },
            options: { merge: true },
          },
        ],
        emails,
      };
    }
  );

  console.log(`[StripeWebhook] subscription.created — uid=${uid} tier=${tier}`);
  res.status(200).json({ received: true });
}

async function handleSubscriptionUpdated(
  event: Stripe.Event,
  res: WebhookResponseLike
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const tier = tierFromSubscription(sub);
  if (!tier) {
    throw new PermanentWebhookError(
      "unknown_subscription_tier",
      "Subscription event has no supported tutoring tier."
    );
  }

  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid = uidFromMeta || (await findUidForCustomer(db, customerId));

  if (!uid) {
    throw new RetryableWebhookError(
      "subscription_account_not_ready",
      "Subscription event cannot yet be associated with a user account."
    );
  }

  const userRef = db.collection("users").doc(uid);
  const period = readSubscriptionPeriod(sub);
  const status = mapStripeStatus(sub.status);
  const allowance = tierPrice(tier).sessionsPerCycle;

  await runAtomicBillingEffect(
    db,
    event,
    `customer.subscription.updated:${event.id}`,
    async (transaction, now) => {
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw new RetryableWebhookError(
          "subscription_user_not_ready",
          "Resolved subscription user document is not available yet."
        );
      }
      const userData = userSnapshot.data() ?? {};
      const previous = (userData.subscription || null) as SubscriptionState | null;
      const previousStatus = previous?.status;
      const parentName =
        (userData.displayName as string | undefined) ||
        (userData.parentName as string | undefined) ||
        "Parent";
      const parentEmail = (userData.email as string | undefined) || "";
      const studentName = (userData.studentName as string | undefined) || "";

      // Patch (don't overwrite sessionsUsedThisCycle — that's owned by the
      // booking flow + invoice.paid renewal handler).
      const patch: Record<string, unknown> = {
        "subscription.tier": tier,
        "subscription.status": status,
        "subscription.stripeCustomerId": customerId || "",
        "subscription.stripeSubscriptionId": sub.id,
        "subscription.currentPeriodStart": unixToISO(period.startEpoch),
        "subscription.currentPeriodEnd": unixToISO(period.endEpoch),
        "subscription.sessionsAllowedPerCycle": allowance,
        "subscription.cancelAtPeriodEnd": !!sub.cancel_at_period_end,
        "subscription.updatedAt": now,
        updatedAt: now,
      };

      if (!previous) {
        patch["subscription.createdAt"] = now;
        patch["subscription.sessionsUsedThisCycle"] = 0;
      }

      type TemplateFn = (vars: Parameters<typeof subscriptionPausedTemplate>[0]) => {
        subject: string;
        layout: Parameters<typeof renderEmail>[0]["layout"];
      };
      let template: { fn: TemplateFn; meta: string } | null = null;
      if (status !== previousStatus) {
        if (status === "paused") {
          template = { fn: subscriptionPausedTemplate, meta: "subscription_paused" };
        } else if (status === "past_due") {
          template = { fn: subscriptionPastDueTemplate, meta: "subscription_past_due" };
        } else if (status === "canceled") {
          template = { fn: subscriptionCanceledTemplate, meta: "subscription_canceled" };
        }
      }

      const emails: EmailOutboxInput[] = [];
      if (template && parentEmail) {
        const tpl = template.fn({
          tier,
          parentName,
          studentName,
          cycleEndISO: unixToISO(period.endEpoch),
        });
        const rendered = renderEmail({
          subject: tpl.subject,
          layout: tpl.layout,
          recipientUid: uid,
        });
        emails.push({
          taskKey: `parent:${template.meta}`,
          to: parentEmail,
          subject: rendered.subject,
          htmlBody: rendered.html,
          textBody: rendered.text,
          templateType: "general",
          recipientUid: uid,
        });
      }

      return {
        writes: [{ operation: "set", ref: userRef, data: patch, options: { merge: true } }],
        emails,
      };
    }
  );

  console.log(
    `[StripeWebhook] subscription.updated — uid=${uid} tier=${tier} status=${status}`
  );
  res.status(200).json({ received: true });
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  res: WebhookResponseLike
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const tier = tierFromSubscription(sub);
  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid = uidFromMeta || (await findUidForCustomer(db, customerId));

  if (!uid) {
    throw new RetryableWebhookError(
      "subscription_account_not_ready",
      "Subscription deletion cannot yet be associated with a user account."
    );
  }

  const period = readSubscriptionPeriod(sub);
  const cycleEndISO = unixToISO(period.endEpoch);

  await runAtomicBillingEffect(
    db,
    event,
    `customer.subscription.deleted:${sub.id}`,
    async (transaction, now) => {
      const userRef = db.collection("users").doc(uid);
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw new RetryableWebhookError(
          "subscription_user_not_ready",
          "Resolved subscription user document is not available yet."
        );
      }
      const userData = userSnapshot.data() ?? {};
      const previous = (userData.subscription || null) as SubscriptionState | null;
      const parentName =
        (userData.displayName as string | undefined) ||
        (userData.parentName as string | undefined) ||
        "Parent";
      const parentEmail = (userData.email as string | undefined) || "";
      const studentName = (userData.studentName as string | undefined) || "";
      const emails: EmailOutboxInput[] = [];

      if (tier && parentEmail && previous?.status !== "canceled") {
        const tpl = subscriptionCanceledTemplate({
          tier,
          parentName,
          studentName,
          cycleEndISO,
        });
        const rendered = renderEmail({
          subject: tpl.subject,
          layout: tpl.layout,
          recipientUid: uid,
        });
        emails.push({
          taskKey: "parent:subscription_canceled",
          to: parentEmail,
          subject: rendered.subject,
          htmlBody: rendered.html,
          textBody: rendered.text,
          templateType: "general",
          recipientUid: uid,
        });
      }

      return {
        writes: [
          {
            operation: "set",
            ref: userRef,
            data: {
              subscription: {
                ...(tier ? { tier } : {}),
                status: "canceled",
                stripeSubscriptionId: sub.id,
                cancelAtPeriodEnd: false,
                currentPeriodEnd: cycleEndISO,
                updatedAt: now,
              },
              updatedAt: now,
            },
            options: { merge: true },
          },
        ],
        emails,
      };
    }
  );

  console.log(`[StripeWebhook] subscription.deleted — uid=${uid}`);
  res.status(200).json({ received: true });
}

async function handleInvoicePaid(
  event: Stripe.Event,
  res: WebhookResponseLike
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  // Only act on subscription RENEWALS — initial invoice (the one created at
  // checkout) gets its session handled by checkout.session.completed +
  // subscription.created. We use Stripe's billing_reason to differentiate.
  const billingReason = invoice.billing_reason;
  if (billingReason !== "subscription_cycle") {
    console.log(
      `[StripeWebhook] invoice.paid skipped — billing_reason=${billingReason} (not a renewal)`
    );
    res.status(200).json({ received: true });
    return;
  }

  // Resolve subscription id (typed as expandable across API versions).
  const subId =
    typeof (invoice as unknown as { subscription?: unknown }).subscription === "string"
      ? ((invoice as unknown as { subscription: string }).subscription)
      : ((invoice as unknown as { subscription?: { id?: string } }).subscription?.id || null);

  if (!subId) {
    throw new PermanentWebhookError(
      "missing_invoice_subscription",
      "Renewal invoice has no subscription reference."
    );
  }

  const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new RetryableWebhookError(
      "stripe_not_configured",
      "Stripe configuration is unavailable for invoice reconciliation."
    );
  }
  const stripe = new Stripe(stripeKey);
  const sub = await stripe.subscriptions.retrieve(subId);
  const tier = tierFromSubscription(sub);
  if (!tier) {
    throw new PermanentWebhookError(
      "unknown_subscription_tier",
      "Renewal invoice subscription has no supported tutoring tier."
    );
  }

  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid = uidFromMeta || (await findUidForCustomer(db, customerId));

  if (!uid) {
    throw new RetryableWebhookError(
      "subscription_account_not_ready",
      "Renewal invoice cannot yet be associated with a user account."
    );
  }

  const period = readSubscriptionPeriod(sub);
  const allowance = tierPrice(tier).sessionsPerCycle;
  const status = mapStripeStatus(sub.status);

  await runAtomicBillingEffect(
    db,
    event,
    `invoice.paid:${invoice.id}`,
    async (transaction, now) => {
      const userRef = db.collection("users").doc(uid);
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw new RetryableWebhookError(
          "subscription_user_not_ready",
          "Resolved subscription user document is not available yet."
        );
      }
      const userData = userSnapshot.data() ?? {};
      const parentName =
        (userData.displayName as string | undefined) ||
        (userData.parentName as string | undefined) ||
        "Parent";
      const parentEmail = (userData.email as string | undefined) || "";
      const studentName = (userData.studentName as string | undefined) || "";
      const emails: EmailOutboxInput[] = [];

      if (parentEmail) {
        const amountPaid = invoice.amount_paid
          ? `$${(invoice.amount_paid / 100).toFixed(2)}`
          : undefined;
        const tpl = subscriptionMonthlyReceiptTemplate({
          tier,
          parentName,
          studentName,
          sessionsAllowed: allowance,
          sessionsRemaining: allowance,
          cycleEndISO: unixToISO(period.endEpoch),
          amountPaid,
        });
        const rendered = renderEmail({
          subject: tpl.subject,
          layout: tpl.layout,
          recipientUid: uid,
        });
        emails.push({
          taskKey: "parent:subscription_monthly_receipt",
          to: parentEmail,
          subject: rendered.subject,
          htmlBody: rendered.html,
          textBody: rendered.text,
          templateType: "general",
          recipientUid: uid,
        });
      }

      return {
        writes: [
          {
            operation: "set",
            ref: userRef,
            data: {
              subscription: {
                tier,
                status,
                stripeCustomerId: customerId || "",
                stripeSubscriptionId: sub.id,
                currentPeriodStart: unixToISO(period.startEpoch),
                currentPeriodEnd: unixToISO(period.endEpoch),
                sessionsAllowedPerCycle: allowance,
                sessionsUsedThisCycle: 0,
                cancelAtPeriodEnd: !!sub.cancel_at_period_end,
                updatedAt: now,
              },
              updatedAt: now,
            },
            options: { merge: true },
          },
        ],
        emails,
      };
    }
  );

  console.log(`[StripeWebhook] invoice.paid (renewal) — uid=${uid} tier=${tier}`);
  res.status(200).json({ received: true });
}

async function handleInvoicePaymentFailed(
  event: Stripe.Event,
  res: WebhookResponseLike
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  const subId =
    typeof (invoice as unknown as { subscription?: unknown }).subscription === "string"
      ? ((invoice as unknown as { subscription: string }).subscription)
      : ((invoice as unknown as { subscription?: { id?: string } }).subscription?.id || null);

  if (!subId) {
    throw new PermanentWebhookError(
      "missing_invoice_subscription",
      "Failed invoice has no subscription reference."
    );
  }

  const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    throw new RetryableWebhookError(
      "stripe_not_configured",
      "Stripe configuration is unavailable for payment recovery."
    );
  }
  const stripe = new Stripe(stripeKey);
  const sub = await stripe.subscriptions.retrieve(subId);
  const tier = tierFromSubscription(sub);

  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid = uidFromMeta || (await findUidForCustomer(db, customerId));

  if (!uid) {
    throw new RetryableWebhookError(
      "subscription_account_not_ready",
      "Failed invoice cannot yet be associated with a user account."
    );
  }

  await runAtomicBillingEffect(
    db,
    event,
    `invoice.payment_failed:${invoice.id}`,
    async (transaction, now) => {
      const userRef = db.collection("users").doc(uid);
      const userSnapshot = await transaction.get(userRef);
      if (!userSnapshot.exists) {
        throw new RetryableWebhookError(
          "subscription_user_not_ready",
          "Resolved subscription user document is not available yet."
        );
      }
      const userData = userSnapshot.data() ?? {};
      const previous = (userData.subscription || null) as SubscriptionState | null;
      const parentName =
        (userData.displayName as string | undefined) ||
        (userData.parentName as string | undefined) ||
        "Parent";
      const parentEmail = (userData.email as string | undefined) || "";
      const studentName = (userData.studentName as string | undefined) || "";
      const emails: EmailOutboxInput[] = [];

      if (tier && parentEmail && previous?.status !== "past_due") {
        const tpl = subscriptionPastDueTemplate({
          tier,
          parentName,
          studentName,
        });
        const rendered = renderEmail({
          subject: tpl.subject,
          layout: tpl.layout,
          recipientUid: uid,
        });
        emails.push({
          taskKey: "parent:subscription_past_due",
          to: parentEmail,
          subject: rendered.subject,
          htmlBody: rendered.html,
          textBody: rendered.text,
          templateType: "general",
          recipientUid: uid,
        });
      }

      return {
        writes: [
          {
            operation: "set",
            ref: userRef,
            data: {
              subscription: {
                ...(tier ? { tier } : {}),
                status: "past_due",
                stripeCustomerId: customerId || "",
                stripeSubscriptionId: sub.id,
                cancelAtPeriodEnd: !!sub.cancel_at_period_end,
                updatedAt: now,
              },
              updatedAt: now,
            },
            options: { merge: true },
          },
        ],
        emails,
      };
    }
  );

  console.log(`[StripeWebhook] invoice.payment_failed — uid=${uid}`);
  res.status(200).json({ received: true });
}

// ────────────────────────────────────────────────────────────────────────
//   HTTP entry point
// ────────────────────────────────────────────────────────────────────────

interface BufferedWebhookResponse extends WebhookResponseLike {
  statusCode: number;
  body: unknown;
}

function bufferedWebhookResponse(): BufferedWebhookResponse {
  const response: BufferedWebhookResponse = {
    statusCode: 200,
    body: { received: true },
    status(code: number) {
      response.statusCode = code;
      return {
        json(body: unknown) {
          response.body = body;
        },
      };
    },
  };
  return response;
}

const SUPPORTED_EVENT_TYPES = new Set([
  "checkout.session.completed",
  "customer.subscription.created",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "invoice.paid",
  "invoice.payment_failed",
]);

function validateSignedEventForProcessing(event: Stripe.Event): void {
  if (!event.data || !event.data.object || typeof event.data.object !== "object") {
    throw new PermanentWebhookError(
      "malformed_event",
      "Signed event has no processable data object."
    );
  }

  if (!SUPPORTED_EVENT_TYPES.has(event.type)) {
    throw new PermanentWebhookError(
      "unsupported_event_type",
      "Signed event type is not supported by this endpoint."
    );
  }

  const object = event.data.object as unknown as { id?: unknown };
  if (typeof object.id !== "string" || object.id.length === 0) {
    throw new PermanentWebhookError(
      "malformed_event_object",
      "Signed event object has no provider identifier."
    );
  }
}

export const stripeWebhook = onRequest(
  {
    region: "us-east1",
    secrets: [stripeSecretKey, stripeWebhookSecret],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
    const webhookSecret =
      stripeWebhookSecret.value() || process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeKey || !webhookSecret) {
      console.error("[StripeWebhook] Missing Stripe configuration");
      res.status(500).json({ error: "Stripe not configured." });
      return;
    }

    const stripe = new Stripe(stripeKey);

    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
      console.error("[StripeWebhook] Missing stripe-signature header");
      res.status(400).json({ error: "Missing signature." });
      return;
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.rawBody, signature, webhookSecret);
    } catch (err) {
      console.error(
        "[StripeWebhook] Signature verification failed:",
        redactWebhookError(err)
      );
      res.status(400).json({ error: "Invalid signature." });
      return;
    }

    // A verified Stripe event should always carry an ID. If a provider/parser
    // ever hands us an envelope without one, there is no safe document key on
    // which to record the permanent failure; acknowledge it without logging
    // the malformed body.
    if (typeof event.id !== "string" || event.id.length === 0 || !event.type) {
      console.warn("[StripeWebhook] Verified event missing an id or type");
      res.status(200).json({ received: true });
      return;
    }

    const buffered = bufferedWebhookResponse();
    const execution = await runWebhookEvent(
      admin.firestore(),
      event,
      async () => {
        validateSignedEventForProcessing(event);
        switch (event.type) {
          case "checkout.session.completed":
            await handleCheckoutSessionCompleted(event, buffered);
            break;
          case "customer.subscription.created":
            await handleSubscriptionCreated(event, buffered);
            break;
          case "customer.subscription.updated":
            await handleSubscriptionUpdated(event, buffered);
            break;
          case "customer.subscription.deleted":
            await handleSubscriptionDeleted(event, buffered);
            break;
          case "invoice.paid":
            await handleInvoicePaid(event, buffered);
            break;
          case "invoice.payment_failed":
            await handleInvoicePaymentFailed(event, buffered);
            break;
          default:
            // The validator catches this branch. Keep the default explicit so
            // adding a new Stripe type cannot accidentally acknowledge it as
            // succeeded without a handler.
            throw new PermanentWebhookError(
              "unsupported_event_type",
              "Signed event type is not supported by this endpoint."
            );
        }

        if (buffered.statusCode >= 500) {
          throw new RetryableWebhookError(
            "handler_failed",
            "Webhook handler returned a retryable failure."
          );
        }
        return buffered.body;
      },
      {
        onFailure: (error) => {
          console.error(
            "[StripeWebhook] Processing error:",
            redactWebhookError(error)
          );
        },
      }
    );

    res.status(execution.statusCode).json(
      execution.value !== undefined ? execution.value : execution.body
    );
  }
);
