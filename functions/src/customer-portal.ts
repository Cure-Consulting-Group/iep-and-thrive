/**
 * H11 — Stripe Customer Portal Cloud Function
 *
 * Mints a Stripe billing-portal session URL for the authenticated parent
 * so they can self-serve cancel / pause / update-card without engineering
 * tickets. Called from /portal/subscription "Manage subscription" CTA.
 *
 * Implemented as an HTTPS endpoint (rather than onCall) to mirror the
 * other functions in this codebase and to keep CORS handling explicit.
 * The client posts a Firebase ID token and receives `{ url: string }`,
 * which the page consumes via window.location.assign().
 *
 * Auth REQUIRED. Errors gracefully when users/{uid}.stripeCustomerId is
 * missing (parent has never subscribed).
 */

import { onRequest } from "firebase-functions/v2/https";
import { defineSecret } from "firebase-functions/params";
import * as admin from "firebase-admin";
import Stripe from "stripe";

const stripeSecretKey = defineSecret("STRIPE_SECRET_KEY");

export const customerPortal = onRequest(
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

    // ─── Auth ─────────────────────────────────────────────────────────
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
      console.warn("[customerPortal] token verify failed:", err);
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    const uid = decoded.uid;

    // ─── Lookup stripeCustomerId ──────────────────────────────────────
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
      console.error("[customerPortal] Firestore read failed:", err);
      res.status(500).json({ error: "Lookup failed." });
      return;
    }

    if (!stripeCustomerId) {
      res.status(404).json({
        error:
          "No Stripe customer on file for this account. Subscribe first to access the billing portal.",
      });
      return;
    }

    // ─── Mint portal session ──────────────────────────────────────────
    const stripeKey = stripeSecretKey.value() || process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      res.status(500).json({ error: "Stripe not configured." });
      return;
    }

    const stripe = new Stripe(stripeKey);
    const siteUrl = process.env.SITE_URL || "https://iep-and-thrive.web.app";

    try {
      const portalSession = await stripe.billingPortal.sessions.create({
        customer: stripeCustomerId,
        return_url: `${siteUrl}/portal/subscription`,
      });

      if (!portalSession.url) {
        res.status(500).json({ error: "Failed to create portal session." });
        return;
      }

      res.status(200).json({ url: portalSession.url });
    } catch (error) {
      console.error("[customerPortal] Stripe error:", error);
      res.status(500).json({ error: "Failed to create portal session." });
    }
  }
);
