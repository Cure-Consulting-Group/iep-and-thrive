/**
 * Stripe Checkout Cloud Function
 * Replaces /api/stripe/checkout — creates Stripe checkout sessions
 */

import { onRequest } from "firebase-functions/v2/https";
import Stripe from "stripe";

export const stripeCheckout = onRequest(
  {
    cors: [
      "https://iep-and-thrive.web.app",
      "https://iepandthrive.com",
      /localhost/,
    ],
    region: "us-east1",
  },
  async (req, res) => {
    if (req.method !== "GET" && req.method !== "POST") {
      res.status(405).json({ error: "Method not allowed" });
      return;
    }

    try {
      // Support both GET query params and POST body
      const program =
        req.method === "GET"
          ? req.query.program as string
          : req.body?.program as string;

      const priceMap: Record<string, string | undefined> = {
        reading: process.env.STRIPE_READING_PRICE_ID,
        math: process.env.STRIPE_MATH_PRICE_ID,
        full: process.env.STRIPE_FULL_PRICE_ID,
      };

      if (!program || !priceMap[program]) {
        res.status(400).json({
          error:
            "Invalid or missing program parameter. Use: full, reading, or math.",
        });
        return;
      }

      const priceId = priceMap[program];
      if (!priceId) {
        res
          .status(500)
          .json({ error: "Stripe price ID not configured for this program." });
        return;
      }

      const stripeKey = process.env.STRIPE_SECRET_KEY;
      if (!stripeKey) {
        res.status(500).json({ error: "Stripe not configured." });
        return;
      }

      const stripe = new Stripe(stripeKey);
      const siteUrl =
        process.env.SITE_URL || "https://iep-and-thrive.web.app";

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        line_items: [{ price: priceId, quantity: 1 }],
        metadata: { program },
        success_url: `${siteUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${siteUrl}/#program`,
      });

      if (!session.url) {
        res.status(500).json({ error: "Failed to create checkout session." });
        return;
      }

      // Return JSON with URL (frontend will redirect)
      res.status(200).json({ url: session.url });
    } catch (error) {
      console.error("Stripe checkout error:", error);
      res.status(500).json({ error: "Failed to create checkout session." });
    }
  }
);
