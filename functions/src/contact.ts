/**
 * Contact Cloud Function
 * Replaces /api/contact — handles contact form submissions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { z } from "zod";
import { sendEmail, logEmail } from "./email-service";
import { contactNotificationTemplate } from "./email-templates";
import {
  PUBLIC_CORS_ORIGINS,
  assertBodySize,
  assertContentType,
  assertMethod,
  assertQuota,
  errorEnvelope,
} from "./http-guard";

const contactSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(320),
  phone: z.string().max(32).optional(),
  message: z.string().min(10).max(4000),
  type: z.enum(["general", "iep-review", "discovery-call"]),
}).strict();

const MAX_BODY_BYTES = 32 * 1024;

export const contact = onRequest(
  {
    cors: PUBLIC_CORS_ORIGINS,
    region: "us-east1",
  },
  async (req, res) => {
    if (!assertMethod(req, res, ["POST"])) return;
    if (!assertContentType(req, res)) return;
    if (!assertBodySize(req, res, MAX_BODY_BYTES)) return;
    if (
      !(await assertQuota(req, res, "contact", {
        limit: 5,
        windowSeconds: 15 * 60,
      }))
    ) return;

    try {
      const parsed = contactSchema.safeParse(req.body);
      if (!parsed.success) {
        errorEnvelope(res, 400, "invalid_request", "Invalid form data.");
        return;
      }
      const data = parsed.data;
      const operatorEmail =
        process.env.OPERATOR_EMAIL || "hello@iepandthrive.com";

      // Capture the submission before attempting email delivery so a provider
      // failure cannot lose the user's message.
      const submissionRef = await admin.firestore().collection("contactSubmissions").add({
        ...data,
        emailSent: false,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      // Generate branded email
      const template = contactNotificationTemplate({
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message,
        type: data.type,
      });

      // Send notification to operator
      const sent = await sendEmail({
        to: operatorEmail,
        subject: template.subject,
        htmlBody: template.html,
      });

      // Log to Firestore
      await logEmail(
        operatorEmail,
        template.subject,
        "contact_notification",
        sent
      );

      try {
        await submissionRef.update({
          emailSent: sent,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("Contact submission status update failed:", error);
      }

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Contact form error:", error);
      errorEnvelope(
        res,
        500,
        "internal_error",
        "Something went wrong. Please try again."
      );
    }
  }
);
