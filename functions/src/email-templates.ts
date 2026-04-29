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

// ─── Attendance Flag Notification (to parent) ───

/**
 * Real-time parent notification for an instructor-flagged attendance event.
 *
 * IMPORTANT (privacy contract):
 *   - This template MUST NOT include `attendance.notes` (instructor-private).
 *   - It MAY include `parentVisibleNote` and the flag display name.
 *   - Tone: calm, parent-readable. Not alarmist for "illness"; gentle for
 *     "needs-parent-fyi"; informative-but-direct for "injury".
 */
export function attendanceFlagTemplate(data: {
  parentName: string;
  studentName: string;
  flag: "needs-parent-fyi" | "illness" | "injury";
  flagDisplay: string;
  date: string; // YYYY-MM-DD
  parentVisibleNote: string;
}): { subject: string; html: string } {
  const safe = {
    parentName: escapeHtml(data.parentName || "Parent"),
    studentName: escapeHtml(data.studentName),
    flagDisplay: escapeHtml(data.flagDisplay),
    date: escapeHtml(data.date),
    note: data.parentVisibleNote ? escapeHtml(data.parentVisibleNote) : "",
  };

  // Per-flag intro copy. Calm. No medical advice. No legal exposure.
  const intro: Record<typeof data.flag, string> = {
    "needs-parent-fyi": `We wanted to give you a heads-up about something from <strong>${safe.studentName}</strong>'s day today. Nothing urgent &mdash; just a quick note from the instructor.`,
    illness: `We wanted to let you know <strong>${safe.studentName}</strong> wasn't feeling 100% today. They were comfortable and supported throughout the session. Please reach out with any questions.`,
    injury: `We wanted to make sure you heard from us directly: <strong>${safe.studentName}</strong> had a minor injury during today's session. They were attended to right away. Details below &mdash; please reply or call if you'd like to talk.`,
  };

  const banner: Record<typeof data.flag, { bg: string; emoji: string }> = {
    "needs-parent-fyi": { bg: "#FFF3CD", emoji: "📣" },
    illness: { bg: "#FFF3CD", emoji: "🤒" },
    injury: { bg: "#FFE4E1", emoji: "🩹" },
  };

  const b = banner[data.flag];

  return {
    subject: `[IEP & Thrive] Update on ${data.studentName} — ${data.flagDisplay}`,
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 22px; margin-bottom: 8px;">
        A note about ${safe.studentName}
      </h1>
      <p style="color: #78716C; font-size: 13px; margin: 0 0 20px 0;">
        ${safe.date}
      </p>
      <div style="background: ${b.bg}; border-radius: 12px; padding: 16px 20px; margin-bottom: 20px;">
        <p style="margin: 0; font-size: 14px; color: #1C1917;">
          <strong>${b.emoji} ${safe.flagDisplay}</strong>
        </p>
      </div>
      <p style="color: #1C1917; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        Hi ${safe.parentName},
      </p>
      <p style="color: #1C1917; font-size: 15px; line-height: 1.6; margin: 0 0 16px 0;">
        ${intro[data.flag]}
      </p>
      ${
        safe.note
          ? `<div style="background: #FDFAF4; border-left: 4px solid #1B4332; border-radius: 8px; padding: 14px 16px; margin: 16px 0;">
        <p style="margin: 0; font-size: 14px; line-height: 1.6; color: #1C1917;">
          ${safe.note}
        </p>
      </div>`
          : ""
      }
      <p style="color: #1C1917; font-size: 14px; line-height: 1.6; margin: 16px 0 0 0;">
        You can reply to this email anytime, or sign in to your
        <a href="https://iep-and-thrive.web.app/portal/notifications" style="color: #1B4332; font-weight: 600;">parent portal</a>
        to see your updates.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 24px;">
        &mdash; The IEP &amp; Thrive Team
      </p>
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

// ─── Weekly Digest (Friday Recap) ───

export interface WeeklyDigestStudentSection {
  studentName: string;
  programTrack: string;
  weekNumber: number;
  presentCount: number;
  absentCount: number;
  lateCount: number;
  daysExpected: number;
  parentVisibleNotes: { date: string; text: string }[];
  breakthroughCount: number;
  parentFyiCount: number;
  newReport: { weekNumber: number; reportUrl: string } | null;
}

function digestStudentBlock(s: WeeklyDigestStudentSection): string {
  const safeName = escapeHtml(s.studentName);
  const safeTrack = escapeHtml(s.programTrack);

  const noteRows =
    s.parentVisibleNotes.length > 0
      ? s.parentVisibleNotes
          .map(
            (n) => `
            <tr>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; width: 80px; color: #78716C; font-size: 13px;">
                ${escapeHtml(n.date)}
              </td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #eee; vertical-align: top; color: #1C1917; font-size: 14px; line-height: 1.5;">
                ${escapeHtml(n.text)}
              </td>
            </tr>
          `
          )
          .join("")
      : `<tr><td style="padding: 8px 12px; color: #78716C; font-size: 13px;">No new highlights logged this week.</td></tr>`;

  const breakthroughLine =
    s.breakthroughCount > 0
      ? `<p style="margin: 0 0 6px 0; color: #1B4332; font-size: 14px;"><strong>&#9733; ${s.breakthroughCount} breakthrough ${s.breakthroughCount === 1 ? "moment" : "moments"}</strong> noted this week.</p>`
      : "";

  const fyiLine =
    s.parentFyiCount > 0
      ? `<p style="margin: 0 0 6px 0; color: #D4860B; font-size: 14px;"><strong>&#128227; ${s.parentFyiCount} parent FYI ${s.parentFyiCount === 1 ? "flag" : "flags"}</strong> this week (you've already received the real-time notice).</p>`
      : "";

  const reportLine = s.newReport
    ? `
      <div style="margin-top: 16px;">
        <a href="${escapeHtml(s.newReport.reportUrl)}" style="display: inline-block; background: #1B4332; color: #FFFFFF; font-family: 'DM Sans', Arial, sans-serif; font-size: 14px; font-weight: 600; padding: 10px 20px; border-radius: 100px; text-decoration: none;">
          View Week ${s.newReport.weekNumber} Report &rarr;
        </a>
      </div>
    `
    : "";

  return `
    <div style="margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid rgba(27,67,50,0.12);">
      <h2 style="font-family: Georgia, serif; color: #1B4332; font-size: 20px; margin: 0 0 4px 0;">
        ${safeName}
      </h2>
      <p style="margin: 0 0 16px 0; color: #78716C; font-size: 13px;">
        ${safeTrack} &middot; Week ${s.weekNumber} of 6
      </p>

      <div style="background: #D8F3DC; border-radius: 12px; padding: 16px; margin-bottom: 16px;">
        <p style="margin: 0; font-size: 14px; color: #1B4332;">
          <strong>${s.presentCount} of ${s.daysExpected}</strong> days attended${s.lateCount > 0 ? ` &middot; ${s.lateCount} late arrival${s.lateCount === 1 ? "" : "s"}` : ""}${s.absentCount > 0 ? ` &middot; ${s.absentCount} absent` : ""}
        </p>
      </div>

      ${breakthroughLine}
      ${fyiLine}

      <h3 style="font-family: Georgia, serif; color: #1B4332; font-size: 15px; margin: 16px 0 8px 0;">
        Highlights from this week
      </h3>
      <table style="width: 100%; border-collapse: collapse;">
        ${noteRows}
      </table>

      ${reportLine}
    </div>
  `;
}

export function weeklyDigestTemplate(data: {
  parentName: string;
  weekNumber: number;
  weekRangeLabel: string;
  students: WeeklyDigestStudentSection[];
}): { subject: string; html: string } {
  const safeParent = escapeHtml(data.parentName || "there");
  const studentBlocks = data.students.map(digestStudentBlock).join("");
  const headline =
    data.students.length === 1
      ? `${escapeHtml(data.students[0].studentName)}'s Week ${data.weekNumber} recap`
      : `Week ${data.weekNumber} recap for your students`;

  return {
    subject: `Week ${data.weekNumber} recap — ${data.weekRangeLabel}`,
    html: emailLayout(`
      <h1 style="font-family: Georgia, serif; color: #1B4332; font-size: 24px; margin-bottom: 8px;">
        ${headline}
      </h1>
      <p style="color: #78716C; font-size: 14px; margin: 0 0 24px 0;">
        Hi ${safeParent}, here's your Friday recap for ${escapeHtml(data.weekRangeLabel)}.
      </p>
      ${studentBlocks}
      <p style="color: #1C1917; font-size: 14px; line-height: 1.6; margin-top: 8px;">
        See the full weekly view anytime in your
        <a href="https://iepandthrive.com/portal" style="color: #1B4332; font-weight: 600;">parent portal</a>.
      </p>
      <p style="color: #78716C; font-size: 13px; margin-top: 24px;">
        &mdash; The IEP &amp; Thrive Team
      </p>
    `),
  };
}
