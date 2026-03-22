/**
 * Summer Guide Capture Cloud Function
 * Handles email capture for the free IEP Summer Guide PDF download.
 * Stores lead in Firestore and sends the guide delivery email immediately.
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { sendEmail, logEmail, escapeHtml } from "./email-service";
import { summerGuideDeliveryTemplate } from "./summer-guide-emails";

export const summerGuideCapture = onRequest(
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
      const { name, email } = req.body;

      // Validate required fields
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        res
          .status(400)
          .json({ success: false, error: "Name is required (min 2 characters)." });
        return;
      }

      if (
        !email ||
        typeof email !== "string" ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
      ) {
        res
          .status(400)
          .json({ success: false, error: "A valid email address is required." });
        return;
      }

      const cleanName = name.trim();
      const cleanEmail = email.trim().toLowerCase();

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
      res
        .status(500)
        .json({
          success: false,
          error: "Something went wrong. Please try again.",
        });
    }
  }
);
