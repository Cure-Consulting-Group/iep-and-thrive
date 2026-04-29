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
  | "guide_delivery"
  | "guide_drip_2"
  | "guide_drip_3"
  | "deposit_confirmation"
  | "balance_confirmation"
  | "operator_payment_notification"
  | "attendance_flag_notification"
  | "weekly_digest"
  | "general";

export interface SendEmailResult {
  ok: boolean;
  messageId: string | null;
  error?: string;
}

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
  const result = await sendEmailWithResult(options);
  return result.ok;
}

/**
 * Send an email and return detailed result including the Gmail message id
 * (for callers that need to record the upstream send for audit/dedup).
 * Falls back gracefully when credentials are not configured.
 */
export async function sendEmailWithResult(
  options: EmailOptions
): Promise<SendEmailResult> {
  const gmail = getGmailClient();
  const senderEmail =
    process.env.GMAIL_SENDER_EMAIL || "hello@iepandthrive.com";

  if (!gmail) {
    console.log(
      "[Gmail] Credentials not configured — email NOT sent (scaffold mode)"
    );
    console.log(`[Gmail] Would send to: ${options.to}`);
    console.log(`[Gmail] Subject: ${options.subject}`);
    return { ok: false, messageId: null, error: "credentials_not_configured" };
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
    const sendRes = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    const messageId = sendRes.data?.id ?? null;
    console.log(
      `[Gmail] Email sent to ${options.to}: ${options.subject} (id=${messageId})`
    );
    return { ok: true, messageId };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[Gmail] Send failed:", error);
    return { ok: false, messageId: null, error: message };
  }
}

// ─── Email Logger ───

export interface EmailLogExtras {
  bodyHtmlPreview?: string;
  messageId?: string | null;
  error?: string;
  meta?: Record<string, unknown>;
}

/**
 * Log email to Firestore for audit trail.
 *
 * Canonical emailLog/{id} shape (this writer + admin viewer at /admin/email-log):
 *   to:                  string  (recipient address)
 *   subject:             string
 *   templateType:        EmailTemplateType (kind)
 *   status:              'sent' | 'skipped' | 'failed'
 *   sentAt:              Firestore Timestamp (server)
 *   credentialsConfigured: boolean (was Gmail OAuth wired at send-time)
 *   bodyHtmlPreview?:    first 500 chars of HTML (audit only — not full body)
 *   messageId?:          Gmail message id (when send succeeded)
 *   error?:              error message string (when status === 'failed')
 *   meta?:               kind-specific extras (e.g. studentId, flag, etc.)
 *
 * Older entries written before this expansion will not have the optional
 * fields; the admin viewer normalizes at read time.
 */
export async function logEmail(
  to: string,
  subject: string,
  templateType: EmailTemplateType,
  success: boolean,
  extras: EmailLogExtras = {}
): Promise<void> {
  try {
    const status: "sent" | "skipped" | "failed" = success
      ? "sent"
      : extras.error
        ? "failed"
        : "skipped";

    const entry: Record<string, unknown> = {
      to,
      subject,
      templateType,
      status,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      credentialsConfigured: !!process.env.GMAIL_OAUTH_CLIENT_ID,
    };

    if (extras.bodyHtmlPreview !== undefined) {
      entry.bodyHtmlPreview = extras.bodyHtmlPreview.slice(0, 500);
    }
    if (extras.messageId) entry.messageId = extras.messageId;
    if (extras.error) entry.error = extras.error;
    if (extras.meta) entry.meta = extras.meta;

    await admin.firestore().collection("emailLog").add(entry);
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
