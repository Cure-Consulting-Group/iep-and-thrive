/**
 * Stripe Checkout Cloud Function
 * Creates Stripe checkout sessions for deposits and balance payments
 *
 * Usage:
 *   GET /stripeCheckout?program=full&type=deposit
 *   GET /stripeCheckout?program=reading&type=balance
 *   Default type is "deposit"
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import { z } from "zod";
import {
  PUBLIC_CORS_ORIGINS,
  assertBodySize,
  assertContentType,
  assertMethod,
  assertQuota,
  errorEnvelope,
} from "./http-guard";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

const depositPrices: Record<string, string | undefined> = {
  full: process.env.STRIPE_FULL_DEPOSIT_PRICE_ID || process.env.STRIPE_FULL_PRICE_ID,
  reading: process.env.STRIPE_READING_DEPOSIT_PRICE_ID || process.env.STRIPE_READING_PRICE_ID,
  math: process.env.STRIPE_MATH_DEPOSIT_PRICE_ID || process.env.STRIPE_MATH_PRICE_ID,
};

const balancePrices: Record<string, string | undefined> = {
  full: process.env.STRIPE_FULL_BALANCE_PRICE_ID,
  reading: process.env.STRIPE_READING_BALANCE_PRICE_ID,
  math: process.env.STRIPE_MATH_BALANCE_PRICE_ID,
};

const checkoutSchema = z.object({
  program: z.enum(["full", "reading", "math"]),
  type: z.enum(["deposit", "balance"]).optional().default("deposit"),
}).strict();

const MAX_BODY_BYTES = 8 * 1024;

export const stripeCheckout = onRequest(
  {
    cors: PUBLIC_CORS_ORIGINS,
    region: "us-east1",
    secrets: [stripeSecretKey],
  },
  async (req, res) => {
    if (!assertMethod(req, res, ["GET", "POST"])) return;
    if (req.method === "POST" && !assertContentType(req, res)) return;
    if (!assertBodySize(req, res, MAX_BODY_BYTES)) return;
    if (
      !(await assertQuota(req, res, "stripe-checkout", {
        limit: 10,
        windowSeconds: 10 * 60,
      }))
    ) return;

    let checkoutRef: admin.firestore.DocumentReference | undefined;
    try {
      const params = req.method === "GET" ? req.query : req.body;
      const parsed = checkoutSchema.safeParse(params);
      if (!parsed.success) {
        errorEnvelope(res, 400, "invalid_request", "Invalid checkout request.");
        return;
      }

      const { program, type } = parsed.data;

      const priceMap = type === "balance" ? balancePrices : depositPrices;
      const priceId = priceMap[program];

      if (!priceId) {
        errorEnvelope(
          res,
          500,
          "configuration_error",
          "Payments are temporarily unavailable. Please try again later."
        );
        return;
      }

      const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        errorEnvelope(
          res,
          500,
          "configuration_error",
          "Payments are temporarily unavailable. Please try again later."
        );
        return;
      }

      // Record the checkout attempt before creating the external Stripe
      // session so a provider failure cannot lose the durable request.
      checkoutRef = await admin.firestore().collection("stripeCheckoutRequests").add({
        program,
        paymentType: type,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      const stripe = new Stripe(stripeKey);
      const siteUrl = process.env.SITE_URL || "https://iep-and-thrive.web.app";

      const programLabels: Record<string, string> = {
        full: "Full Academic Intensive",
        reading: "Reading & Language Intensive",
        math: "Math & Numeracy Intensive",
      };

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: {
          program,
          payment_type: type,
          program_label: programLabels[program] || program,
        },
        success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/#program`,
        payment_intent_data: {
          description: `IEP & Thrive — ${programLabels[program]} (${type === "deposit" ? "25% Deposit" : "75% Balance"})`,
        },
      });

      if (!session.url) {
        try {
          await checkoutRef.update({
            status: "failed",
            failureCode: "missing_session_url",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (error) {
          console.error("Stripe checkout status update failed:", error);
        }
        errorEnvelope(res, 500, "checkout_failed", "Failed to create checkout session.");
        return;
      }

      try {
        await checkoutRef.update({
          status: "created",
          stripeSessionId: session.id,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("Stripe checkout status update failed:", error);
      }

      res.status(200).json({ url: session.url });
    } catch (error) {
      if (checkoutRef) {
        try {
          await checkoutRef.update({
            status: "failed",
            failureCode: "provider_error",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (statusError) {
          console.error("Stripe checkout failure status update failed:", statusError);
        }
      }
      console.error("Stripe checkout error:", error);
      errorEnvelope(res, 500, "checkout_failed", "Failed to create checkout session.");
    }
  }
);
