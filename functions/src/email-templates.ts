/**
 * Branded Email Templates — IEP & Thrive
 *
 * All transactional email templates using IEP & Thrive brand colors:
 * - Forest green: #1B4332
 * - Gold: #D4860B
 * - Cream: #FDFAF4
 * - Sage: #D8F3DC
 */

import { escapeHtml } from "./email-service";

// ─── Shared Layout ───

function emailLayout(content: string): string {
  return `
    <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFAF4; padding: 32px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold;">
          <span style="color: #1B4332;">IEP</span>
          <span style="color: #D4860B;"> & </span>
          <span style="color: #1B4332;">Thrive</span>
        </span>
      </div>
      <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(27,67,50,0.12);">
        ${content}
      </div>
      <p style="text-align: center; color: #78716C; font-size: 12px; margin-top: 24px;">
        IEP & Thrive · Special Education Summer Intensive<br/>
        Long Island, NY · <a href="https://iep-and-thrive.web.app" style="color: #1B4332;">iep-and-thrive.web.app</a>
      </p>
    </div>
  `;
}

// ─── Contact Notification ───

export function contactNotificationTemplate(data: {
  name: string;
  email: string;
  phone?: string;
  message: string;
  type: string;
}): { subject: string; html: string } {
  const typeLabels: Record<string, string> = {
    general: "General Inquiry",
    "iep-review": "IEP Review Request",
    "discovery-call": "Discovery Call Request",
  };

  const safe = {
    name: escapeHtml(data.name),
    email: escapeHtml(data.email),
    phone: data.phone ? escapeHtml(data.phone) : undefined,
    message: escapeHtml(data.message),
  };

  return {
    subject: `New Contact — ${typeLabels[data.type] || data.type}`,
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 16px;">
        ${typeLabels[data.type] || "New Contact"}
      </h1>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Name</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.email}</td>
        </tr>
        ${
          safe.phone
            ? `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Phone</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.phone}</td>
        </tr>`
            : ""
        }
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Message</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.message}</td>
        </tr>
      </table>
      <p style="margin-top: 16px; color: #78716C; font-size: 13px;">
        Submitted via the IEP &amp; Thrive contact form.
      </p>
    `),
  };
}

// ─── Enrollment Notification (to admin) ───

export function enrollmentNotificationTemplate(data: {
  parentName: string;
  email: string;
  phone: string;
  childGrade: string;
  programInterest: string;
  learningChallenge: string;
  notes?: string;
}): { subject: string; html: string } {
  const safe = {
    parentName: escapeHtml(data.parentName),
    email: escapeHtml(data.email),
    phone: escapeHtml(data.phone),
    childGrade: escapeHtml(data.childGrade),
    programInterest: escapeHtml(data.programInterest),
    learningChallenge: escapeHtml(data.learningChallenge),
    notes: data.notes ? escapeHtml(data.notes) : undefined,
  };

  return {
    subject: `New Enrollment Inquiry — ${safe.programInterest}`,
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 16px;">
        New Enrollment Inquiry
      </h1>
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Parent/Guardian</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.parentName}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Email</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Phone</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.phone}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Grade</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.childGrade}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Program</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.programInterest}</td>
        </tr>
        <tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Learning Challenge</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.learningChallenge}</td>
        </tr>
        ${
          safe.notes
            ? `<tr>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee; font-weight: 600;">Notes</td>
          <td style="padding: 8px 12px; border-bottom: 1px solid #eee;">${safe.notes}</td>
        </tr>`
            : ""
        }
      </table>
      <p style="margin-top: 16px; color: #78716C; font-size: 13px;">
        Submitted via the IEP &amp; Thrive enrollment form.
      </p>
    `),
  };
}

// ─── Enrollment Confirmation (to parent) ───

export function enrollmentConfirmationTemplate(data: {
  parentName: string;
  programInterest: string;
}): { subject: string; html: string } {
  const safe = {
    parentName: escapeHtml(data.parentName),
    programInterest: escapeHtml(data.programInterest),
  };

  return {
    subject: "We received your enrollment inquiry — IEP & Thrive",
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        Thank you, ${safe.parentName}!
      </h1>
      <p style="color: #1C1917; line-height: 1.6;">
        We've received your enrollment inquiry for the <strong>${safe.programInterest}</strong> program.
        Our team will review your submission and reach out within 24 hours to discuss
        program fit and next steps.
      </p>
      <p style="color: #1C1917; line-height: 1.6;">
        In the meantime, if you have any questions, feel free to reply to this email
        or book a free discovery call on our website.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 24px;">
        &mdash; The IEP &amp; Thrive Team<br/>
        A program of Cure Consulting Group
      </p>
    `),
  };
}

// ─── Booking Confirmation ───

export function bookingConfirmationTemplate(data: {
  parentName: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
}): { subject: string; html: string } {
  const typeLabel =
    data.type === "discovery_call"
      ? "Discovery Call"
      : data.type === "consultation"
        ? "Consultation"
        : "Check-In";

  return {
    subject: `Booking Confirmed — ${typeLabel} on ${data.date}`,
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        Booking Confirmed ✓
      </h1>
      <p style="color: #78716C; font-size: 14px; margin-bottom: 24px;">
        Hi ${escapeHtml(data.parentName)}, your ${typeLabel.toLowerCase()} has been confirmed.
      </p>
      <div style="background: #D8F3DC; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>📅 Date:</strong> ${data.date}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>🕐 Time:</strong> ${data.startTime} — ${data.endTime} ET</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>📋 Type:</strong> ${typeLabel}</p>
        <p style="margin: 0; font-size: 14px;"><strong>👧 Student:</strong> ${escapeHtml(data.studentName)}</p>
      </div>
      <p style="color: #78716C; font-size: 13px; line-height: 1.6;">
        We'll send you a reminder 24 hours before your session. If you need to reschedule,
        please do so at least 24 hours in advance through your parent portal.
      </p>
    `),
  };
}

// ─── Booking Reminder ───

export function bookingReminderTemplate(data: {
  parentName: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  type: string;
}): { subject: string; html: string } {
  const typeLabel =
    data.type === "discovery_call"
      ? "Discovery Call"
      : data.type === "consultation"
        ? "Consultation"
        : "Check-In";

  return {
    subject: `Reminder: ${typeLabel} Tomorrow at ${data.startTime}`,
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        Reminder: Tomorrow's Session
      </h1>
      <p style="color: #78716C; font-size: 14px; margin-bottom: 24px;">
        Hi ${escapeHtml(data.parentName)}, this is a reminder about your upcoming ${typeLabel.toLowerCase()}.
      </p>
      <div style="background: #FFF3CD; border-radius: 12px; padding: 20px;">
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>📅 Date:</strong> ${data.date}</p>
        <p style="margin: 0 0 8px 0; font-size: 14px;"><strong>🕐 Time:</strong> ${data.startTime} — ${data.endTime} ET</p>
        <p style="margin: 0; font-size: 14px;"><strong>👧 Student:</strong> ${escapeHtml(data.studentName)}</p>
      </div>
    `),
  };
}

// ─── Booking Cancellation ───

export function bookingCancellationTemplate(data: {
  parentName: string;
  studentName: string;
  date: string;
  startTime: string;
  type: string;
}): { subject: string; html: string } {
  const typeLabel =
    data.type === "discovery_call"
      ? "Discovery Call"
      : data.type === "consultation"
        ? "Consultation"
        : "Check-In";

  return {
    subject: `Booking Cancelled — ${typeLabel} on ${data.date}`,
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        Booking Cancelled
      </h1>
      <p style="color: #78716C; font-size: 14px; margin-bottom: 24px;">
        Hi ${escapeHtml(data.parentName)}, your ${typeLabel.toLowerCase()} on <strong>${data.date}</strong> at <strong>${data.startTime}</strong>
        for <strong>${escapeHtml(data.studentName)}</strong> has been cancelled.
      </p>
      <p style="color: #1C1917; font-size: 14px; line-height: 1.6;">
        If you'd like to rebook, visit your parent portal or contact us directly.
      </p>
    `),
  };
}
