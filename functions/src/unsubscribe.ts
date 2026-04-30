/**
 * G2 — One-click unsubscribe HTTP handler.
 *
 * Static `/unsubscribe?token=…` page client-side fetches this endpoint
 * with the token. CAN-SPAM compliant: one click, processes within 10 days
 * (we process synchronously, ~50ms).
 *
 * Token verification → flip users.unsubscribed = true. Idempotent.
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { verifyUnsubscribeToken } from "./unsubscribe-token";

export const unsubscribe = onRequest(
  {
    region: "us-east1",
    cors: true,
  },
  async (req, res) => {
    const token =
      (req.method === "POST" ? (req.body?.token as string) : (req.query.token as string)) || "";

    if (!token) {
      res.status(400).json({ ok: false, error: "Missing token." });
      return;
    }

    const uid = verifyUnsubscribeToken(token);
    if (!uid) {
      res.status(403).json({ ok: false, error: "Invalid or expired token." });
      return;
    }

    try {
      const userRef = admin.firestore().collection("users").doc(uid);
      const snap = await userRef.get();
      if (!snap.exists) {
        // Don't reveal whether the user exists — return generic success.
        res.status(200).json({ ok: true, alreadyUnsubscribed: false });
        return;
      }
      const data = snap.data() ?? {};
      const wasAlready = data.unsubscribed === true;

      if (!wasAlready) {
        await userRef.update({
          unsubscribed: true,
          unsubscribedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      }

      res.status(200).json({ ok: true, alreadyUnsubscribed: wasAlready });
    } catch (err) {
      console.error("[unsubscribe] failed:", err);
      res.status(500).json({ ok: false, error: "Server error." });
    }
  }
);
