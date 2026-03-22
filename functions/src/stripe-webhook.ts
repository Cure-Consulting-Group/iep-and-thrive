/**
 * Stripe Webhook Cloud Function
 *
 * Handles Stripe checkout.session.completed events to auto-enroll parents
 * when they pay a deposit or balance. Updates Firestore user records and
 * sends confirmation/notification emails.
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { sendEmail, logEmail } from "./email-service";
import {
  depositConfirmationTemplate,
  balanceConfirmationTemplate,
  operatorPaymentNotificationTemplate,
} from "./stripe-webhook-emails";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");
const stripeWebhookSecret = defineSecret("STRIPE_WEBHOOK_SECRET");

const programLabels: Record<string, string> = {
  full: "Full Academic Intensive",
  reading: "Reading & Language Intensive",
  math: "Math & Numeracy Intensive",
};

export const stripeWebhook = onRequest(
  {
    region: "us-east1",
    secrets: [stripeSecretKey, stripeWebhookSecret],
  },
  async (req, res) => {
    // Only accept POST requests
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

    // ─── Verify Webhook Signature ───

    const signature = req.headers["stripe-signature"] as string;
    if (!signature) {
      console.error("[StripeWebhook] Missing stripe-signature header");
      res.status(400).json({ error: "Missing signature." });
      return;
    }

    let event: Stripe.Event;

    try {
      // Firebase provides rawBody for signature verification
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        webhookSecret
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      console.error(`[StripeWebhook] Signature verification failed: ${message}`);
      res.status(400).json({ error: "Invalid signature." });
      return;
    }

    // ─── Handle checkout.session.completed ───

    if (event.type !== "checkout.session.completed") {
      // Acknowledge other event types without processing
      console.log(`[StripeWebhook] Ignoring event type: ${event.type}`);
      res.status(200).json({ received: true });
      return;
    }

    try {
      const session = event.data.object as Stripe.Checkout.Session;

      // Extract metadata
      const program = session.metadata?.program || "unknown";
      const paymentType = session.metadata?.payment_type || "deposit";
      const programLabel =
        session.metadata?.program_label || programLabels[program] || program;

      // Extract customer details
      const customerEmail = session.customer_details?.email;
      const customerName = session.customer_details?.name || "Parent/Guardian";

      if (!customerEmail) {
        console.error("[StripeWebhook] No customer email in session");
        res.status(200).json({ received: true });
        return;
      }

      // Calculate amount for display
      const amountTotal = session.amount_total
        ? `$${(session.amount_total / 100).toFixed(2)}`
        : "N/A";

      const db = admin.firestore();
      const isDeposit = paymentType === "deposit";
      const isBalance = paymentType === "balance";
      const now = admin.firestore.FieldValue.serverTimestamp();

      // ─── Find or Create User in Firestore ───

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
        // User exists — update their document
        userDocRef = existingQuery.docs[0].ref;
        const existingData = existingQuery.docs[0].data();

        // Don't overwrite enrolledAt if already set
        if (existingData.enrolledAt && isDeposit) {
          delete paymentData.enrolledAt;
        }

        await userDocRef.update(paymentData);
        console.log(
          `[StripeWebhook] Updated existing user: ${customerEmail}`
        );
      } else {
        // New user — create document
        paymentData.createdAt = now;
        userDocRef = await usersRef.add(paymentData);
        console.log(`[StripeWebhook] Created new user: ${customerEmail}`);
      }

      // ─── Update Pipeline Status (if exists) ───

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
        console.log(
          `[StripeWebhook] Updated pipeline record for: ${customerEmail}`
        );
      }

      // ─── Send Confirmation Email to Parent ───

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
        await logEmail(
          customerEmail,
          template.subject,
          "deposit_confirmation",
          sent
        );
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
        await logEmail(
          customerEmail,
          template.subject,
          "balance_confirmation",
          sent
        );
      }

      // ─── Send Notification Email to Operator ───

      const operatorEmail =
        process.env.OPERATOR_EMAIL || "hello@iepandthrive.com";

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
    } catch (error) {
      console.error("[StripeWebhook] Processing error:", error);
      // Return 200 to prevent Stripe from retrying on application errors
      res.status(200).json({ received: true, error: "Processing failed" });
    }
  }
);
