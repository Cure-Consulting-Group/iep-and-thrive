/**
 * Unified Email Preview HTTP endpoint.
 *
 * Admin-token gated (X-Admin-Token: ADMIN_PREVIEW_TOKEN env). Bypasses the
 * isTest filter so the founder can render a template using a test cohort
 * persona and send to a real inbox. Still respects unsubscribed.
 *
 * Usage:
 *   GET /previewEmail?kind=welcome&phase=day-0&uid=<parentUid>&sendTo=<email>
 *   GET /previewEmail?kind=balance&phase=T-14&uid=<uid>&sendTo=<email>&dryRun=1
 *   GET /previewEmail?kind=photoRelease&uid=<uid>&sendTo=<email>
 *   GET /previewEmail?kind=intakeIncomplete&uid=<uid>&sendTo=<email>
 *   GET /previewEmail?kind=ramp&phase=T-7&uid=<uid>&sendTo=<email>
 *
 * dryRun=1 returns rendered subject/html/text without sending. Otherwise
 * the email is dispatched via Gmail API to sendTo.
 */

import { onRequest } from "firebase-functions/v2/https";
import * as admin from "firebase-admin";
import {
  EmailVariables,
  RampPhase,
  preProgramRampTemplate,
  renderEmail,
} from "./email-templates";
import {
  WelcomePhase,
  BalancePhase,
  welcomeSequenceTemplate,
  balanceDueReminderTemplate,
  photoReleaseReminderTemplate,
  intakeIncompleteReminderTemplate,
} from "./lifecycle-email-templates";
import { sendEmailWithResult, logEmail } from "./email-service";

const PROGRAM_START_ISO = "2026-07-07";
const PROGRAM_END_ISO = "2026-08-15";
const BALANCE_DUE_ISO = "2026-06-23";
const PROGRAM_LOCATION =
  process.env.PROGRAM_LOCATION ||
  "Long Island, NY (exact location shared on enrollment)";
const PROGRAM_DAILY_HOURS = "9:00am – 1:00pm, Monday–Friday";

type Kind =
  | "welcome"
  | "balance"
  | "photoRelease"
  | "intakeIncomplete"
  | "ramp";

interface BuildArgs {
  kind: Kind;
  phase: string;
  parentName: string;
  parentEmail: string;
  studentName: string;
  programTrack: string;
  intakeSubmitted: boolean;
  uid: string;
}

function buildVariables(args: BuildArgs): EmailVariables {
  return {
    parentName: args.parentName,
    parentEmail: args.parentEmail,
    studentName: args.studentName,
    programTrack: args.programTrack,
    cohortStartISO: PROGRAM_START_ISO,
    cohortEndISO: PROGRAM_END_ISO,
    programLocation: PROGRAM_LOCATION,
    programDailyHours: PROGRAM_DAILY_HOURS,
  };
}

function renderForKind(args: BuildArgs):
  | { ok: true; subject: string; html: string; text: string; templateId: string }
  | { ok: false; error: string } {
  const base = buildVariables(args);

  if (args.kind === "welcome") {
    if (!["day-0", "day-2", "day-7"].includes(args.phase)) {
      return { ok: false, error: "Invalid phase for welcome (use day-0/day-2/day-7)" };
    }
    const tpl = welcomeSequenceTemplate(args.phase as WelcomePhase, {
      ...base,
      intakeSubmitted: args.intakeSubmitted,
    });
    const r = renderEmail({ subject: tpl.subject, layout: tpl.layout, recipientUid: args.uid });
    return { ok: true, ...r, templateId: `welcome_${args.phase.replace("-", "")}` };
  }

  if (args.kind === "balance") {
    if (!["T-30", "T-14", "T-7"].includes(args.phase)) {
      return { ok: false, error: "Invalid phase for balance (use T-30/T-14/T-7)" };
    }
    const tpl = balanceDueReminderTemplate(args.phase as BalancePhase, {
      ...base,
      balanceDueISO: BALANCE_DUE_ISO,
    });
    const r = renderEmail({ subject: tpl.subject, layout: tpl.layout, recipientUid: args.uid });
    return { ok: true, ...r, templateId: `balance_due_${args.phase.replace("-", "")}` };
  }

  if (args.kind === "photoRelease") {
    const tpl = photoReleaseReminderTemplate(base);
    const r = renderEmail({ subject: tpl.subject, layout: tpl.layout, recipientUid: args.uid });
    return { ok: true, ...r, templateId: "photo_release_reminder" };
  }

  if (args.kind === "intakeIncomplete") {
    const tpl = intakeIncompleteReminderTemplate(base);
    const r = renderEmail({ subject: tpl.subject, layout: tpl.layout, recipientUid: args.uid });
    return { ok: true, ...r, templateId: "intake_incomplete_reminder" };
  }

  if (args.kind === "ramp") {
    if (!["T-30", "T-14", "T-7", "T-1"].includes(args.phase)) {
      return { ok: false, error: "Invalid phase for ramp (use T-30/T-14/T-7/T-1)" };
    }
    const tpl = preProgramRampTemplate(args.phase as RampPhase, base);
    const r = renderEmail({ subject: tpl.subject, layout: tpl.layout, recipientUid: args.uid });
    return { ok: true, ...r, templateId: `pre_program_ramp_${args.phase.replace("-", "")}` };
  }

  return { ok: false, error: `Unknown kind: ${args.kind}` };
}

export const previewEmail = onRequest(
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

    const params = req.method === "GET" ? req.query : req.body || {};
    const kind = (params.kind as string) || "";
    const phase = (params.phase as string) || "";
    const uid = (params.uid as string) || "";
    const sendTo = (params.sendTo as string) || "";
    const dryRun = String(params.dryRun || "") === "1" || String(params.dryRun || "") === "true";

    if (!["welcome", "balance", "photoRelease", "intakeIncomplete", "ramp"].includes(kind)) {
      res
        .status(400)
        .json({ ok: false, error: "kind must be one of: welcome, balance, photoRelease, intakeIncomplete, ramp" });
      return;
    }

    if (!uid || !sendTo) {
      res.status(400).json({ ok: false, error: "Missing uid or sendTo" });
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

      const args: BuildArgs = {
        kind: kind as Kind,
        phase,
        parentName: (u.displayName as string) || "",
        parentEmail: (u.email as string) || sendTo,
        studentName: (s.name as string) || "your child",
        programTrack: (s.programTrack as string) || "full",
        intakeSubmitted: s.intakeSubmitted === true,
        uid,
      };

      const rendered = renderForKind(args);
      if (!rendered.ok) {
        res.status(400).json({ ok: false, error: rendered.error });
        return;
      }

      // Respect unsubscribed even on preview (CAN-SPAM).
      const unsubscribed = u.unsubscribed === true;
      if (unsubscribed) {
        res.status(200).json({
          ok: false,
          error: "recipient_unsubscribed",
          dryRun,
          subject: rendered.subject,
          html: dryRun ? rendered.html : undefined,
          text: dryRun ? rendered.text : undefined,
        });
        return;
      }

      if (dryRun) {
        res.status(200).json({
          ok: true,
          dryRun: true,
          templateId: rendered.templateId,
          subject: rendered.subject,
          html: rendered.html,
          text: rendered.text,
        });
        return;
      }

      // Send. Use kind=transactional so sendEmailWithResult bypasses the isTest
      // and unsubscribed filters — this is the founder QA bypass for E13.
      const result = await sendEmailWithResult({
        to: sendTo,
        subject: rendered.subject,
        htmlBody: rendered.html,
        textBody: rendered.text,
        kind: "transactional",
        recipientUid: uid,
      });

      await logEmail(sendTo, rendered.subject, "general", result.ok, {
        meta: {
          templateId: rendered.templateId,
          previewKind: kind,
          previewPhase: phase || null,
          previewParentUid: uid,
        },
        messageId: result.messageId ?? undefined,
        error: result.error,
        bodyHtmlPreview: rendered.html.slice(0, 500),
      });

      res.status(200).json({
        ok: result.ok,
        messageId: result.messageId,
        error: result.error,
        sentTo: sendTo,
        templateId: rendered.templateId,
      });
    } catch (err) {
      console.error("[previewEmail] failed:", err);
      res.status(500).json({ ok: false, error: String(err) });
    }
  }
);
