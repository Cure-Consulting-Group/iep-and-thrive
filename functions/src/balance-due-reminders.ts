/**
 * G4 — Balance Due Reminders (T-30 / T-14 / T-7)
 *
 * Scheduled daily 9:00 ET. Fans out the appropriate balance-due reminder to
 * every depositPaid + balancePaid !== true parent on T-30 / T-14 / T-7
 * before BALANCE_DUE_ISO (2026-06-23).
 *
 * Dedupe: users/{uid}.balanceReminders: { T-30: true, T-14: true, T-7: true }.
 * Founder QA preview is exposed via the unified previewEmail function.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendEmailWithResult, logEmail } from "./email-service";
import { renderEmail, EmailVariables } from "./email-templates";
import {
  BalancePhase,
  BalanceReminderVars,
  balanceDueReminderTemplate,
} from "./lifecycle-email-templates";

const PROGRAM_START_ISO = "2026-07-07";
export const BALANCE_DUE_ISO = "2026-06-23";

// ─── Date utilities (ET wall-clock) ───

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

export function balancePhaseForToday(todayISO: string): BalancePhase | null {
  const days = daysBetween(todayISO, BALANCE_DUE_ISO);
  if (days === 30) return "T-30";
  if (days === 14) return "T-14";
  if (days === 7) return "T-7";
  return null;
}

// ─── Recipient model ───

export interface BalanceRecipient {
  parentUid: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  programTrack: string;
  isTest: boolean;
  unsubscribed: boolean;
  balancePaid: boolean;
  balanceReminders: Record<string, boolean>;
}

export async function loadBalanceRecipients(): Promise<BalanceRecipient[]> {
  const db = admin.firestore();
  const usersSnap = await db.collection("users").get();
  const out: BalanceRecipient[] = [];

  for (const userDoc of usersSnap.docs) {
    const u = userDoc.data() ?? {};
    if (u.depositPaid !== true) continue;
    if (u.balancePaid === true) continue;
    const email = (u.email as string) || "";
    if (!email) continue;

    const studentsSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("students")
      .limit(1)
      .get();
    const s = studentsSnap.docs[0]?.data() ?? {};

    out.push({
      parentUid: userDoc.id,
      parentName: (u.displayName as string) || "",
      parentEmail: email,
      studentName: (s.name as string) || "your child",
      programTrack: (s.programTrack as string) || "full",
      isTest: u.isTest === true,
      unsubscribed: u.unsubscribed === true,
      balancePaid: u.balancePaid === true,
      balanceReminders:
        (u.balanceReminders as Record<string, boolean>) || {},
    });
  }
  return out;
}

function buildVariables(r: BalanceRecipient): BalanceReminderVars {
  const base: EmailVariables = {
    parentName: r.parentName,
    parentEmail: r.parentEmail,
    studentName: r.studentName,
    programTrack: r.programTrack,
    cohortStartISO: PROGRAM_START_ISO,
  };
  return { ...base, balanceDueISO: BALANCE_DUE_ISO };
}

export async function sendBalanceReminderToRecipient(
  phase: BalancePhase,
  r: BalanceRecipient,
  overrideTo?: string,
  bypassIsTest?: boolean
): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  if (r.unsubscribed) return { ok: false, messageId: null, error: "unsubscribed" };
  if (r.isTest && !bypassIsTest) return { ok: false, messageId: null, error: "isTest" };
  if (r.balanceReminders[phase] === true && !overrideTo) {
    return { ok: false, messageId: null, error: "already_sent" };
  }

  const tpl = balanceDueReminderTemplate(phase, buildVariables(r));
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
        templateId: `balance_due_${phase.replace("-", "")}`,
        phase,
        parentUid: r.parentUid,
        studentName: r.studentName,
        balanceDueISO: BALANCE_DUE_ISO,
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
        [`balanceReminders.${phase}`]: true,
        [`balanceRemindersSentAt.${phase}`]: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (err) {
      console.error("[BalanceDueReminders] flag update failed:", err);
    }
  }

  return result;
}

export const sendBalanceDueReminders = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/New_York",
    region: "us-east1",
  },
  async () => {
    const today = todayISO_ET();
    const phase = balancePhaseForToday(today);
    if (!phase) {
      console.log(`[BalanceDueReminders] ${today}: not a balance reminder day.`);
      return;
    }

    const recipients = await loadBalanceRecipients();
    console.log(
      `[BalanceDueReminders] ${today} (${phase}): ${recipients.length} unpaid-balance recipients.`
    );

    let sent = 0;
    let skipped = 0;
    for (const r of recipients) {
      const result = await sendBalanceReminderToRecipient(phase, r);
      if (result.ok) sent++;
      else skipped++;
    }
    console.log(`[BalanceDueReminders] ${today} (${phase}): sent=${sent} skipped=${skipped}`);
  }
);
