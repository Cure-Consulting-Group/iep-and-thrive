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
import { z } from "zod";
import { verifyUnsubscribeToken } from "./unsubscribe-token";
import {
  PUBLIC_CORS_ORIGINS,
  assertBodySize,
  assertContentType,
  assertMethod,
  assertQuota,
  errorEnvelope,
} from "./http-guard";

const unsubscribeSchema = z.object({
  token: z.string().min(1).max(2048),
}).strict();

const MAX_BODY_BYTES = 4 * 1024;

export const unsubscribe = onRequest(
  {
    region: "us-east1",
    cors: PUBLIC_CORS_ORIGINS,
  },
  async (req, res) => {
    if (!assertMethod(req, res, ["GET", "POST"])) return;
    if (req.method === "POST" && !assertContentType(req, res)) return;
    if (!assertBodySize(req, res, MAX_BODY_BYTES)) return;
    if (
      !(await assertQuota(req, res, "unsubscribe", {
        limit: 10,
        windowSeconds: 60 * 60,
      }))
    ) return;

    const params = req.method === "POST" ? req.body : req.query;
    const parsed = unsubscribeSchema.safeParse(params);
    if (!parsed.success) {
      errorEnvelope(res, 400, "invalid_request", "Missing or invalid unsubscribe token.");
      return;
    }
    const token = parsed.data.token;

    try {
      const uid = verifyUnsubscribeToken(token);
      if (!uid) {
        errorEnvelope(res, 403, "invalid_token", "Invalid or expired unsubscribe token.");
        return;
      }

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
      errorEnvelope(
        res,
        500,
        "internal_error",
        "We could not update your preferences. Please try again."
      );
    }
  }
);
