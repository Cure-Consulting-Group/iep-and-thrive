/**
 * Enrollment Cloud Function
 * Replaces /api/enroll — handles enrollment form submissions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { z } from "zod";
import { sendEmail, logEmail } from "./email-service";
import {
  enrollmentNotificationTemplate,
  enrollmentConfirmationTemplate,
} from "./email-templates";
import {
  PUBLIC_CORS_ORIGINS,
  assertBodySize,
  assertContentType,
  assertMethod,
  assertQuota,
  errorEnvelope,
} from "./http-guard";

const enrollmentSchema = z.object({
  parentName: z.string().min(2).max(120),
  email: z.string().email().max(320),
  phone: z.string().min(10).max(32),
  childGrade: z.string().min(1).max(80),
  programInterest: z.string().min(1).max(160),
  learningChallenge: z.string().min(1).max(160),
  notes: z.string().max(4000).optional(),
}).strict();

const MAX_BODY_BYTES = 32 * 1024;

export const enroll = onRequest(
  {
    cors: PUBLIC_CORS_ORIGINS,
    region: "us-east1",
  },
  async (req, res) => {
    if (!assertMethod(req, res, ["POST"])) return;
    if (!assertContentType(req, res)) return;
    if (!assertBodySize(req, res, MAX_BODY_BYTES)) return;
    if (
      !(await assertQuota(req, res, "enroll", {
        limit: 3,
        windowSeconds: 60 * 60,
      }))
    ) return;

    try {
      const parsed = enrollmentSchema.safeParse(req.body);
      if (!parsed.success) {
        errorEnvelope(res, 400, "invalid_request", "Invalid enrollment data.");
        return;
      }
      const data = parsed.data;
      const operatorEmail =
        process.env.OPERATOR_EMAIL || "hello@iepandthrive.com";

      // Persist before either email is attempted so a provider failure cannot
      // lose the enrollment inquiry.
      const inquiryRef = await admin
        .firestore()
        .collection("enrollmentInquiries")
        .add({
          ...data,
          notificationSent: false,
          confirmationSent: false,
          submittedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      // 1. Send notification to operator
      const notifTemplate = enrollmentNotificationTemplate(data);
      const notifSent = await sendEmail({
        to: operatorEmail,
        subject: notifTemplate.subject,
        htmlBody: notifTemplate.html,
      });
      await logEmail(
        operatorEmail,
        notifTemplate.subject,
        "enrollment_notification",
        notifSent
      );
      try {
        await inquiryRef.update({
          notificationSent: notifSent,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("Enrollment notification status update failed:", error);
      }

      // 2. Send confirmation to parent
      const confirmTemplate = enrollmentConfirmationTemplate({
        parentName: data.parentName,
        programInterest: data.programInterest,
      });
      const confirmSent = await sendEmail({
        to: data.email,
        subject: confirmTemplate.subject,
        htmlBody: confirmTemplate.html,
      });
      await logEmail(
        data.email,
        confirmTemplate.subject,
        "enrollment_confirmation",
        confirmSent
      );
      try {
        await inquiryRef.update({
          confirmationSent: confirmSent,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("Enrollment confirmation status update failed:", error);
      }

      res.status(200).json({ success: true, inquiryId: inquiryRef.id });
    } catch (error) {
      console.error("Enrollment form error:", error);
      errorEnvelope(
        res,
        500,
        "internal_error",
        "Something went wrong. Please try again."
      );
    }
  }
);
