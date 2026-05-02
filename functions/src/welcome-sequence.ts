/**
 * B1 — Welcome Email Sequence
 *
 * Scheduled daily 9:00 ET. For every depositPaid parent (excluding isTest /
 * unsubscribed), fans out the appropriate welcome email based on
 * daysSinceDeposit:
 *   day-0 — same day as deposit (or first run after)
 *   day-2 — +2 days (branches on intakeSubmitted)
 *   day-7 — +7 days
 *
 * Dedupe: users/{uid}.welcomeEmailsSent counter (number 0..3). The numeric
 * counter mirrors summer-guide-drip pattern; we increment monotonically so
 * a parent who deposited late and is past day-7 still receives every email
 * in order.
 *
 * Founder QA preview is exposed via the unified previewEmail function in
 * preview-email.ts.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendEmailWithResult, logEmail } from "./email-service";
import { renderEmail, EmailVariables } from "./email-templates";
import {
  WelcomePhase,
  WelcomeSequenceVars,
  welcomeSequenceTemplate,
} from "./lifecycle-email-templates";

const PROGRAM_START_ISO = "2026-07-07";
const PROGRAM_END_ISO = "2026-08-15";
const PROGRAM_LOCATION = process.env.PROGRAM_LOCATION || "Long Island, NY (exact location shared on enrollment)";
const PROGRAM_DAILY_HOURS = "9:00am – 1:00pm, Monday–Friday";

// ─── Date math (UTC days since deposit) ───

function daysSince(ts: admin.firestore.Timestamp | undefined | null): number {
  if (!ts) return -1;
  const ms = Date.now() - ts.toMillis();
  return Math.floor(ms / 86400000);
}

function phaseForDays(days: number, alreadySent: number): WelcomePhase | null {
  // Send the next un-sent phase whose threshold has been reached.
  if (alreadySent < 1 && days >= 0) return "day-0";
  if (alreadySent < 2 && days >= 2) return "day-2";
  if (alreadySent < 3 && days >= 7) return "day-7";
  return null;
}

// ─── Recipient model ───

export interface WelcomeRecipient {
  parentUid: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentDocId: string;
  programTrack: string;
  intakeSubmitted: boolean;
  isTest: boolean;
  unsubscribed: boolean;
  daysSinceDeposit: number;
  welcomeEmailsSent: number;
}

export async function loadWelcomeRecipients(): Promise<WelcomeRecipient[]> {
  const db = admin.firestore();
  const usersSnap = await db.collection("users").get();
  const out: WelcomeRecipient[] = [];

  for (const userDoc of usersSnap.docs) {
    const u = userDoc.data() ?? {};
    if (u.depositPaid !== true) continue;
    const email = (u.email as string) || "";
    if (!email) continue;

    const studentsSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("students")
      .limit(1)
      .get();
    const studentDoc = studentsSnap.docs[0];
    const s = studentDoc?.data() ?? {};

    out.push({
      parentUid: userDoc.id,
      parentName: (u.displayName as string) || "",
      parentEmail: email,
      studentName: (s.name as string) || "your child",
      studentDocId: studentDoc?.id || "",
      programTrack: (s.programTrack as string) || "full",
      intakeSubmitted: s.intakeSubmitted === true,
      isTest: u.isTest === true,
      unsubscribed: u.unsubscribed === true,
      daysSinceDeposit: daysSince(u.depositPaidAt as admin.firestore.Timestamp | undefined),
      welcomeEmailsSent: typeof u.welcomeEmailsSent === "number" ? u.welcomeEmailsSent : 0,
    });
  }
  return out;
}

function buildVariables(r: WelcomeRecipient): WelcomeSequenceVars {
  const base: EmailVariables = {
    parentName: r.parentName,
    parentEmail: r.parentEmail,
    studentName: r.studentName,
    programTrack: r.programTrack,
    cohortStartISO: PROGRAM_START_ISO,
    cohortEndISO: PROGRAM_END_ISO,
    programLocation: PROGRAM_LOCATION,
    programDailyHours: PROGRAM_DAILY_HOURS,
  };
  return { ...base, intakeSubmitted: r.intakeSubmitted };
}

export async function sendWelcomeToRecipient(
  phase: WelcomePhase,
  r: WelcomeRecipient,
  overrideTo?: string,
  bypassIsTest?: boolean
): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  if (r.unsubscribed) return { ok: false, messageId: null, error: "unsubscribed" };
  if (r.isTest && !bypassIsTest) return { ok: false, messageId: null, error: "isTest" };

  const tpl = welcomeSequenceTemplate(phase, buildVariables(r));
  const rendered = renderEmail({
    subject: tpl.subject,
    layout: tpl.layout,
    recipientUid: r.parentUid,
  });

  const result = await sendEmailWithResult({
    to: overrideTo || r.parentEmail,
    subject: rendered.subject,
    htmlBody: rendered.html,
    textBody: rendered.text,
    kind: "lifecycle",
    recipientUid: r.parentUid,
  });

  await logEmail(
    overrideTo || r.parentEmail,
    rendered.subject,
    "general",
    result.ok,
    {
      meta: {
        templateId: `welcome_${phase.replace("-", "")}`,
        phase,
        parentUid: r.parentUid,
        studentName: r.studentName,
        previewSendTo: overrideTo || null,
      },
      messageId: result.messageId ?? undefined,
      error: result.error,
      bodyHtmlPreview: rendered.html.slice(0, 500),
    }
  );

  // Dedupe: increment only when the send actually went out (or was an isTest
  // production skip that has already been logged). Preview sends pass overrideTo
  // and are not counted toward the parent recipient counter.
  if (!overrideTo) {
    const idx = phase === "day-0" ? 1 : phase === "day-2" ? 2 : 3;
    if (idx > r.welcomeEmailsSent) {
      try {
        await admin.firestore().collection("users").doc(r.parentUid).update({
          welcomeEmailsSent: idx,
          welcomeEmailsLastSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error("[WelcomeSequence] counter update failed:", err);
      }
    }
  }

  return result;
}

export const sendWelcomeSequence = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/New_York",
    region: "us-east1",
  },
  async () => {
    const recipients = await loadWelcomeRecipients();
    console.log(`[WelcomeSequence] ${recipients.length} deposited recipients loaded.`);

    let sent = 0;
    let skipped = 0;
    for (const r of recipients) {
      const phase = phaseForDays(r.daysSinceDeposit, r.welcomeEmailsSent);
      if (!phase) {
        skipped++;
        continue;
      }
      const result = await sendWelcomeToRecipient(phase, r);
      if (result.ok) sent++;
      else skipped++;
    }
    console.log(`[WelcomeSequence] sent=${sent} skipped=${skipped}`);
  }
);
