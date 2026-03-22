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
import Stripe from "stripe";

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

export const stripeCheckout = onRequest(
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

    try {
      const params = req.method === "GET" ? req.query : req.body;
      const program = params.program as string;
      const type = (params.type as string) || "deposit";

      if (!program || !["full", "reading", "math"].includes(program)) {
        res.status(400).json({
          error: "Invalid or missing program. Use: full, reading, or math.",
        });
        return;
      }

      if (!["deposit", "balance"].includes(type)) {
        res.status(400).json({
          error: "Invalid payment type. Use: deposit or balance.",
        });
        return;
      }

      const priceMap = type === "balance" ? balancePrices : depositPrices;
      const priceId = priceMap[program];

      if (!priceId) {
        res.status(500).json({
          error: `Stripe price ID not configured for ${program} ${type}.`,
        });
        return;
      }

      const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        res.status(500).json({ error: "Stripe not configured." });
        return;
      }

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
        res.status(500).json({ error: "Failed to create checkout session." });
        return;
      }

      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session." });
    }
  }
);
