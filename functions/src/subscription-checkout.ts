/**
 * H3 — Subscription Checkout Cloud Function
 *
 * Creates Stripe Checkout sessions in `mode: 'subscription'` for tutoring
 * tiers (weekly / twice-weekly). Mirrors functions/src/stripe-checkout.ts
 * (one-time payment mode) but uses subscription price IDs and requires
 * Firebase Auth so we can stamp client_reference_id with the parent's uid.
 *
 * Tier → Stripe price ID env-var lookup is delegated to
 * lib/subscription.ts:stripePriceIdEnvVar() — single source of truth.
 *
 * Usage:
 *   GET  /subscriptionCheckout?plan=weekly
 *   POST { plan: 'twice-weekly' }
 *
 * Headers:
 *   Authorization: Bearer <Firebase ID token>   (REQUIRED)
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";
import {
  stripePriceIdEnvVar,
  tierLabel,
  type SubscriptionTier,
} from "../../lib/subscription";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return value === "weekly" || value === "twice-weekly";
}

export const subscriptionCheckout = onRequest(
  {
    cors: [
      "https://iep-and-thrive.web.app",
      "https://iepandthrive.com",
      /localhost/,
    ],
    region: "us-east1",
    secrets: [stripeSecretKey],
  },
  async (req, res) => {
    if (req.method !== "GET" && req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    // ─── Auth: require a signed-in parent ─────────────────────────────
    const authHeader =
      (req.headers.authorization as string | undefined) || "";
    const m = /^Bearer (.+)$/.exec(authHeader);
    if (!m) {
      res.status(401).json({ error: "Missing bearer token" });
      return;
    }

    let decoded: admin.auth.DecodedIdToken;
    try {
      decoded = await admin.auth().verifyIdToken(m[1]);
    } catch (err) {
      console.warn("[subscriptionCheckout] token verify failed:", err);
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    const uid = decoded.uid;
    const parentEmail = decoded.email || undefined;

    // ─── Plan validation ──────────────────────────────────────────────
    const params = req.method === "GET" ? req.query : req.body;
    const planRaw = (params?.plan as string | undefined) || "";

    if (!isSubscriptionTier(planRaw)) {
      res.status(400).json({
        error: "Invalid or missing plan. Use: weekly or twice-weekly.",
      });
      return;
    }

    const plan: SubscriptionTier = planRaw;
    const priceId = process.env[stripePriceIdEnvVar(plan)];

    if (!priceId) {
      res.status(500).json({
        error: `Stripe price ID not configured for ${plan}.`,
      });
      return;
    }

    // ─── Stripe configuration ─────────────────────────────────────────
    const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      res.status(500).json({ error: "Stripe not configured." });
      return;
    }

    const stripe = new Stripe(stripeKey);
    const siteUrl = process.env.SITE_URL || "https://iep-and-thrive.web.app";

    try {
      // If we already know the parent's Stripe customer, reuse it so the
      // subscription attaches to the correct billing record. Otherwise
      // Stripe will create a customer at session completion and the
      // webhook (H4) maps it back via client_reference_id.
      let stripeCustomerId: string | undefined;
      try {
        const userSnap = await admin
          .firestore()
          .collection("users")
          .doc(uid)
          .get();
        if (userSnap.exists) {
          const data = userSnap.data() ?? {};
          if (typeof data.stripeCustomerId === "string" && data.stripeCustomerId) {
            stripeCustomerId = data.stripeCustomerId;
          }
        }
      } catch (err) {
        console.warn(
          "[subscriptionCheckout] unable to read users/{uid} for stripeCustomerId — Stripe will create one:",
          err
        );
      }

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        line_items: [{ price: priceId, quantity: 1 }],
        client_reference_id: uid,
        ...(stripeCustomerId
          ? { customer: stripeCustomerId }
          : parentEmail
            ? { customer_email: parentEmail }
            : {}),
        metadata: {
          plan,
          plan_label: tierLabel(plan),
          uid,
        },
        subscription_data: {
          metadata: {
            plan,
            plan_label: tierLabel(plan),
            uid,
          },
        },
        success_url: `${siteUrl}/portal/subscription?welcome=1`,
        cancel_url: `${siteUrl}/tutoring#pricing`,
      });

      if (!session.url) {
        res.status(500).json({ error: "Failed to create checkout session." });
        return;
      }

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("[subscriptionCheckout] Stripe error:", error);
      res.status(500).json({ error: "Failed to create checkout session." });
    }
  }
);
