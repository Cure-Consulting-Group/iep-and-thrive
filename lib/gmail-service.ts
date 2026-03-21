/**
 * Gmail Email Service — Scaffold
 *
 * This module will integrate with the Gmail API to send transactional emails:
 * 1. Booking confirmations
 * 2. Booking reminders (24hr before)
 * 3. Enrollment confirmations
 * 4. Weekly report notifications
 * 5. General communications
 *
 * SETUP REQUIRED:
 * 1. Enable the Gmail API in GCP Console:
 *    https://console.cloud.google.com/apis/library/gmail.googleapis.com?project=iep-and-thrive
 *
 * 2. Create OAuth2 credentials (Gmail API requires OAuth2, not service accounts):
 *    - Create credentials → OAuth client ID → Web application
 *    - Set authorized redirect URIs
 *    - Complete consent flow to get refresh token
 *
 * 3. Set environment variables (in Cloud Functions or .env):
 *    GMAIL_OAUTH_CLIENT_ID=
 *    GMAIL_OAUTH_CLIENT_SECRET=
 *    GMAIL_OAUTH_REFRESH_TOKEN=
 *    GMAIL_SENDER_EMAIL=hello@iepandthrive.com
 *
 * 4. Install googleapis:
 *    npm install googleapis
 *
 * USAGE (after setup):
 *    import { sendBookingConfirmation, sendBookingReminder } from '@/lib/gmail-service'
 */

// ─── Types ───

export interface EmailOptions {
  to: string
  subject: string
  htmlBody: string
  textBody?: string
}

export type EmailTemplateType =
  | 'booking_confirmation'
  | 'booking_reminder'
  | 'enrollment_confirmation'
  | 'weekly_report'
  | 'general'

// ─── Email Templates ───

export function getBookingConfirmationEmail(data: {
  parentName: string
  studentName: string
  date: string
  startTime: string
  endTime: string
  type: string
}): EmailOptions {
  const typeLabel = data.type === 'discovery_call' ? 'Discovery Call'
    : data.type === 'consultation' ? 'Consultation' : 'Check-In'

  return {
    to: '', // will be set by caller
    subject: `Booking Confirmed — ${typeLabel} on ${data.date}`,
    htmlBody: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFAF4; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold;">
            <span style="color: #1B4332;">IEP</span>
            <span style="color: #D4860B;"> & </span>
            <span style="color: #1B4332;">Thrive</span>
          </span>
        </div>

        <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(27,67,50,0.12);">
          <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
            Booking Confirmed ✓
          </h1>
          <p style="color: #78716C; font-size: 14px; margin-bottom: 24px;">
            Hi ${data.parentName}, your ${typeLabel.toLowerCase()} has been confirmed.
          </p>

          <div style="background: #D8F3DC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>📅 Date:</strong> ${data.date}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>🕐 Time:</strong> ${data.startTime} — ${data.endTime} ET</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>📋 Type:</strong> ${typeLabel}</p>
            <p style="margin: 0; font-size: 14px;"><strong>👧 Student:</strong> ${data.studentName}</p>
          </div>

          <p style="color: #78716C; font-size: 13px; line-height: 1.6;">
            We'll send you a reminder 24 hours before your session. If you need to reschedule,
            please do so at least 24 hours in advance through your parent portal.
          </p>
        </div>

        <p style="text-align: center; color: #78716C; font-size: 12px; margin-top: 24px;">
          IEP & Thrive · Special Education Summer Intensive<br/>
          Long Island, NY · <a href="https://iepandthrive.com" style="color: #1B4332;">iepandthrive.com</a>
        </p>
      </div>
    `,
    textBody: `Booking Confirmed — ${typeLabel}\n\nHi ${data.parentName},\n\nYour ${typeLabel.toLowerCase()} has been confirmed:\n\nDate: ${data.date}\nTime: ${data.startTime} — ${data.endTime} ET\nStudent: ${data.studentName}\n\nWe'll send you a reminder 24 hours before your session.\n\n— IEP & Thrive`,
  }
}

export function getBookingReminderEmail(data: {
  parentName: string
  studentName: string
  date: string
  startTime: string
  endTime: string
  type: string
}): EmailOptions {
  const typeLabel = data.type === 'discovery_call' ? 'Discovery Call'
    : data.type === 'consultation' ? 'Consultation' : 'Check-In'

  return {
    to: '',
    subject: `Reminder: ${typeLabel} Tomorrow at ${data.startTime}`,
    htmlBody: `
      <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFAF4; padding: 32px;">
        <div style="text-align: center; margin-bottom: 24px;">
          <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold;">
            <span style="color: #1B4332;">IEP</span>
            <span style="color: #D4860B;"> & </span>
            <span style="color: #1B4332;">Thrive</span>
          </span>
        </div>
        <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(27,67,50,0.12);">
          <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
            Reminder: Tomorrow's Session
          </h1>
          <p style="color: #78716C; font-size: 14px; margin-bottom: 24px;">
            Hi ${data.parentName}, this is a reminder about your upcoming ${typeLabel.toLowerCase()}.
          </p>
          <div style="background: #FFF3CD; border-radius: 12px; padding: 20px;">
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>📅 Date:</strong> ${data.date}</p>
            <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>🕐 Time:</strong> ${data.startTime} — ${data.endTime} ET</p>
            <p style="margin: 0; font-size: 14px;"><strong>👧 Student:</strong> ${data.studentName}</p>
          </div>
        </div>
        <p style="text-align: center; color: #78716C; font-size: 12px; margin-top: 24px;">
          IEP & Thrive · <a href="https://iepandthrive.com" style="color: #1B4332;">iepandthrive.com</a>
        </p>
      </div>
    `,
    textBody: `Reminder: ${typeLabel} Tomorrow\n\nHi ${data.parentName}, this is a reminder about your ${typeLabel.toLowerCase()} tomorrow.\n\nDate: ${data.date}\nTime: ${data.startTime} — ${data.endTime} ET\nStudent: ${data.studentName}\n\n— IEP & Thrive`,
  }
}

// ─── Send Function (Scaffold) ───

/**
 * Send an email via Gmail API.
 *
 * TODO: Implement after Gmail API credentials are configured.
 */
export async function sendEmail(options: EmailOptions): Promise<boolean> {
  console.log('[Gmail] Email send scaffold — credentials not yet configured')
  console.log('[Gmail] Would send to:', options.to, '| Subject:', options.subject)

  // Placeholder — return true to simulate success
  return true

  /*
  // ──── Implementation Template ────
  // Uncomment and configure after setting up credentials

  import { google } from 'googleapis'

  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_OAUTH_CLIENT_ID,
    process.env.GMAIL_OAUTH_CLIENT_SECRET,
  )

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_OAUTH_REFRESH_TOKEN,
  })

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client })

  const raw = Buffer.from(
    `From: IEP & Thrive <${process.env.GMAIL_SENDER_EMAIL}>\r\n` +
    `To: ${options.to}\r\n` +
    `Subject: ${options.subject}\r\n` +
    `Content-Type: text/html; charset=utf-8\r\n\r\n` +
    options.htmlBody
  ).toString('base64url')

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    })
    return true
  } catch (error) {
    console.error('[Gmail] Send failed:', error)
    return false
  }
  */
}

/**
 * Log email to Firestore for audit trail.
 *
 * TODO: Connect to Firestore emailLog collection.
 */
export async function logEmail(
  to: string,
  subject: string,
  templateType: EmailTemplateType,
  success: boolean
): Promise<void> {
  console.log(`[Gmail] Log: ${templateType} → ${to} (${success ? 'sent' : 'failed'})`)

  /*
  // ──── Implementation Template ────
  import { addDoc, collection, serverTimestamp } from 'firebase/firestore'
  import { db } from '@/lib/firebase'

  await addDoc(collection(db, 'emailLog'), {
    to,
    subject,
    templateType,
    status: success ? 'sent' : 'failed',
    sentAt: serverTimestamp(),
    error: success ? null : 'Send failed',
  })
  */
}
