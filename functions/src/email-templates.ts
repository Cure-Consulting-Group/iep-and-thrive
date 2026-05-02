/**
 * Branded Email Templates — IEP & Thrive
 *
 * All transactional email templates using IEP & Thrive brand colors:
 * - Forest green: #1B4332
 * - Gold: #D4860B
 * - Cream: #FDFAF4
 * - Sage: #D8F3DC
 *
 * G1 Foundation (Epic G):
 * - emailLayout() accepts a string (legacy) or an EmailLayoutOpts object
 *   with preheader, footerNotes, and `kind` (transactional | lifecycle |
 *   marketing). Lifecycle/marketing emails get an unsubscribe link in the
 *   footer per CAN-SPAM (G2).
 * - renderEmail() returns { subject, html, text } with auto-generated
 *   plain-text fallback for new templates.
 * - Physical address sourced from OPERATOR_PHYSICAL_ADDRESS env var with
 *   a clearly-marked placeholder fallback until founder confirms (G2).
 */

import { escapeHtml } from "./email-service";
import { generateUnsubscribeToken } from "./unsubscribe-token";

// ─── Shared variable schema (Epic G) ───

export interface EmailVariables {
  parentName?: string;
  parentEmail?: string;
  studentName?: string;
  programTrack?: "reading" | "math" | "full" | string;
  cohortStartISO?: string;
  cohortEndISO?: string;
  programLocation?: string;
  programDailyHours?: string;
  portalUrl?: string;
  deadlineISO?: string;
}

export type EmailKind = "transactional" | "lifecycle" | "marketing";

export interface EmailLayoutOpts {
  content: string;
  preheader?: string;
  footerNotes?: string;
  kind?: EmailKind;
  unsubscribeToken?: string;
}

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

// ─── Foundation helpers ───

function getPhysicalAddress(): string {
  return (
    process.env.OPERATOR_PHYSICAL_ADDRESS ||
    "Long Island, NY · [Mailing address pending — set OPERATOR_PHYSICAL_ADDRESS env var]"
  );
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://iep-and-thrive.web.app";

/**
 * Strip HTML to plain-text. Conservative — handles the tags our templates
 * actually use (p, br, h1-h6, li, a, strong, em). For richer needs we'd
 * pull in `html-to-text`; this stays dep-free.
 */
export function htmlToPlainText(html: string): string {
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<head[^>]*>[\s\S]*?<\/head>/gi, "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p\s*>/gi, "\n\n")
    .replace(/<\/h[1-6]\s*>/gi, "\n\n")
    .replace(/<\/li\s*>/gi, "\n")
    .replace(/<li[^>]*>/gi, "  • ")
    .replace(/<\/tr\s*>/gi, "\n")
    .replace(/<\/td\s*>/gi, "  ")
    .replace(/<a [^>]*href="([^"]+)"[^>]*>([^<]+)<\/a>/gi, "$2 ($1)")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

// ─── Shared Layout ───
//
// Accepts either a string (legacy callers — auto-wrapped as transactional)
// or an EmailLayoutOpts object. Returns full HTML document with header,
// content card, and CAN-SPAM-compliant footer (address always; unsubscribe
// link for lifecycle/marketing).

function emailLayout(contentOrOpts: string | EmailLayoutOpts): string {
  // Legacy callers (string content) get the original simple shell — preserves
  // production behavior for the 9 existing templates until each is migrated
  // to the EmailLayoutOpts object form.
  if (typeof contentOrOpts === "string") {
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
        ${contentOrOpts}
      </div>
      <p style="text-align: center; color: #78716C; font-size: 12px; margin-top: 24px;">
        IEP & Thrive · Special Education Summer Intensive<br/>
        Long Island, NY · <a href="https://iep-and-thrive.web.app" style="color: #1B4332;">iep-and-thrive.web.app</a>
      </p>
    </div>
  `;
  }

  // New form: full G1 shell with preheader, footer notes, and CAN-SPAM
  // compliance footer (address + unsubscribe for lifecycle/marketing).
  const opts = contentOrOpts;
  const kind = opts.kind ?? "transactional";
  const showUnsubscribe = kind !== "transactional";

  const preheaderHtml = opts.preheader
    ? `<div style="display:none;font-size:1px;color:#FDFAF4;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${escapeHtml(opts.preheader)}</div>`
    : "";

  const footerNotesHtml = opts.footerNotes
    ? `<p style="text-align:center;color:#78716C;font-size:13px;margin-top:24px;">${opts.footerNotes}</p>`
    : "";

  const unsubLink = opts.unsubscribeToken
    ? `${SITE_URL}/unsubscribe?token=${encodeURIComponent(opts.unsubscribeToken)}`
    : `${SITE_URL}/unsubscribe`;

  const complianceHtml = showUnsubscribe
    ? `<p style="margin:0;font-size:11px;line-height:1.5;">You're receiving this as a parent or prospect of IEP &amp; Thrive. <a href="${unsubLink}" style="color:#78716C;text-decoration:underline;">Unsubscribe</a> · A program of Cure Consulting Group.</p>`
    : `<p style="margin:0;font-size:11px;line-height:1.5;">This is a transactional email related to your IEP &amp; Thrive account · A program of Cure Consulting Group.</p>`;

  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
</head>
<body style="margin:0;padding:0;background:#FDFAF4;">
  ${preheaderHtml}
  <div style="font-family: 'DM Sans', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #FDFAF4; padding: 32px;">
    <div style="text-align: center; margin-bottom: 24px;">
      <span style="font-family: Georgia, serif; font-size: 22px; font-weight: bold;">
        <span style="color: #1B4332;">IEP</span>
        <span style="color: #D4860B;"> &amp; </span>
        <span style="color: #1B4332;">Thrive</span>
      </span>
    </div>
    <div style="background: white; border-radius: 16px; padding: 32px; border: 1px solid rgba(27,67,50,0.12);">
      ${opts.content}
    </div>
    ${footerNotesHtml}
    <div style="text-align:center;color:#78716C;font-size:12px;margin-top:24px;line-height:1.6;">
      <p style="margin:0 0 6px 0;">
        <strong>IEP &amp; Thrive</strong> · Special Education Summer Intensive<br/>
        ${getPhysicalAddress()}<br/>
        <a href="${SITE_URL}" style="color:#1B4332;">iep-and-thrive.web.app</a>
      </p>
      ${complianceHtml}
    </div>
  </div>
</body>
</html>`;
}

/**
 * Render a complete email (subject + html + auto-generated plain-text).
 * Preferred entry point for new templates (Epic G+). Existing templates
 * continue to call emailLayout() directly — they automatically get the
 * new shell + compliance footer through the same path.
 */
export function renderEmail(opts: {
  subject: string;
  layout: EmailLayoutOpts;
  recipientUid?: string;
}): RenderedEmail {
  const layout: EmailLayoutOpts = opts.recipientUid
    ? { ...opts.layout, unsubscribeToken: generateUnsubscribeToken(opts.recipientUid) }
    : opts.layout;
  const html = emailLayout(layout);
  return { subject: opts.subject, html, text: htmlToPlainText(html) };
}

// ─── G3: Pre-Program Ramp Templates ───
//
// Four lifecycle emails sent T-30 / T-14 / T-7 / T-1 days before program
// start (Tue Jul 7, 2026). Voice: warm authority, parent-first, concrete.
// Each template takes EmailVariables; renderEmail() wraps with the G1 shell
// and (when recipientUid is provided) signs the unsubscribe link.

export type RampPhase = "T-30" | "T-14" | "T-7" | "T-1";

function fmtLong(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function fmtMonthDay(iso: string | undefined): string {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric" });
}

function trackLabel(track: string | undefined): string {
  if (track === "reading") return "Reading & Language Intensive";
  if (track === "math") return "Math & Numeracy Intensive";
  if (track === "full") return "Full Academic Intensive";
  return "Summer Intensive";
}

export function preProgramRampTemplate(
  phase: RampPhase,
  vars: EmailVariables
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const student = vars.studentName ? escapeHtml(vars.studentName) : "your child";
  const track = trackLabel(vars.programTrack);
  const startLong = fmtLong(vars.cohortStartISO);
  const startShort = fmtMonthDay(vars.cohortStartISO);
  const location = escapeHtml(vars.programLocation || "Long Island, NY (exact location shared on enrollment)");
  const hours = escapeHtml(vars.programDailyHours || "9:00am – 1:00pm, Monday–Friday");
  const portalLink = `<a href="${SITE_URL}/portal" style="color:#1B4332;font-weight:600;">your parent portal</a>`;

  const heading = (text: string) =>
    `<h1 style="font-family:Georgia,serif;color:#1B4332;font-size:22px;margin:0 0 16px 0;line-height:1.3;">${text}</h1>`;

  if (phase === "T-30") {
    return {
      subject: `${student}'s summer is taking shape — 30 days to kickoff`,
      layout: {
        kind: "lifecycle",
        preheader: `One month out: here's what we're preparing for ${student}, and what we'll need from you in the next two weeks.`,
        content: `
          ${heading(`30 days until ${startShort}`)}
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            One month from now, ${student} starts the ${track}. I'm already pulling
            their IEP, mapping goals to our six-week scope, and finalizing the small-group
            placements so the first morning isn't a guess — it's a plan.
          </p>
          <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">What I'm doing this month</h2>
          <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
            <li>Reviewing every current IEP &amp; mapping annual goals to weekly objectives</li>
            <li>Grouping students by learning profile (not just grade)</li>
            <li>Pre-printing weekly progress report templates for your CSE meeting</li>
          </ul>
          <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">What I'll need from you in the next 2 weeks</h2>
          <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
            <li>Intake form complete (medical, emergency contacts, learning notes)</li>
            <li>Photo/video release signed (for portfolio &amp; family showcase)</li>
            <li>Balance payment when you're ready (due ${fmtMonthDay(vars.cohortStartISO ? new Date(new Date(vars.cohortStartISO + "T00:00:00").getTime() - 14 * 86400000).toISOString().slice(0,10) : "")})</li>
          </ul>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:20px 0 0 0;">
            Everything lives in ${portalLink}. I'll send a logistics email two weeks out.
          </p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">
            — IEP &amp; Thrive
          </p>
        `,
      },
    };
  }

  if (phase === "T-14") {
    return {
      subject: `Two weeks out: ${student}'s Day-1 logistics`,
      layout: {
        kind: "lifecycle",
        preheader: `Pickup, dropoff, schedule, what to bring — everything you need to know before ${startShort}.`,
        content: `
          ${heading(`Two weeks until kickoff`)}
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            ${student} starts ${startLong}. Here's the practical stuff — print this or save it.
          </p>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
            <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;width:40%;">Schedule</td><td style="padding:8px 12px;">${hours}</td></tr>
            <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Dates</td><td style="padding:8px 12px;">${startShort} – ${fmtMonthDay(vars.cohortEndISO)}</td></tr>
            <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Location</td><td style="padding:8px 12px;">${location}</td></tr>
            <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Cohort size</td><td style="padding:8px 12px;">6 students max</td></tr>
          </table>
          <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">What to bring (every day)</h2>
          <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
            <li>Refillable water bottle (labeled)</li>
            <li>Snack — nut-free if any classmate has a nut allergy (I'll confirm)</li>
            <li>One favorite book (we'll add to the portfolio)</li>
            <li>Comfortable clothes — we move around</li>
          </ul>
          <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">If anything's changed</h2>
          <p style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            Work schedule shifted? Summer travel? Custody changes? Reply to this email so I know.
          </p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:20px 0 0 0;">
            Open ${portalLink} to confirm your intake and release are submitted.
          </p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">— IEP &amp; Thrive</p>
        `,
      },
    };
  }

  if (phase === "T-7") {
    return {
      subject: `Final week — checklist for ${startShort}`,
      layout: {
        kind: "lifecycle",
        preheader: `One week to go. Five-item checklist below — reply if anything is incomplete and I'll handle it.`,
        content: `
          ${heading(`One week until ${student} starts`)}
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            One week from ${startLong}. Quick checklist — reply to this email if any item
            below is a "no" and I'll handle it before Day 1.
          </p>
          <ul style="font-size:15px;line-height:1.8;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
            <li>✅ Intake form submitted</li>
            <li>✅ Photo / video release signed</li>
            <li>✅ Balance payment processed</li>
            <li>✅ Emergency contacts on file (at least one non-parent)</li>
            <li>✅ Latest IEP shared (if not already in our portal)</li>
          </ul>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">
            Check status anytime in ${portalLink}.
          </p>
          <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
            P.S. — If ${student} is nervous about Day 1, that's normal. I'll meet them at the
            door, learn their name first, and we'll do an easy introduction activity before
            any work. They'll be okay.
          </p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">— IEP &amp; Thrive</p>
        `,
      },
    };
  }

  // T-1
  return {
    subject: `See ${student} tomorrow at 9am`,
    layout: {
      kind: "lifecycle",
      preheader: `Tomorrow is Day 1. Quick logistics + my phone for anything urgent.`,
      content: `
        ${heading(`Tomorrow's the day`)}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          We're ready for ${student}. Quick recap so you're not searching email tomorrow morning:
        </p>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr><td style="padding:8px 12px;background:#D8F3DC;font-weight:600;width:40%;">Time</td><td style="padding:8px 12px;background:#D8F3DC;">${hours}</td></tr>
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Where</td><td style="padding:8px 12px;">${location}</td></tr>
          <tr><td style="padding:8px 12px;background:#D8F3DC;font-weight:600;">Bring</td><td style="padding:8px 12px;background:#D8F3DC;">Water, snack, favorite book</td></tr>
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Pickup</td><td style="padding:8px 12px;">1:00pm sharp — Friday parent debrief at pickup</td></tr>
        </table>
        <p style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          If anything urgent comes up tomorrow morning — sick child, traffic, anything — text or
          call. The number's in ${portalLink} under My Profile.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">
          See you at 9.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">— IEP &amp; Thrive</p>
      `,
    },
  };
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

// ─── E3: Signed Agreement Delivery ───
//
// Sent at sign-time with the rendered PDF as an attachment. ESIGN
// "ability to receive a signed copy" requirement.

function trackLabelE3(track: string): string {
  if (track === "reading") return "Reading & Language Intensive";
  if (track === "math") return "Math & Numeracy Intensive";
  if (track === "full") return "Full Academic Intensive";
  return "Summer Intensive";
}

export function signedAgreementDeliveryTemplate(data: {
  parentName: string;
  studentName: string;
  programTrack: string;
}): RenderedEmail {
  const safeParent = escapeHtml(data.parentName.split(" ")[0] || "there");
  const safeStudent = escapeHtml(data.studentName || "your child");
  const track = escapeHtml(trackLabelE3(data.programTrack));

  const layout: EmailLayoutOpts = {
    kind: "transactional",
    preheader: "Your signed enrollment agreement is attached. Next step: secure deposit.",
    content: `
      <h1 style="font-family:Georgia,serif;color:#1B4332;font-size:22px;margin:0 0 16px 0;line-height:1.3;">Your enrollment agreement is signed</h1>
      <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${safeParent},</p>
      <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
        Thanks for signing the enrollment agreement for ${safeStudent}'s spot in the ${track}.
        Your countersigned PDF is attached for your records — please save a copy.
      </p>
      <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:16px;margin:18px 0 8px 0;">What's next</h2>
      <ol style="font-size:14px;line-height:1.7;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
        <li>Complete the deposit (25%) via the Stripe checkout you'll see immediately after this page.</li>
        <li>Upload the current IEP in the parent portal so we can begin the goal mapping.</li>
        <li>Watch for the T-30 ramp email about a month before Day 1.</li>
      </ol>
      <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;">
        You can re-download this signed agreement anytime from <strong>Portal &rsaquo; Agreements</strong>.
        If anything looks wrong, reply to this email and we'll fix it before any payment.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#1C1917;margin:18px 0 0 0;">— IEP &amp; Thrive</p>
    `,
  };

  return renderEmail({ subject: `Your enrollment agreement (signed) — IEP & Thrive`, layout });
}
