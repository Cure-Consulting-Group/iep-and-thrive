/**
 * B1 / G4 / G6 / G11 / H8 — Lifecycle Email Templates
 *
 * Five template families layered on top of the G1 foundation:
 *   - welcomeSequenceTemplate(phase, vars)        — B1
 *   - balanceDueReminderTemplate(phase, vars)     — G4
 *   - photoReleaseReminderTemplate(vars)          — G6
 *   - intakeIncompleteReminderTemplate(vars)      — G11
 *   - subscriptionWelcomeTemplate(vars)           — H8
 *   - subscriptionMonthlyReceiptTemplate(vars)    — H8
 *   - sessionForfeitedTemplate(vars)              — H8
 *   - subscriptionPausedTemplate(vars)            — H8
 *   - subscriptionCanceledTemplate(vars)          — H8
 *   - subscriptionPastDueTemplate(vars)           — H8 (recover email)
 *
 * All templates return { subject, layout: EmailLayoutOpts } shaped to be
 * fed to renderEmail() in email-templates.ts. They use kind: lifecycle
 * so the G2 unsubscribe footer renders. Voice mirrors pre-program-ramp:
 * warm authority, founder-first, concrete next steps, parent-readable.
 */

import { escapeHtml } from "./email-service";
import {
  EmailLayoutOpts,
  EmailVariables,
} from "./email-templates";
import type { SubscriptionTier } from "../../lib/subscription";
import { tierLabel, tierPrice } from "../../lib/subscription";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://iep-and-thrive.web.app";
const STRIPE_CHECKOUT_BASE =
  process.env.STRIPE_CHECKOUT_BASE_URL ||
  "https://us-east1-iep-and-thrive.cloudfunctions.net/stripeCheckout";

// ─── Shared helpers ───

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

function balanceAmountForTrack(track: string | undefined): { dollars: string; cents: number } {
  if (track === "full") return { dollars: "$3,000", cents: 300000 };
  if (track === "reading") return { dollars: "$2,625", cents: 262500 };
  if (track === "math") return { dollars: "$2,625", cents: 262500 };
  return { dollars: "$2,625", cents: 262500 };
}

function heading(text: string): string {
  return `<h1 style="font-family:Georgia,serif;color:#1B4332;font-size:22px;margin:0 0 16px 0;line-height:1.3;">${text}</h1>`;
}

function ctaButton(href: string, label: string): string {
  return `<p style="margin:20px 0;"><a href="${href}" style="display:inline-block;background:#1B4332;color:#FFFFFF;font-family:DM Sans, Arial, sans-serif;font-size:14px;font-weight:600;padding:12px 24px;border-radius:100px;text-decoration:none;">${label}</a></p>`;
}

function signOff(): string {
  return `<p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">— IEP &amp; Thrive</p>`;
}

// ─── B1 — Welcome sequence ───
//
// Three phases:
//   day-0: deposit just landed; welcome + portal tour link
//   day-2: intake nudge — branches on intakeSubmitted state
//   day-7: what to expect in week 1 / pre-program ramp on-ramp

export type WelcomePhase = "day-0" | "day-2" | "day-7";

export interface WelcomeSequenceVars extends EmailVariables {
  intakeSubmitted?: boolean;
}

export function welcomeSequenceTemplate(
  phase: WelcomePhase,
  vars: WelcomeSequenceVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const student = vars.studentName ? escapeHtml(vars.studentName) : "your child";
  const track = trackLabel(vars.programTrack);
  const startLong = fmtLong(vars.cohortStartISO);
  const startShort = fmtMonthDay(vars.cohortStartISO);
  const portalLink = `<a href="${SITE_URL}/portal" style="color:#1B4332;font-weight:600;">your parent portal</a>`;

  if (phase === "day-0") {
    return {
      subject: `Welcome to IEP & Thrive — ${student} spot is held`,
      layout: {
        kind: "lifecycle",
        preheader: `Your deposit is in. Here is what happens next, where the parent portal lives, and the one form I need from you this week.`,
        content: `
          ${heading(`${student} spot is officially held`)}
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            Your deposit landed and ${student} is on the roster for the ${track}.
            Cohort starts ${startLong || "this summer"}. I am already pulling
            their information into my prep notes — you do not have to chase me.
          </p>
          <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">What I will do this week</h2>
          <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
            <li>Open ${portalLink} and walk through the dashboard</li>
            <li>Confirm payment receipt arrived (check your inbox; if not, reply)</li>
            <li>Save my email and this address so future updates do not go to spam</li>
          </ul>
          <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">What I will need from you this week</h2>
          <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
            <li>Start the intake form (medical, IEP, emergency contacts) — no rush; the form saves as you go</li>
            <li>If you have ${student} most recent IEP handy, upload it inside the form</li>
            <li>Reply with any custody or scheduling notes I should know up front</li>
          </ul>
          ${ctaButton(`${SITE_URL}/portal`, "Open Your Parent Portal")}
          <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
            P.S. — You will hear from me again in two days with a quick intake nudge,
            then again at one week with what to expect in our first session together.
            After that, the cadence slows down until the program approaches.
          </p>
          ${signOff()}
        `,
      },
    };
  }

  if (phase === "day-2") {
    if (vars.intakeSubmitted) {
      return {
        subject: `Got ${student} intake — thank you`,
        layout: {
          kind: "lifecycle",
          preheader: `Intake is in. Here is where we are now and what to expect over the next few weeks.`,
          content: `
            ${heading("Intake received")}
            <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
            <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
              Thank you — I have ${student} intake on my desk and I will review every
              field this week. If anything needs clarification I will reply directly to you;
              otherwise no news from me means everything is in order.
            </p>
            <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">What happens next</h2>
            <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
              <li>I map ${student} IEP goals to our six-week scope</li>
              <li>I confirm cohort grouping by learning profile (not just grade)</li>
              <li>You will get a logistics email two weeks before ${startShort || "kickoff"}</li>
            </ul>
            <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">
              Anything in ${portalLink} you want to update — IEP doc, emergency contact,
              custody change — just edit it and resave. The form remembers state.
            </p>
            ${signOff()}
          `,
        },
      };
    }

    return {
      subject: `Quick intake nudge for ${student}`,
      layout: {
        kind: "lifecycle",
        preheader: `Two minutes to start the intake form — no need to finish it tonight, the form saves as you go.`,
        content: `
          ${heading("Two minutes to get the intake started")}
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            Quick check-in: I want to make sure the intake form for ${student} is not
            sitting open in a tab somewhere. The first three fields are the ones I lean
            on most when I am planning the cohort, and they take about two minutes:
          </p>
          <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
            <li>Current grade and school district</li>
            <li>Primary IEP classification (or in evaluation)</li>
            <li>One or two things that have worked or have not worked at school</li>
          </ul>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            The form remembers state, so you can sign in to ${portalLink} now, save what you have,
            and finish the medical and emergency-contact pages later this week.
          </p>
          ${ctaButton(`${SITE_URL}/portal/intake`, "Start the Intake Form")}
          <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
            If you have already started in another browser, just sign in there — your
            answers are saved against your account, not the device.
          </p>
          ${signOff()}
        `,
      },
    };
  }

  // day-7
  return {
    subject: `What week 1 actually looks like — for ${student}`,
    layout: {
      kind: "lifecycle",
      preheader: `A week in. Here is the shape of our first cohort week and what you will see come back from me.`,
      content: `
        ${heading("What week 1 will feel like")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          A week since ${student} reserved their spot. I want you to have a real picture
          of what week 1 of cohort actually looks like — both for ${student} and for what
          you will see from me as the parent.
        </p>
        <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">A typical day for ${student}</h2>
        <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
          <li>9:00 — Soft start: morning circle, regulation check-in</li>
          <li>9:30 — Structured literacy (Orton-Gillingham scope and sequence)</li>
          <li>10:30 — Movement / sensory break</li>
          <li>10:45 — Math intervention or writing block</li>
          <li>11:45 — SEL block or portfolio work</li>
          <li>12:30 — Wrap, parent debrief at pickup</li>
        </ul>
        <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">What you will see from me each week</h2>
        <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
          <li>Friday recap email — attendance, OG probe data, highlights</li>
          <li>Daily verbal debrief at pickup (90 seconds; not a full conference)</li>
          <li>Real-time note if anything important happens during the day</li>
        </ul>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">
          You will hear from me next about a month before kickoff with the pre-program
          ramp series. In the meantime, ${portalLink} has everything I have on file.
        </p>
        ${signOff()}
      `,
    },
  };
}

// ─── G4 — Balance due reminders ───

export type BalancePhase = "T-30" | "T-14" | "T-7";

export interface BalanceReminderVars extends EmailVariables {
  balanceDueISO?: string;
}

export function balanceDueReminderTemplate(
  phase: BalancePhase,
  vars: BalanceReminderVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const student = vars.studentName ? escapeHtml(vars.studentName) : "your child";
  const track = trackLabel(vars.programTrack);
  const trackParam =
    vars.programTrack === "reading" || vars.programTrack === "math" || vars.programTrack === "full"
      ? vars.programTrack
      : "full";
  const balance = balanceAmountForTrack(vars.programTrack);
  const dueLong = fmtLong(vars.balanceDueISO);
  const dueShort = fmtMonthDay(vars.balanceDueISO);
  const startShort = fmtMonthDay(vars.cohortStartISO);
  const checkoutHref = `${STRIPE_CHECKOUT_BASE}?program=${encodeURIComponent(trackParam)}&type=balance`;

  if (phase === "T-30") {
    return {
      subject: `Heads up: ${student} balance (${balance.dollars}) is due ${dueShort}`,
      layout: {
        kind: "lifecycle",
        preheader: `Informational — balance is due in 30 days. Pay early any time; we never charge a card on file without warning.`,
        content: `
          ${heading("30 days to balance due")}
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            Quick informational note: the balance for ${student} ${track} —
            <strong>${balance.dollars}</strong> — is due ${dueLong || "two weeks before program start"}.
            That is about a month away. No need to act today; this is just so it is on your radar.
          </p>
          <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
            <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;width:40%;">Program</td><td style="padding:8px 12px;">${track}</td></tr>
            <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Balance</td><td style="padding:8px 12px;">${balance.dollars} (75% of tuition)</td></tr>
            <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Due</td><td style="padding:8px 12px;">${dueLong || dueShort}</td></tr>
            <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Cohort starts</td><td style="padding:8px 12px;">${startShort}</td></tr>
          </table>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            If it is easier to pay now and stop thinking about it, you can do that:
          </p>
          ${ctaButton(checkoutHref, "Pay Balance Securely")}
          <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
            We charge through Stripe — no card is stored against your account, and we
            never auto-charge. You will get a receipt by email when the payment clears.
          </p>
          ${signOff()}
        `,
      },
    };
  }

  if (phase === "T-14") {
    return {
      subject: `Reminder: ${student} ${balance.dollars} balance — due in 2 weeks`,
      layout: {
        kind: "lifecycle",
        preheader: `Two weeks to the balance due date. One link to pay; receipt arrives by email when it clears.`,
        content: `
          ${heading("Two weeks to balance due")}
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
            Friendly reminder: the <strong>${balance.dollars}</strong> balance for
            ${student} ${track} is due ${dueLong || "two weeks before program start"}.
            We are roughly two weeks out, and I want to make sure this does not surprise
            you the week before cohort starts.
          </p>
          ${ctaButton(checkoutHref, `Pay ${balance.dollars} Balance`)}
          <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">
            Already paid? You can disregard this email — Stripe sometimes lags 24 hours
            on the back-end before a balance shows as cleared on my end. If you paid in
            the last day or two, you are all set.
          </p>
          <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
            Need a different timing or payment plan? Reply to this email — happy to work
            with you. The deadline is not a wall, it is a planning anchor.
          </p>
          ${signOff()}
        `,
      },
    };
  }

  // T-7
  return {
    subject: `Final reminder: ${balance.dollars} balance for ${student} — 7 days`,
    layout: {
      kind: "lifecycle",
      preheader: `One week to the balance due date. After that we will need to pause the spot until the balance clears.`,
      content: `
        ${heading("One week to balance due")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          Last reminder before the deadline: <strong>${balance.dollars}</strong> balance
          for ${student} ${track} is due in 7 days (${dueLong || dueShort}).
          After that date I will need to pause ${student} spot in the cohort until
          the balance clears, and the spot may go to the waitlist.
        </p>
        ${ctaButton(checkoutHref, `Pay ${balance.dollars} Now`)}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">
          If something has changed for your family — financial, scheduling, anything —
          reply to this email today and we will figure out the right next step together.
          I would much rather hear from you than have ${student} spot quietly time out.
        </p>
        ${signOff()}
      `,
    },
  };
}

// ─── G6 — Photo / video release reminder ───

export interface PhotoReleaseVars extends EmailVariables {
  releaseSignUrl?: string;
}

export function photoReleaseReminderTemplate(
  vars: PhotoReleaseVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const student = vars.studentName ? escapeHtml(vars.studentName) : "your child";
  const startShort = fmtMonthDay(vars.cohortStartISO);
  const releaseHref = vars.releaseSignUrl || `${SITE_URL}/portal/photo-release`;

  return {
    subject: `Quick form before ${startShort} — photo/video release for ${student}`,
    layout: {
      kind: "lifecycle",
      preheader: `Two-minute form. Without it I cannot share portfolio photos or include the family showcase.`,
      content: `
        ${heading("Two-minute form before kickoff")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          We are about two weeks from cohort start (${startShort}). I am chasing one
          form across the cohort: the photo / video release for ${student}.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          It is a per-student consent — covers whether I can include ${student} work
          and portrait in:
        </p>
        <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
          <li>The private portfolio I share with you each week</li>
          <li>Group photos at the end-of-program family showcase</li>
          <li>Any future case study (only with separate consent at that time)</li>
        </ul>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          You can decline any of those individually on the form. No to all three
          is a totally normal answer and does not change anything about the experience.
        </p>
        ${ctaButton(releaseHref, "Sign Photo / Video Release")}
        <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
          Already signed? Disregard — sometimes the email queue and the database lag
          a few minutes apart. If you signed in the last day, you are all set.
        </p>
        ${signOff()}
      `,
    },
  };
}

// ─── G11 — Intake started-but-incomplete reminder ───

export interface IntakeIncompleteVars extends EmailVariables {
  intakeStartedISO?: string;
}

export function intakeIncompleteReminderTemplate(
  vars: IntakeIncompleteVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const student = vars.studentName ? escapeHtml(vars.studentName) : "your child";
  const intakeHref = `${SITE_URL}/portal/intake`;

  return {
    subject: `Pick up where you left off — ${student} intake form`,
    layout: {
      kind: "lifecycle",
      preheader: `You started the intake form a week ago. The form remembered everything; you just need ten minutes to finish.`,
      content: `
        ${heading("Pick up where you left off")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          You started ${student} intake form about a week ago and saved partway through.
          Good news: the form remembered everything you entered — sign in to your portal
          and you will see your answers waiting.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          The remaining sections are usually the quick ones:
        </p>
        <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
          <li>Allergies / medications / medical conditions</li>
          <li>Two emergency contacts (one non-parent helps a lot)</li>
          <li>Photo / video release preference</li>
          <li>Two consent boxes at the end</li>
        </ul>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          Plan on about ten focused minutes. If you hit any field where the right
          answer is not obvious, leave it blank and reply to this email — I would rather
          hear I am not sure than have you guess.
        </p>
        ${ctaButton(intakeHref, "Resume Intake Form")}
        <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
          Why this matters: Day-1 readiness depends on having the medical and
          emergency-contact pages on file. Without them I cannot run sessions safely.
          That is the only reason I am nudging.
        </p>
        ${signOff()}
      `,
    },
  };
}

// ─── H8 — Tutoring subscription lifecycle templates ───
//
// Reference: docs/tutoring-design.md §8. These templates are emitted by the
// stripe-webhook handler in response to subscription / invoice events. The
// SubscriptionState contract (lib/subscription.ts) is the source of truth
// for tier labels and per-cycle session counts.

export interface SubscriptionEmailVars extends EmailVariables {
  tier: SubscriptionTier;
  /** Sessions remaining this cycle (after webhook reset, if applicable). */
  sessionsRemaining?: number;
  /** Total per-cycle allowance, derived from tier when omitted. */
  sessionsAllowed?: number;
  /** Cycle end date (ISO 'YYYY-MM-DD' or full ISO timestamp). */
  cycleEndISO?: string;
  /** Most recent invoice amount, e.g. "$460.00". */
  amountPaid?: string;
  /** Customer-portal URL the parent can use for self-service billing. */
  customerPortalUrl?: string;
}

function tutoringBookHref(): string {
  return `${SITE_URL}/book?type=tutoring`;
}

function portalSubscriptionHref(): string {
  return `${SITE_URL}/portal/subscription`;
}

function fmtCycleEnd(iso: string | undefined): string {
  if (!iso) return "";
  const datePart = iso.length >= 10 ? iso.slice(0, 10) : iso;
  return fmtMonthDay(datePart);
}

function tierTitle(tier: SubscriptionTier): string {
  return tierLabel(tier);
}

function tierAllowance(tier: SubscriptionTier): number {
  return tierPrice(tier).sessionsPerCycle;
}

export function subscriptionWelcomeTemplate(
  vars: SubscriptionEmailVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const tierName = tierTitle(vars.tier);
  const allowance = vars.sessionsAllowed ?? tierAllowance(vars.tier);
  const monthly = tierPrice(vars.tier).monthly;

  return {
    subject: `Welcome to ${tierName} tutoring`,
    layout: {
      kind: "transactional",
      preheader: `Your ${tierName} tutoring subscription is active. Book your first session anytime.`,
      content: `
        ${heading(`Welcome to ${tierName} tutoring`)}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          Your <strong>${tierName}</strong> tutoring subscription is active. You can book
          tutoring sessions any time the calendar shows availability — there is no need
          to wait for a confirmation from me.
        </p>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;width:40%;">Plan</td><td style="padding:8px 12px;">${tierName}</td></tr>
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Monthly rate</td><td style="padding:8px 12px;">$${monthly}</td></tr>
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Sessions per cycle</td><td style="padding:8px 12px;">${allowance}</td></tr>
        </table>
        ${ctaButton(tutoringBookHref(), "Book Your First Session")}
        <h2 style="font-family:Georgia,serif;color:#1B4332;font-size:17px;margin:20px 0 8px 0;">Policy quick reference</h2>
        <ul style="font-size:14px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;padding-left:20px;">
          <li>Sessions reset each billing cycle. Unused sessions do not roll over.</li>
          <li>Cancel or reschedule 24+ hours ahead — same-day cancels forfeit the session.</li>
          <li>Manage billing anytime from <a href="${portalSubscriptionHref()}" style="color:#1B4332;font-weight:600;">your portal</a>.</li>
          <li>Reply to this email for anything that needs a human — I read everything.</li>
        </ul>
        ${signOff()}
      `,
    },
  };
}

export function subscriptionMonthlyReceiptTemplate(
  vars: SubscriptionEmailVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const tierName = tierTitle(vars.tier);
  const allowance = vars.sessionsAllowed ?? tierAllowance(vars.tier);
  const remaining = vars.sessionsRemaining ?? allowance;
  const cycleEnd = fmtCycleEnd(vars.cycleEndISO);
  const amount = vars.amountPaid ? escapeHtml(vars.amountPaid) : `$${tierPrice(vars.tier).monthly}.00`;

  return {
    subject: `Your monthly receipt — IEP & Thrive`,
    layout: {
      kind: "transactional",
      preheader: `${amount} for ${tierName} tutoring · ${remaining} of ${allowance} sessions available this cycle.`,
      content: `
        ${heading("Monthly receipt")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          Thanks — your monthly payment for <strong>${tierName}</strong> tutoring cleared.
          Below is your receipt and the sessions you have available this cycle.
        </p>
        <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;width:40%;">Plan</td><td style="padding:8px 12px;">${tierName}</td></tr>
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Amount</td><td style="padding:8px 12px;">${amount}</td></tr>
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Sessions remaining</td><td style="padding:8px 12px;"><strong>${remaining}</strong> of ${allowance}</td></tr>
          ${cycleEnd ? `<tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;">Cycle ends</td><td style="padding:8px 12px;">${cycleEnd}</td></tr>` : ""}
        </table>
        ${ctaButton(tutoringBookHref(), "Book This Month's Sessions")}
        <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
          Sessions do not carry over between cycles. If something comes up that throws
          off your week, reply to this email — easier to plan ahead than scramble.
        </p>
        ${signOff()}
      `,
    },
  };
}

export function sessionForfeitedTemplate(
  vars: SubscriptionEmailVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const student = vars.studentName ? escapeHtml(vars.studentName) : "your child";
  const remaining = vars.sessionsRemaining;
  const allowance = vars.sessionsAllowed ?? (vars.tier ? tierAllowance(vars.tier) : 4);

  return {
    subject: `Heads up — session forfeited`,
    layout: {
      kind: "lifecycle",
      preheader: `Same-day cancel — the session counts. Here is what is left this cycle and the easy way to rebook.`,
      content: `
        ${heading("A session was forfeited")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          ${student}'s session was cancelled within 24 hours of start time, so per the
          policy it counts against this cycle. I know that can feel like a sting — life
          happens — and I would rather flag it directly than have it surface as a
          surprise on the next monthly receipt.
        </p>
        ${typeof remaining === "number" ? `
        <table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;width:40%;">Sessions remaining this cycle</td><td style="padding:8px 12px;"><strong>${remaining}</strong> of ${allowance}</td></tr>
        </table>
        ` : ""}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          Easiest path forward: book another slot for next week so the rhythm stays put.
        </p>
        ${ctaButton(tutoringBookHref(), "Book Another Session")}
        <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
          Reminder of the cancellation policy: 24 hours of notice keeps the session on
          your balance. Less than 24 hours forfeits it. The 24-hour line is a planning
          anchor — reply if there is something we should talk through.
        </p>
        ${signOff()}
      `,
    },
  };
}

export function subscriptionPausedTemplate(
  vars: SubscriptionEmailVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const tierName = tierTitle(vars.tier);

  return {
    subject: `Subscription paused`,
    layout: {
      kind: "transactional",
      preheader: `Your ${tierName} subscription is paused. Resume any time from your portal.`,
      content: `
        ${heading("Your subscription is paused")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          Confirming your <strong>${tierName}</strong> tutoring subscription is paused.
          You will not be charged while it is paused, and you will not be able to book
          new tutoring sessions until you resume.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          When you are ready to come back, resume from your portal — no waiting period:
        </p>
        ${ctaButton(portalSubscriptionHref(), "Resume Subscription")}
        <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
          If pausing was a mistake or something is going on with your family, reply to
          this email. I would rather hear from you than have you sitting with it.
        </p>
        ${signOff()}
      `,
    },
  };
}

export function subscriptionCanceledTemplate(
  vars: SubscriptionEmailVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const tierName = tierTitle(vars.tier);
  const cycleEnd = fmtCycleEnd(vars.cycleEndISO);
  const dateClause = cycleEnd ? `through ${cycleEnd}` : `through the end of your current cycle`;

  return {
    subject: `Subscription cancelled — sessions ${cycleEnd ? `through ${cycleEnd}` : "through current cycle"}`,
    layout: {
      kind: "transactional",
      preheader: `Your subscription is cancelled. You can still use any remaining sessions ${dateClause}.`,
      content: `
        ${heading("Your subscription is cancelled")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          Confirming your <strong>${tierName}</strong> tutoring subscription is cancelled.
          You will not be charged again. You can still use any remaining sessions
          ${dateClause}, then the calendar will lock for tutoring slots.
        </p>
        ${cycleEnd ? `<table role="presentation" style="width:100%;border-collapse:collapse;margin:16px 0;font-size:14px;">
          <tr><td style="padding:8px 12px;background:#FDFAF4;font-weight:600;width:40%;">Sessions usable until</td><td style="padding:8px 12px;">${cycleEnd}</td></tr>
        </table>` : ""}
        ${ctaButton(tutoringBookHref(), "Use Remaining Sessions")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:16px 0 0 0;">
          Come back anytime — your account is preserved, and resubscribing will pick up
          where you left off. If there is something we should have done differently,
          I would genuinely like to hear it. Reply to this email.
        </p>
        ${signOff()}
      `,
    },
  };
}

export function subscriptionPastDueTemplate(
  vars: SubscriptionEmailVars
): { subject: string; layout: EmailLayoutOpts } {
  const parent = vars.parentName ? escapeHtml(vars.parentName.split(" ")[0]) : "there";
  const tierName = tierTitle(vars.tier);
  const portalHref = vars.customerPortalUrl || portalSubscriptionHref();

  return {
    subject: `Action needed — payment didn't go through`,
    layout: {
      kind: "transactional",
      preheader: `Your ${tierName} subscription's last payment failed. Update the card to keep tutoring going.`,
      content: `
        ${heading("Your last payment didn't go through")}
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">Hi ${parent},</p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          The most recent payment for your <strong>${tierName}</strong> tutoring
          subscription was declined by the card issuer. This is usually a fixed-card,
          temporary-hold, or expired-card thing — not a problem with the subscription itself.
        </p>
        <p style="font-size:15px;line-height:1.6;color:#1C1917;margin:0 0 16px 0;">
          Until the payment clears, the tutoring booking calendar is paused for your account.
          Update your payment method in the portal and Stripe will retry automatically:
        </p>
        ${ctaButton(portalHref, "Update Payment Method")}
        <p style="font-size:14px;line-height:1.6;color:#78716C;margin:16px 0 0 0;font-style:italic;">
          If something has changed for your family or you would like to pause instead of
          updating the card, reply to this email and I will handle it manually.
        </p>
        ${signOff()}
      `,
    },
  };
}
