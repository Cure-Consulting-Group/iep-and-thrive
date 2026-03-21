/**
 * Email Service — Gmail API Integration
 *
 * Sends transactional emails via Gmail API with graceful fallback
 * when credentials are not configured. Logs all emails to Firestore.
 */

import * as admin from "firebase-admin";
import { google } from "googleapis";

// ─── Types ───

export interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
}

export type EmailTemplateType =
  | "contact_notification"
  | "enrollment_notification"
  | "enrollment_confirmation"
  | "booking_confirmation"
  | "booking_reminder"
  | "booking_cancellation"
  | "general";

// ─── Gmail API Setup ───

function getGmailClient() {
  const clientId = process.env.GMAIL_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GMAIL_OAUTH_CLIENT_SECRET;
  const refreshToken = process.env.GMAIL_OAUTH_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    return null;
  }

  const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
  oauth2Client.setCredentials({ refresh_token: refreshToken });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

// ─── Send Function ───

/**
 * Send an email via Gmail API.
 * Falls back gracefully when credentials are not configured.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  const gmail = getGmailClient();
  const senderEmail =
    process.env.GMAIL_SENDER_EMAIL || "hello@iepandthrive.com";

  if (!gmail) {
    console.log(
      "[Gmail] Credentials not configured — email NOT sent (scaffold mode)"
    );
    console.log(`[Gmail] Would send to: ${options.to}`);
    console.log(`[Gmail] Subject: ${options.subject}`);
    return false;
  }

  const raw = Buffer.from(
    `From: IEP & Thrive <${senderEmail}>\r\n` +
      `To: ${options.to}\r\n` +
      `Subject: ${options.subject}\r\n` +
      `MIME-Version: 1.0\r\n` +
      `Content-Type: text/html; charset=utf-8\r\n\r\n` +
      options.htmlBody
  ).toString("base64url");

  try {
    await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    console.log(`[Gmail] Email sent to ${options.to}: ${options.subject}`);
    return true;
  } catch (error) {
    console.error("[Gmail] Send failed:", error);
    return false;
  }
}

// ─── Email Logger ───

/**
 * Log email to Firestore for audit trail.
 */
export async function logEmail(
  to: string,
  subject: string,
  templateType: EmailTemplateType,
  success: boolean
): Promise<void> {
  try {
    await admin
      .firestore()
      .collection("emailLog")
      .add({
        to,
        subject,
        templateType,
        status: success ? "sent" : "skipped",
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        credentialsConfigured: !!process.env.GMAIL_OAUTH_CLIENT_ID,
      });
  } catch (error) {
    console.error("[EmailLog] Failed to log email:", error);
  }
}

// ─── HTML Escape ───

export function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
