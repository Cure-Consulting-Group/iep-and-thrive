/**
 * Summer Guide Capture Cloud Function
 * Handles email capture for the free IEP Summer Guide PDF download.
 * Stores lead in Firestore and sends the guide delivery email immediately.
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { z } from "zod";
import { sendEmail, logEmail, escapeHtml } from "./email-service";
import { summerGuideDeliveryTemplate } from "./summer-guide-emails";
import {
  PUBLIC_CORS_ORIGINS,
  assertBodySize,
  assertContentType,
  assertMethod,
  assertQuota,
  errorEnvelope,
} from "./http-guard";

const summerGuideCaptureSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(320),
}).strict();

const MAX_BODY_BYTES = 8 * 1024;

export const summerGuideCapture = onRequest(
  {
    cors: PUBLIC_CORS_ORIGINS,
    region: "us-east1",
  },
  async (req, res) => {
    if (!assertMethod(req, res, ["POST"])) return;
    if (!assertContentType(req, res)) return;
    if (!assertBodySize(req, res, MAX_BODY_BYTES)) return;
    if (
      !(await assertQuota(req, res, "summer-guide-capture", {
        limit: 3,
        windowSeconds: 60 * 60,
      }))
    ) return;

    try {
      const parsed = summerGuideCaptureSchema.safeParse(req.body);
      if (!parsed.success) {
        errorEnvelope(res, 400, "invalid_request", "Invalid guide request.");
        return;
      }

      const cleanName = parsed.data.name;
      const cleanEmail = parsed.data.email.toLowerCase();

      // Store the lead in Firestore
      await admin.firestore().collection("guideLeads").add({
        name: cleanName,
        email: cleanEmail,
        capturedAt: admin.firestore.FieldValue.serverTimestamp(),
        source: "summer-guide",
        emailsSent: 1,
        status: "active",
      });

      // Send guide delivery email (Email #1) immediately
      const template = summerGuideDeliveryTemplate({
        name: escapeHtml(cleanName),
      });

      const sent = await sendEmail({
        to: cleanEmail,
        subject: template.subject,
        htmlBody: template.html,
      });

      await logEmail(
        cleanEmail,
        template.subject,
        "guide_delivery",
        sent
      );

      res.status(200).json({
        success: true,
        message: "Guide sent! Check your email.",
      });
    } catch (error) {
      console.error("Summer guide capture error:", error);
      errorEnvelope(
        res,
        500,
        "internal_error",
        "Something went wrong. Please try again."
      );
    }
  }
);
