/**
 * G11 — Intake Started-but-Incomplete Reminder
 *
 * Scheduled daily 9:00 ET. For each student with intakeStartedAt set,
 * intakeSubmitted !== true, and (now - intakeStartedAt) >= 7 days, fires
 * the reminder once.
 *
 * Dedupe: users/{uid}/students/{sid}.intakeIncompleteReminderSentAt timestamp.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendEmailWithResult, logEmail } from "./email-service";
import { renderEmail, EmailVariables } from "./email-templates";
import {
  IntakeIncompleteVars,
  intakeIncompleteReminderTemplate,
} from "./lifecycle-email-templates";

const PROGRAM_START_ISO = "2026-07-07";

// ─── Recipient model ───

export interface IntakeRecipient {
  parentUid: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentDocId: string;
  programTrack: string;
  isTest: boolean;
  unsubscribed: boolean;
  intakeStartedAt: admin.firestore.Timestamp;
  daysSinceStart: number;
  reminderAlreadySent: boolean;
}

export async function loadIntakeIncompleteRecipients(): Promise<IntakeRecipient[]> {
  const db = admin.firestore();
  const usersSnap = await db.collection("users").get();
  const out: IntakeRecipient[] = [];
  const now = Date.now();

  for (const userDoc of usersSnap.docs) {
    const u = userDoc.data() ?? {};
    const email = (u.email as string) || "";
    if (!email) continue;

    const studentsSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("students")
      .get();

    for (const sDoc of studentsSnap.docs) {
      const s = sDoc.data() ?? {};
      if (s.intakeSubmitted === true) continue;
      const startedAt = s.intakeStartedAt as admin.firestore.Timestamp | undefined;
      if (!startedAt) continue;
      const daysSinceStart = Math.floor((now - startedAt.toMillis()) / 86400000);
      if (daysSinceStart < 7) continue;

      out.push({
        parentUid: userDoc.id,
        parentName: (u.displayName as string) || "",
        parentEmail: email,
        studentName: (s.name as string) || "your child",
        studentDocId: sDoc.id,
        programTrack: (s.programTrack as string) || "full",
        isTest: u.isTest === true,
        unsubscribed: u.unsubscribed === true,
        intakeStartedAt: startedAt,
        daysSinceStart,
        reminderAlreadySent: !!s.intakeIncompleteReminderSentAt,
      });
    }
  }
  return out;
}

function buildVariables(r: IntakeRecipient): IntakeIncompleteVars {
  const base: EmailVariables = {
    parentName: r.parentName,
    parentEmail: r.parentEmail,
    studentName: r.studentName,
    programTrack: r.programTrack,
    cohortStartISO: PROGRAM_START_ISO,
  };
  return { ...base, intakeStartedISO: r.intakeStartedAt.toDate().toISOString().slice(0, 10) };
}

export async function sendIntakeIncompleteReminderToRecipient(
  r: IntakeRecipient,
  overrideTo?: string,
  bypassIsTest?: boolean
): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  if (r.unsubscribed) return { ok: false, messageId: null, error: "unsubscribed" };
  if (r.isTest && !bypassIsTest) return { ok: false, messageId: null, error: "isTest" };
  if (r.reminderAlreadySent && !overrideTo) {
    return { ok: false, messageId: null, error: "already_sent" };
  }

  const tpl = intakeIncompleteReminderTemplate(buildVariables(r));
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
        templateId: "intake_incomplete_reminder",
        parentUid: r.parentUid,
        studentName: r.studentName,
        studentDocId: r.studentDocId,
        daysSinceStart: r.daysSinceStart,
        previewSendTo: overrideTo || null,
      },
      messageId: result.messageId ?? undefined,
      error: result.error,
      bodyHtmlPreview: rendered.html.slice(0, 500),
    }
  );

  if (!overrideTo && (result.ok || result.error === "credentials_not_configured")) {
    try {
      await admin
        .firestore()
        .collection("users")
        .doc(r.parentUid)
        .collection("students")
        .doc(r.studentDocId)
        .update({
          intakeIncompleteReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
        });
    } catch (err) {
      console.error("[IntakeIncompleteReminder] flag update failed:", err);
    }
  }

  return result;
}

export const sendIntakeIncompleteReminder = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/New_York",
    region: "us-east1",
  },
  async () => {
    const recipients = await loadIntakeIncompleteRecipients();
    console.log(
      `[IntakeIncompleteReminder] ${recipients.length} stale-intake recipients.`
    );

    let sent = 0;
    let skipped = 0;
    for (const r of recipients) {
      const result = await sendIntakeIncompleteReminderToRecipient(r);
      if (result.ok) sent++;
      else skipped++;
    }
    console.log(
      `[IntakeIncompleteReminder] sent=${sent} skipped=${skipped}`
    );
  }
);
