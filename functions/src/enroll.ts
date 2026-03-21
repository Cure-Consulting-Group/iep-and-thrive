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

const enrollmentSchema = z.object({
  parentName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
  childGrade: z.string().min(1),
  programInterest: z.string().min(1),
  learningChallenge: z.string().min(1),
  notes: z.string().optional(),
});

export const enroll = onRequest(
  {
    cors: [
      "https://iep-and-thrive.web.app",
      "https://iepandthrive.com",
      /localhost/,
    ],
    region: "us-east1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).json({ success: false, error: "Method not allowed" });
      return;
    }

    try {
      const data = enrollmentSchema.parse(req.body);
      const operatorEmail =
        process.env.OPERATOR_EMAIL || "hello@iepandthrive.com";

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

      // 3. Save enrollment inquiry to Firestore
      await admin.firestore().collection("enrollmentInquiries").add({
        ...data,
        notificationSent: notifSent,
        confirmationSent: confirmSent,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Invalid form data" });
        return;
      }
      console.error("Enrollment form error:", error);
      res
        .status(500)
        .json({
          success: false,
          error: "Something went wrong. Please try again.",
        });
    }
  }
);
