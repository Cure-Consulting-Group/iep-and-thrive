/**
 * Email Service — Gmail API Integration
 *
 * Sends transactional emails via Gmail API with graceful fallback
 * when credentials are not configured. Logs all emails to Firestore.
 */

import * as admin from "firebase-admin";
import { google } from "googleapis";
import * as crypto from "crypto";

// ─── Types ───

export interface EmailAttachment {
  filename: string;
  /** Buffer of file body, or base64-encoded string. */
  content: Buffer | string;
  contentType: string;
}

export interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  textBody?: string;
  /**
   * E3: optional attachments. When present, the outgoing message is rendered
   * as multipart/mixed wrapping the alternative body. Each attachment becomes
   * a Content-Disposition: attachment part.
   */
  attachments?: EmailAttachment[];
  /** Classification drives consent handling. `service` mail is necessary
   * transactional mail; lifecycle and marketing mail are suppressible. */
  classification?: EmailClassification;
  /** Legacy alias retained for existing callers. `transactional` maps to service. */
  kind?: "transactional" | EmailClassification;
  recipientUid?: string;
}

export type EmailClassification = "service" | "lifecycle" | "marketing";

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
  status?: "delivered" | "failed" | "skipped";
}

export interface RecipientPreferences {
  unsubscribed: boolean;
  isTest: boolean;
}

export interface EmailSendDependencies {
  /** Test seam for preference reads; production uses Firestore. */
  preferenceLookup?: (
    options: EmailOptions
  ) => Promise<RecipientPreferences | null>;
  /** Test seam for the provider; production uses Gmail below. */
  transport?: (
    options: EmailOptions
  ) => Promise<{ ok: boolean; messageId: string | null; error?: string } | boolean>;
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
export async function sendEmail(
  options: EmailOptions,
  dependencies: EmailSendDependencies = {}
): Promise<boolean> {
  const result = await sendEmailWithResult(options, dependencies);
  return result.ok;
}

function classificationFor(options: EmailOptions): EmailClassification {
  if (options.classification) return options.classification;
  if (options.kind === "lifecycle" || options.kind === "marketing") {
    return options.kind;
  }
  return "service";
}

function isLegacyTransactional(options: EmailOptions): boolean {
  return options.classification === undefined && options.kind === "transactional";
}

/**
 * Hash identifiers before they reach logs. Email addresses are still accepted
 * as inputs because Gmail needs them, but they must not be emitted as logs.
 */
export function recipientFingerprint(recipient: string): string {
  return crypto.createHash("sha256").update(recipient.trim().toLowerCase()).digest("hex").slice(0, 16);
}

/** Keep provider and database errors useful without retaining secrets or PII. */
export function redactError(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error);
  return raw
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(bearer\s+|authorization\s*[:=]\s*|(?:api[_-]?key|secret|token|password)\s*[:=]\s*)[^\s,;]+/gi, "$1[redacted]")
    .slice(0, 500);
}

async function lookupRecipientPreferences(options: EmailOptions): Promise<RecipientPreferences | null> {
  const db = admin.firestore();
  if (options.recipientUid) {
    const userSnap = await db.collection("users").doc(options.recipientUid).get();
    if (!userSnap.exists) return null;
    const data = userSnap.data() ?? {};
    return {
      unsubscribed: data.unsubscribed === true,
      isTest: data.isTest === true,
    };
  }

  // Guide leads are anonymous recipients, so their preference record is
  // looked up by normalized email. No matching record means no consent source.
  const leadSnap = await db
    .collection("guideLeads")
    .where("email", "==", options.to.trim().toLowerCase())
    .limit(1)
    .get();
  const lead = leadSnap.docs[0];
  if (!lead) return null;
  const data = lead.data() ?? {};
  return {
    unsubscribed: data.unsubscribed === true,
    isTest: data.isTest === true,
  };
}

/**
 * Send an email and return detailed result including the Gmail message id
 * (for callers that need to record the upstream send for audit/dedup).
 * Falls back gracefully when credentials are not configured.
 */
export async function sendEmailWithResult(
  options: EmailOptions,
  dependencies: EmailSendDependencies = {}
): Promise<SendEmailResult> {
  const classification = classificationFor(options);
  const legacyTransactional = isLegacyTransactional(options);

  try {
    const preferences = await (dependencies.preferenceLookup ?? lookupRecipientPreferences)(options);
    if (!preferences && classification !== "service") {
      return {
        ok: false,
        messageId: null,
        error: "recipient_preferences_missing",
        status: "skipped",
      };
    }
    if (preferences?.unsubscribed && classification !== "service") {
      return {
        ok: false,
        messageId: null,
        error: "recipient_unsubscribed",
        status: "skipped",
      };
    }
    if (preferences?.isTest && !legacyTransactional) {
      // Test recipients are isolated from real mail. The explicit legacy
      // transactional path remains the founder preview bypass used by the
      // existing preview endpoint; production lifecycle/marketing paths do not.
      return {
        ok: false,
        messageId: null,
        error: "recipient_is_test",
        status: "skipped",
      };
    }
  } catch (error) {
    if (classification !== "service") {
      // Lifecycle and marketing consent fail closed: a preference outage is
      // not evidence of permission to send.
      return {
        ok: false,
        messageId: null,
        error: "recipient_preferences_unavailable",
        status: "skipped",
      };
    }

    // Service mail may proceed when preference lookup fails. Receipts,
    // security notices, and booking confirmations are necessary transactional
    // messages; suppressing them can create harm of its own.
    console.error("[Email] Service preference lookup failed; continuing with necessary mail:", redactError(error));
  }

  if (dependencies.transport) {
    try {
      const transported = await dependencies.transport(options);
      const result = typeof transported === "boolean"
        ? { ok: transported, messageId: null, error: transported ? undefined : "provider_rejected" }
        : transported;
      return {
        ...result,
        status: result.ok ? "delivered" : "failed",
      };
    } catch (error) {
      return {
        ok: false,
        messageId: null,
        error: redactError(error),
        status: "failed",
      };
    }
  }

  const gmail = getGmailClient();
  const senderEmail =
    process.env.GMAIL_SENDER_EMAIL || "hello@iepandthrive.com";

  if (!gmail) {
    console.log(
      "[Gmail] Credentials not configured — email NOT sent (scaffold mode)"
    );
    console.log("[Gmail] Would send email (recipient and subject redacted)");
    return { ok: false, messageId: null, error: "credentials_not_configured", status: "failed" };
  }

  // Build the message body. If textBody is provided, send multipart/alternative
  // so clients that prefer plain-text (or strip HTML) get a readable fallback.
  // E3: when attachments are present we wrap the alternative in a
  //     multipart/mixed envelope and add Content-Disposition: attachment parts.
  const hasAttachments = !!(options.attachments && options.attachments.length);
  const altBoundary = `iet-alt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  const mixBoundary = `iet-mix-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

  function altPart(): string {
    if (options.textBody) {
      return (
        `Content-Type: multipart/alternative; boundary="${altBoundary}"\r\n\r\n` +
        `--${altBoundary}\r\n` +
        `Content-Type: text/plain; charset=utf-8\r\n\r\n` +
        options.textBody +
        `\r\n--${altBoundary}\r\n` +
        `Content-Type: text/html; charset=utf-8\r\n\r\n` +
        options.htmlBody +
        `\r\n--${altBoundary}--\r\n`
      );
    }
    return `Content-Type: text/html; charset=utf-8\r\n\r\n` + options.htmlBody;
  }

  function attachmentParts(): string {
    if (!options.attachments) return "";
    let out = "";
    for (const att of options.attachments) {
      const buf = typeof att.content === "string" ? Buffer.from(att.content, "base64") : att.content;
      const b64 = buf.toString("base64").replace(/(.{76})/g, "$1\r\n");
      out +=
        `--${mixBoundary}\r\n` +
        `Content-Type: ${att.contentType}; name="${att.filename}"\r\n` +
        `Content-Transfer-Encoding: base64\r\n` +
        `Content-Disposition: attachment; filename="${att.filename}"\r\n\r\n` +
        b64 +
        `\r\n`;
    }
    return out;
  }

  let bodyBlock: string;
  if (hasAttachments) {
    bodyBlock =
      `MIME-Version: 1.0\r\n` +
      `Content-Type: multipart/mixed; boundary="${mixBoundary}"\r\n\r\n` +
      `--${mixBoundary}\r\n` +
      altPart() +
      `\r\n` +
      attachmentParts() +
      `--${mixBoundary}--\r\n`;
  } else if (options.textBody) {
    bodyBlock =
      `MIME-Version: 1.0\r\n` +
      altPart();
  } else {
    bodyBlock = `MIME-Version: 1.0\r\nContent-Type: text/html; charset=utf-8\r\n\r\n` + options.htmlBody;
  }

  const raw = Buffer.from(
    `From: IEP & Thrive <${senderEmail}>\r\n` +
      `To: ${options.to}\r\n` +
      `Subject: ${options.subject}\r\n` +
      bodyBlock
  ).toString("base64url");

  try {
    const sendRes = await gmail.users.messages.send({
      userId: "me",
      requestBody: { raw },
    });
    const messageId = sendRes.data?.id ?? null;
    console.log("[Gmail] Email sent", messageId ? "(provider id recorded)" : "");
    return { ok: true, messageId, status: "delivered" };
  } catch (error) {
    const message = redactError(error);
    console.error("[Gmail] Send failed:", message);
    return { ok: false, messageId: null, error: message, status: "failed" };
  }
}

// ─── Email Logger ───

export interface EmailLogExtras {
  /** Legacy input accepted for callers; never persisted. */
  bodyHtmlPreview?: string;
  messageId?: string | null;
  error?: string;
  skipped?: boolean;
  meta?: Record<string, unknown>;
}

function redactLogValue(value: unknown): unknown {
  if (typeof value === "string") return redactError(value);
  if (Array.isArray(value)) return value.map(redactLogValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nested]) => [key, redactLogValue(nested)])
    );
  }
  return value;
}

function isSuppressionError(error: string | undefined): boolean {
  return error === "recipient_unsubscribed" ||
    error === "recipient_is_test" ||
    error === "recipient_preferences_missing" ||
    error === "recipient_preferences_unavailable";
}

/**
 * Log email to Firestore for audit trail.
 *
 * Canonical emailLog/{id} shape (this writer + admin viewer at /admin/email-log):
 *   recipientFingerprint: short hash of the recipient address
 *   subject:             string
 *   templateType:        EmailTemplateType (kind)
 *   status:              'sent' | 'skipped' | 'failed'
 *   sentAt:              Firestore Timestamp (server)
 *   credentialsConfigured: boolean (was Gmail OAuth wired at send-time)
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
      : extras.skipped || isSuppressionError(extras.error)
        ? "skipped"
        : extras.error
          ? "failed"
          : "skipped";

    const entry: Record<string, unknown> = {
      recipientFingerprint: recipientFingerprint(to),
      subject,
      templateType,
      status,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      credentialsConfigured: !!process.env.GMAIL_OAUTH_CLIENT_ID,
    };

    if (extras.messageId) entry.messageId = extras.messageId;
    if (extras.error) entry.error = redactError(extras.error);
    if (extras.meta) entry.meta = redactLogValue(extras.meta);

    await admin.firestore().collection("emailLog").add(entry);
  } catch (error) {
    console.error("[EmailLog] Failed to log email:", redactError(error));
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
