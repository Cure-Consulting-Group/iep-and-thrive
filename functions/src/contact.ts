/**
 * Contact Cloud Function
 * Replaces /api/contact — handles contact form submissions
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { z } from "zod";
import { sendEmail, logEmail } from "./email-service";
import { contactNotificationTemplate } from "./email-templates";

const contactSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  message: z.string().min(10),
  type: z.enum(["general", "iep-review", "discovery-call"]),
});

export const contact = onRequest(
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
      const data = contactSchema.parse(req.body);
      const operatorEmail =
        process.env.OPERATOR_EMAIL || "hello@iepandthrive.com";

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

      // Also save the contact submission itself
      await admin.firestore().collection("contactSubmissions").add({
        ...data,
        emailSent: sent,
        submittedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      res.status(200).json({ success: true });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: "Invalid form data" });
        return;
      }
      console.error("Contact form error:", error);
      res
        .status(500)
        .json({
          success: false,
          error: "Something went wrong. Please try again.",
        });
    }
  }
);
