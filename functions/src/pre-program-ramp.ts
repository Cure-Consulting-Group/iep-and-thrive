/**
 * G3 — Pre-Program Ramp Series
 *
 * Scheduled daily 9:00 ET. On T-30 / T-14 / T-7 / T-1 days before program
 * start (PROGRAM_START_ISO), fans out the appropriate ramp template to
 * every enrolled or deposited parent (excluding isTest, unsubscribed).
 *
 * Manual preview/test trigger exposed as `previewRampEmail` HTTP function:
 *   GET /previewRampEmail?phase=T-7&uid=<parentUid>&sendTo=<email>
 *   Header: X-Admin-Token: <ADMIN_PREVIEW_TOKEN env var>
 *
 * The preview endpoint bypasses isTest filter (so the founder can render
 * a template using a test account's data and send it to a real inbox).
 * It still respects unsubscribed.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import { sendEmailWithResult, logEmail } from "./email-service";
import {
  EmailVariables,
  RampPhase,
  preProgramRampTemplate,
  renderEmail,
} from "./email-templates";

const PROGRAM_START_ISO = "2026-07-07";
const PROGRAM_END_ISO = "2026-08-15";
const PROGRAM_LOCATION = process.env.PROGRAM_LOCATION || "Long Island, NY (exact location shared on enrollment)";
const PROGRAM_DAILY_HOURS = "9:00am – 1:00pm, Monday–Friday";

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

function rampPhaseForToday(todayISO: string): RampPhase | null {
  const days = daysBetween(todayISO, PROGRAM_START_ISO);
  if (days === 30) return "T-30";
  if (days === 14) return "T-14";
  if (days === 7) return "T-7";
  if (days === 1) return "T-1";
  return null;
}

// ─── Roster loader ───

interface RampRecipient {
  parentUid: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  programTrack: string;
  isTest: boolean;
  unsubscribed: boolean;
}

async function loadRecipients(): Promise<RampRecipient[]> {
  const db = admin.firestore();
  const usersSnap = await db.collection("users").get();
  const out: RampRecipient[] = [];

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
      out.push({
        parentUid: userDoc.id,
        parentName: (u.displayName as string) || "",
        parentEmail: email,
        studentName: (s.name as string) || "your child",
        programTrack: (s.programTrack as string) || "full",
        isTest: u.isTest === true,
        unsubscribed: u.unsubscribed === true,
      });
    }
  }
  return out;
}

// ─── Send helpers ───

function buildVariables(r: RampRecipient): EmailVariables {
  return {
    parentName: r.parentName,
    parentEmail: r.parentEmail,
    studentName: r.studentName,
    programTrack: r.programTrack,
    cohortStartISO: PROGRAM_START_ISO,
    cohortEndISO: PROGRAM_END_ISO,
    programLocation: PROGRAM_LOCATION,
    programDailyHours: PROGRAM_DAILY_HOURS,
  };
}

async function sendRampToRecipient(
  phase: RampPhase,
  r: RampRecipient,
  overrideTo?: string,
  bypassIsTest?: boolean
): Promise<{ ok: boolean; messageId: string | null; error?: string }> {
  if (r.unsubscribed) return { ok: false, messageId: null, error: "unsubscribed" };
  if (r.isTest && !bypassIsTest) return { ok: false, messageId: null, error: "isTest" };

  const tpl = preProgramRampTemplate(phase, buildVariables(r));
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
        templateId: `pre_program_ramp_${phase.replace("-", "")}`,
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

  return result;
}

// ─── Scheduled fanout ───

export const sendPreProgramRamp = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/New_York",
    region: "us-east1",
  },
  async () => {
    const today = todayISO_ET();
    const phase = rampPhaseForToday(today);
    if (!phase) {
      console.log(`[PreProgramRamp] ${today}: not a ramp day (T-30/14/7/1).`);
      return;
    }

    const recipients = await loadRecipients();
    console.log(`[PreProgramRamp] ${today} (${phase}): ${recipients.length} recipients loaded.`);

    let sent = 0;
    let skipped = 0;
    for (const r of recipients) {
      const result = await sendRampToRecipient(phase, r);
      if (result.ok) sent++;
      else skipped++;
    }
    console.log(`[PreProgramRamp] ${today} (${phase}): sent=${sent}, skipped=${skipped}.`);
  }
);

// ─── Manual preview / test trigger ───

export const previewRampEmail = onRequest(
  {
    region: "us-east1",
    cors: false,
  },
  async (req, res) => {
    const adminToken = req.headers["x-admin-token"] as string | undefined;
    const expected = process.env.ADMIN_PREVIEW_TOKEN;
    if (!expected || adminToken !== expected) {
      res.status(403).json({ ok: false, error: "Forbidden" });
      return;
    }

    const phaseQ = (req.query.phase as string) || "";
    const uid = (req.query.uid as string) || "";
    const sendTo = (req.query.sendTo as string) || "";
    const dryRun = req.query.dryRun === "1";

    if (!["T-30", "T-14", "T-7", "T-1"].includes(phaseQ)) {
      res.status(400).json({ ok: false, error: "Invalid phase. Use T-30, T-14, T-7, T-1." });
      return;
    }
    if (!uid || !sendTo) {
      res.status(400).json({ ok: false, error: "Missing uid or sendTo query params." });
      return;
    }

    try {
      const userSnap = await admin.firestore().collection("users").doc(uid).get();
      if (!userSnap.exists) {
        res.status(404).json({ ok: false, error: "User not found." });
        return;
      }
      const u = userSnap.data() ?? {};
      const studentsSnap = await admin
        .firestore()
        .collection("users")
        .doc(uid)
        .collection("students")
        .limit(1)
        .get();
      const s = studentsSnap.docs[0]?.data() ?? {};

      const recipient: RampRecipient = {
        parentUid: uid,
        parentName: (u.displayName as string) || "",
        parentEmail: (u.email as string) || sendTo,
        studentName: (s.name as string) || "your child",
        programTrack: (s.programTrack as string) || "full",
        isTest: u.isTest === true,
        unsubscribed: u.unsubscribed === true,
      };

      if (dryRun) {
        const tpl = preProgramRampTemplate(phaseQ as RampPhase, buildVariables(recipient));
        const rendered = renderEmail({ subject: tpl.subject, layout: tpl.layout, recipientUid: uid });
        res.status(200).json({
          ok: true,
          dryRun: true,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        });
        return;
      }

      const result = await sendRampToRecipient(phaseQ as RampPhase, recipient, sendTo, true);
      res.status(200).json({
        ok: result.ok,
        messageId: result.messageId,
        error: result.error,
        sentTo: sendTo,
        phase: phaseQ,
      });
    } catch (err) {
      console.error("[previewRampEmail] failed:", err);
      res.status(500).json({ ok: false, error: String(err) });
    }
  }
);
