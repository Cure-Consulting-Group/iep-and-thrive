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
 * Idempotency: every event is recorded in webhookEventLog/{event.id} BEFORE
 * processing. If the doc already exists, the event is acknowledged but
 * skipped (Stripe redelivers freely; we must not double-write).
 *
 * The ONE-TIME payment flow (cohort deposits) MUST remain untouched.
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { sendEmail, sendEmailWithResult, logEmail } from "./email-service";
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
} from "../../lib/subscription";
import { tierPrice } from "../../lib/subscription";

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

/**
 * Idempotency gate: claim the event id by writing webhookEventLog/{id}.
 * Returns false if the event was already processed.
 */
async function claimEvent(
  db: admin.firestore.Firestore,
  event: Stripe.Event
): Promise<boolean> {
  const ref = db.collection("webhookEventLog").doc(event.id);
  try {
    await ref.create({
      eventId: event.id,
      type: event.type,
      receivedAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (err) {
    const code = (err as { code?: number | string }).code;
    if (code === 6 || code === "ALREADY_EXISTS") {
      console.log(`[StripeWebhook] Duplicate event ignored: ${event.id} (${event.type})`);
      return false;
    }
    throw err;
  }
}

async function fetchUserData(
  db: admin.firestore.Firestore,
  uid: string
): Promise<{ parentName: string; parentEmail: string; studentName: string }> {
  const snap = await db.collection("users").doc(uid).get();
  const data = snap.exists ? snap.data() ?? {} : {};
  const parentName =
    (data.displayName as string | undefined) ||
    (data.parentName as string | undefined) ||
    "Parent";
  const parentEmail =
    (data.email as string | undefined) ||
    "";
  const studentName =
    (data.studentName as string | undefined) ||
    "";
  return { parentName, parentEmail, studentName };
}

// ────────────────────────────────────────────────────────────────────────
//   Per-event handlers
// ────────────────────────────────────────────────────────────────────────

async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  res: { status: (n: number) => { json: (b: unknown) => void } }
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
    if (uid && customerId) {
      try {
        await admin
          .firestore()
          .collection("users")
          .doc(uid)
          .set(
            {
              stripeCustomerId: customerId,
              updatedAt: admin.firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
          );
      } catch (err) {
        console.error("[StripeWebhook] subscription session write failed:", err);
      }
    }
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
    console.error("[StripeWebhook] No customer email in session");
    res.status(200).json({ received: true });
    return;
  }

  const amountTotal = session.amount_total
    ? `$${(session.amount_total / 100).toFixed(2)}`
    : "N/A";

  const db = admin.firestore();
  const isDeposit = paymentType === "deposit";
  const isBalance = paymentType === "balance";
  const now = admin.firestore.FieldValue.serverTimestamp();

  const usersRef = db.collection("users");
  const existingQuery = await usersRef
    .where("email", "==", customerEmail)
    .limit(1)
    .get();

  const paymentData: Record<string, unknown> = {
    email: customerEmail,
    displayName: customerName,
    program,
    programLabel,
    paymentType,
    stripeSessionId: session.id,
    stripePaymentIntentId: session.payment_intent,
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

  let userDocRef: admin.firestore.DocumentReference;

  if (!existingQuery.empty) {
    userDocRef = existingQuery.docs[0].ref;
    const existingData = existingQuery.docs[0].data();
    if (existingData.enrolledAt && isDeposit) {
      delete paymentData.enrolledAt;
    }
    await userDocRef.update(paymentData);
    console.log(`[StripeWebhook] Updated existing user: ${customerEmail}`);
  } else {
    paymentData.createdAt = now;
    userDocRef = await usersRef.add(paymentData);
    console.log(`[StripeWebhook] Created new user: ${customerEmail}`);
  }

  // Pipeline status
  const pipelineQuery = await db
    .collection("enrollmentInquiries")
    .where("email", "==", customerEmail)
    .limit(1)
    .get();

  if (!pipelineQuery.empty) {
    const pipelineDoc = pipelineQuery.docs[0];
    await pipelineDoc.ref.update({
      status: isBalance ? "paid_in_full" : "deposit_paid",
      stripeSessionId: session.id,
      paymentReceivedAt: now,
    });
  }

  // Parent confirmation email
  if (isDeposit) {
    const template = depositConfirmationTemplate({
      name: customerName,
      program: programLabel,
      amount: amountTotal,
    });
    const sent = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      htmlBody: template.html,
    });
    await logEmail(customerEmail, template.subject, "deposit_confirmation", sent);
  } else if (isBalance) {
    const template = balanceConfirmationTemplate({
      name: customerName,
      program: programLabel,
      amount: amountTotal,
    });
    const sent = await sendEmail({
      to: customerEmail,
      subject: template.subject,
      htmlBody: template.html,
    });
    await logEmail(customerEmail, template.subject, "balance_confirmation", sent);
  }

  // Operator notification
  const operatorEmail = process.env.OPERATOR_EMAIL || "hello@iepandthrive.com";
  const notifTemplate = operatorPaymentNotificationTemplate({
    name: customerName,
    email: customerEmail,
    program: programLabel,
    type: paymentType,
    amount: amountTotal,
    sessionId: session.id,
  });
  const notifSent = await sendEmail({
    to: operatorEmail,
    subject: notifTemplate.subject,
    htmlBody: notifTemplate.html,
  });
  await logEmail(
    operatorEmail,
    notifTemplate.subject,
    "operator_payment_notification",
    notifSent
  );

  console.log(
    `[StripeWebhook] Processed ${paymentType} for ${customerEmail} — ${programLabel}`
  );
  res.status(200).json({ received: true });
}

async function handleSubscriptionCreated(
  event: Stripe.Event,
  res: { status: (n: number) => { json: (b: unknown) => void } }
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const tier = tierFromSubscription(sub);
  if (!tier) {
    console.warn(`[StripeWebhook] subscription ${sub.id} has unknown tier — skipped`);
    res.status(200).json({ received: true });
    return;
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
    console.error(
      `[StripeWebhook] subscription.created could not resolve uid (sub=${sub.id}, customer=${customerId})`
    );
    res.status(200).json({ received: true });
    return;
  }

  const period = readSubscriptionPeriod(sub);
  const status = mapStripeStatus(sub.status);
  const allowance = tierPrice(tier).sessionsPerCycle;
  const now = admin.firestore.FieldValue.serverTimestamp();

  const state: Omit<SubscriptionState, "createdAt" | "updatedAt"> & {
    createdAt: admin.firestore.FieldValue;
    updatedAt: admin.firestore.FieldValue;
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

  await db.collection("users").doc(uid).set(
    {
      stripeCustomerId: customerId || admin.firestore.FieldValue.delete(),
      subscription: state,
      updatedAt: now,
    },
    { merge: true }
  );

  // Welcome email (transactional, but still respects unsubscribed for safety)
  const { parentName, parentEmail, studentName } = await fetchUserData(db, uid);
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
    const sendRes = await sendEmailWithResult({
      to: parentEmail,
      subject: rendered.subject,
      htmlBody: rendered.html,
      textBody: rendered.text,
      kind: "transactional",
      recipientUid: uid,
    });
    await logEmail(parentEmail, rendered.subject, "general", sendRes.ok, {
      messageId: sendRes.messageId,
      error: sendRes.error,
      meta: { template: "subscription_welcome", uid, tier },
    });
  }

  console.log(`[StripeWebhook] subscription.created — uid=${uid} tier=${tier}`);
  res.status(200).json({ received: true });
}

async function handleSubscriptionUpdated(
  event: Stripe.Event,
  res: { status: (n: number) => { json: (b: unknown) => void } }
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const tier = tierFromSubscription(sub);
  if (!tier) {
    console.warn(`[StripeWebhook] subscription.updated ${sub.id} has unknown tier — skipped`);
    res.status(200).json({ received: true });
    return;
  }

  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid = uidFromMeta || (await findUidForCustomer(db, customerId));

  if (!uid) {
    console.error(
      `[StripeWebhook] subscription.updated could not resolve uid (sub=${sub.id})`
    );
    res.status(200).json({ received: true });
    return;
  }

  const userRef = db.collection("users").doc(uid);
  const userSnap = await userRef.get();
  const previous = (userSnap.data()?.subscription || null) as SubscriptionState | null;
  const previousStatus = previous?.status;

  const period = readSubscriptionPeriod(sub);
  const status = mapStripeStatus(sub.status);
  const allowance = tierPrice(tier).sessionsPerCycle;
  const now = admin.firestore.FieldValue.serverTimestamp();

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

  // Initialize new fields if subscription doc didn't exist before.
  if (!previous) {
    patch["subscription.createdAt"] = now;
    patch["subscription.sessionsUsedThisCycle"] = 0;
  }

  await userRef.set(patch, { merge: true });

  // Status-transition emails. Only fire when status actually changes
  // into the corresponding state — Stripe redelivers on no-op updates.
  const { parentName, parentEmail, studentName } = await fetchUserData(db, uid);
  const cycleEndISO = unixToISO(period.endEpoch);

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

  if (template && parentEmail) {
    const tpl = template.fn({
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
    const sendRes = await sendEmailWithResult({
      to: parentEmail,
      subject: rendered.subject,
      htmlBody: rendered.html,
      textBody: rendered.text,
      kind: "transactional",
      recipientUid: uid,
    });
    await logEmail(parentEmail, rendered.subject, "general", sendRes.ok, {
      messageId: sendRes.messageId,
      error: sendRes.error,
      meta: { template: template.meta, uid, tier, fromStatus: previousStatus, toStatus: status },
    });
  }

  console.log(
    `[StripeWebhook] subscription.updated — uid=${uid} tier=${tier} status=${previousStatus ?? "(none)"} → ${status}`
  );
  res.status(200).json({ received: true });
}

async function handleSubscriptionDeleted(
  event: Stripe.Event,
  res: { status: (n: number) => { json: (b: unknown) => void } }
): Promise<void> {
  const sub = event.data.object as Stripe.Subscription;
  const tier = tierFromSubscription(sub);
  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid = uidFromMeta || (await findUidForCustomer(db, customerId));

  if (!uid) {
    console.error(`[StripeWebhook] subscription.deleted could not resolve uid (sub=${sub.id})`);
    res.status(200).json({ received: true });
    return;
  }

  const period = readSubscriptionPeriod(sub);
  const cycleEndISO = unixToISO(period.endEpoch);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.collection("users").doc(uid).set(
    {
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
    { merge: true }
  );

  if (tier) {
    const { parentName, parentEmail, studentName } = await fetchUserData(db, uid);
    if (parentEmail) {
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
      const sendRes = await sendEmailWithResult({
        to: parentEmail,
        subject: rendered.subject,
        htmlBody: rendered.html,
        textBody: rendered.text,
        kind: "transactional",
        recipientUid: uid,
      });
      await logEmail(parentEmail, rendered.subject, "general", sendRes.ok, {
        messageId: sendRes.messageId,
        error: sendRes.error,
        meta: { template: "subscription_canceled", uid, tier, source: "subscription.deleted" },
      });
    }
  }

  console.log(`[StripeWebhook] subscription.deleted — uid=${uid}`);
  res.status(200).json({ received: true });
}

async function handleInvoicePaid(
  event: Stripe.Event,
  res: { status: (n: number) => { json: (b: unknown) => void } }
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
    console.warn("[StripeWebhook] invoice.paid had no subscription id — skipped");
    res.status(200).json({ received: true });
    return;
  }

  const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("[StripeWebhook] Stripe key missing for invoice.paid renewal");
    res.status(500).json({ error: "Stripe not configured." });
    return;
  }
  const stripe = new Stripe(stripeKey);
  const sub = await stripe.subscriptions.retrieve(subId);
  const tier = tierFromSubscription(sub);
  if (!tier) {
    console.warn(`[StripeWebhook] invoice.paid subscription ${sub.id} has unknown tier`);
    res.status(200).json({ received: true });
    return;
  }

  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid = uidFromMeta || (await findUidForCustomer(db, customerId));

  if (!uid) {
    console.error(`[StripeWebhook] invoice.paid could not resolve uid (sub=${sub.id})`);
    res.status(200).json({ received: true });
    return;
  }

  const period = readSubscriptionPeriod(sub);
  const allowance = tierPrice(tier).sessionsPerCycle;
  const status = mapStripeStatus(sub.status);
  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.collection("users").doc(uid).set(
    {
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
    { merge: true }
  );

  const { parentName, parentEmail, studentName } = await fetchUserData(db, uid);
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
    const sendRes = await sendEmailWithResult({
      to: parentEmail,
      subject: rendered.subject,
      htmlBody: rendered.html,
      textBody: rendered.text,
      kind: "transactional",
      recipientUid: uid,
    });
    await logEmail(parentEmail, rendered.subject, "general", sendRes.ok, {
      messageId: sendRes.messageId,
      error: sendRes.error,
      meta: { template: "subscription_monthly_receipt", uid, tier, invoiceId: invoice.id },
    });
  }

  console.log(`[StripeWebhook] invoice.paid (renewal) — uid=${uid} tier=${tier}`);
  res.status(200).json({ received: true });
}

async function handleInvoicePaymentFailed(
  event: Stripe.Event,
  res: { status: (n: number) => { json: (b: unknown) => void } }
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;

  const subId =
    typeof (invoice as unknown as { subscription?: unknown }).subscription === "string"
      ? ((invoice as unknown as { subscription: string }).subscription)
      : ((invoice as unknown as { subscription?: { id?: string } }).subscription?.id || null);

  if (!subId) {
    console.warn("[StripeWebhook] invoice.payment_failed had no subscription id — skipped");
    res.status(200).json({ received: true });
    return;
  }

  const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    console.error("[StripeWebhook] Stripe key missing for invoice.payment_failed");
    res.status(500).json({ error: "Stripe not configured." });
    return;
  }
  const stripe = new Stripe(stripeKey);
  const sub = await stripe.subscriptions.retrieve(subId);
  const tier = tierFromSubscription(sub);

  const db = admin.firestore();
  const customerId = typeof sub.customer === "string" ? sub.customer : sub.customer?.id || null;
  const uidFromMeta = (sub.metadata?.uid as string | undefined) || null;
  const uid = uidFromMeta || (await findUidForCustomer(db, customerId));

  if (!uid) {
    console.error(`[StripeWebhook] invoice.payment_failed could not resolve uid (sub=${sub.id})`);
    res.status(200).json({ received: true });
    return;
  }

  const now = admin.firestore.FieldValue.serverTimestamp();

  await db.collection("users").doc(uid).set(
    {
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
    { merge: true }
  );

  if (tier) {
    const { parentName, parentEmail, studentName } = await fetchUserData(db, uid);
    if (parentEmail) {
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
      const sendRes = await sendEmailWithResult({
        to: parentEmail,
        subject: rendered.subject,
        htmlBody: rendered.html,
        textBody: rendered.text,
        kind: "transactional",
        recipientUid: uid,
      });
      await logEmail(parentEmail, rendered.subject, "general", sendRes.ok, {
        messageId: sendRes.messageId,
        error: sendRes.error,
        meta: { template: "subscription_past_due", uid, tier, invoiceId: invoice.id },
      });
    }
  }

  console.log(`[StripeWebhook] invoice.payment_failed — uid=${uid}`);
  res.status(200).json({ received: true });
}

// ────────────────────────────────────────────────────────────────────────
//   HTTP entry point
// ────────────────────────────────────────────────────────────────────────

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
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[StripeWebhook] Signature verification failed: ${message}`);
      res.status(400).json({ error: "Invalid signature." });
      return;
    }

    // ── Idempotency claim ──
    let claimed: boolean;
    try {
      claimed = await claimEvent(admin.firestore(), event);
    } catch (err) {
      console.error("[StripeWebhook] webhookEventLog write failed:", err);
      // Treat as already-processed to be safe; Stripe will retry.
      res.status(500).json({ error: "Idempotency claim failed." });
      return;
    }
    if (!claimed) {
      res.status(200).json({ received: true, duplicate: true });
      return;
    }

    try {
      switch (event.type) {
        case "checkout.session.completed":
          await handleCheckoutSessionCompleted(event, res);
          return;
        case "customer.subscription.created":
          await handleSubscriptionCreated(event, res);
          return;
        case "customer.subscription.updated":
          await handleSubscriptionUpdated(event, res);
          return;
        case "customer.subscription.deleted":
          await handleSubscriptionDeleted(event, res);
          return;
        case "invoice.paid":
          await handleInvoicePaid(event, res);
          return;
        case "invoice.payment_failed":
          await handleInvoicePaymentFailed(event, res);
          return;
        default:
          console.log(`[StripeWebhook] Ignoring event type: ${event.type}`);
          res.status(200).json({ received: true });
          return;
      }
    } catch (error) {
      console.error("[StripeWebhook] Processing error:", error);
      // Return 200 so Stripe doesn't retry on application bugs; the
      // webhookEventLog/{id} doc holds the audit trail for manual replay.
      res.status(200).json({ received: true, error: "Processing failed" });
    }
  }
);
