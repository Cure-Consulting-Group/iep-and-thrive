/**
 * G6 — Photo / Video Release Reminder (T-14)
 *
 * Scheduled daily 9:00 ET. For deposited / enrolled students whose
 * photoReleaseSignedAt is null, fires the reminder once when daysToStart
 * reaches 14 (or any day inside [0, 14] when not yet sent — guards a
 * recovery if the cron missed a day).
 *
 * Dedupe: users/{uid}.photoReleaseReminderSentAt timestamp.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendEmailWithResult, logEmail } from "./email-service";
import { renderEmail, EmailVariables } from "./email-templates";
import {
  PhotoReleaseVars,
  photoReleaseReminderTemplate,
} from "./lifecycle-email-templates";

const PROGRAM_START_ISO = "2026-07-07";

// ─── Date utilities ───

function todayISO_ET(): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function daysBetween(fromISO: string, toISO: string): number {
  const a = new Date(fromISO + "T00:00:00Z").getTime();
  const b = new Date(toISO + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86400000);
}

// ─── Recipient model ───

export interface PhotoReleaseRecipient {
  parentUid: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  studentDocId: string;
  programTrack: string;
  isTest: boolean;
  unsubscribed: boolean;
  photoReleaseSignedAt: admin.firestore.Timestamp | null;
  reminderAlreadySent: boolean;
}

export async function loadPhotoReleaseRecipients(): Promise<PhotoReleaseRecipient[]> {
  const db = admin.firestore();
  const usersSnap = await db.collection("users").get();
  const out: PhotoReleaseRecipient[] = [];

  for (const userDoc of usersSnap.docs) {
    const u = userDoc.data() ?? {};
    const email = (u.email as string) || "";
    if (!email) continue;

    const studentsSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("students")
      .where("enrollmentStatus", "in", ["deposited", "enrolled"])
      .get();

    for (const sDoc of studentsSnap.docs) {
      const s = sDoc.data() ?? {};
      // Already signed — skip.
      if (s.photoReleaseSignedAt) continue;

      out.push({
        parentUid: userDoc.id,
        parentName: (u.displayName as string) || "",
        parentEmail: email,
        studentName: (s.name as string) || "your child",
        studentDocId: sDoc.id,
        programTrack: (s.programTrack as string) || "full",
        isTest: u.isTest === true,
        unsubscribed: u.unsubscribed === true,
        photoReleaseSignedAt: null,
        reminderAlreadySent: !!u.photoReleaseReminderSentAt,
      });
    }
  }
  return out;
}

function buildVariables(r: PhotoReleaseRecipient): PhotoReleaseVars {
  const base: EmailVariables = {
    parentName: r.parentName,
    parentEmail: r.parentEmail,
    studentName: r.studentName,
    programTrack: r.programTrack,
    cohortStartISO: PROGRAM_START_ISO,
  };
  return base;
}

export async function sendPhotoReleaseReminderToRecipient(
  r: PhotoReleaseRecipient,
  overrideTo?: string,
  bypassIsTest?: boolean
): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  if (r.unsubscribed) return { ok: false, messageId: null, error: "unsubscribed" };
  if (r.isTest && !bypassIsTest) return { ok: false, messageId: null, error: "isTest" };
  if (r.reminderAlreadySent && !overrideTo) {
    return { ok: false, messageId: null, error: "already_sent" };
  }

  const tpl = photoReleaseReminderTemplate(buildVariables(r));
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
        templateId: "photo_release_reminder",
        parentUid: r.parentUid,
        studentName: r.studentName,
        studentDocId: r.studentDocId,
        previewSendTo: overrideTo || null,
      },
      messageId: result.messageId ?? undefined,
      error: result.error,
      bodyHtmlPreview: rendered.html.slice(0, 500),
    }
  );

  if (!overrideTo && (result.ok || result.error === "credentials_not_configured")) {
    try {
      await admin.firestore().collection("users").doc(r.parentUid).update({
        photoReleaseReminderSentAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("[PhotoReleaseReminder] flag update failed:", err);
    }
  }

  return result;
}

export const sendPhotoReleaseReminder = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/New_York",
    region: "us-east1",
  },
  async () => {
    const today = todayISO_ET();
    const daysToStart = daysBetween(today, PROGRAM_START_ISO);
    if (daysToStart > 14 || daysToStart < 0) {
      console.log(
        `[PhotoReleaseReminder] ${today}: outside reminder window (daysToStart=${daysToStart}).`
      );
      return;
    }

    const recipients = await loadPhotoReleaseRecipients();
    console.log(
      `[PhotoReleaseReminder] ${today} (T-${daysToStart}): ${recipients.length} unsigned-release recipients.`
    );

    let sent = 0;
    let skipped = 0;
    for (const r of recipients) {
      const result = await sendPhotoReleaseReminderToRecipient(r);
      if (result.ok) sent++;
      else skipped++;
    }
    console.log(
      `[PhotoReleaseReminder] ${today}: sent=${sent} skipped=${skipped}`
    );
  }
);
