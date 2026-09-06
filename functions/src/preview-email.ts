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
import { z } from "zod";
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
import {
  PUBLIC_CORS_ORIGINS,
  assertBodySize,
  assertContentType,
  assertMethod,
  assertQuota,
  errorEnvelope,
} from "./http-guard";

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

const previewSchema = z.object({
  kind: z.enum(["welcome", "balance", "photoRelease", "intakeIncomplete", "ramp"]),
  phase: z.string().max(16).optional().default(""),
  uid: z.string().max(128).optional().default(""),
  sendTo: z.string().max(320).optional().default(""),
  dryRun: z.union([z.string().max(8), z.boolean()]).optional().default(""),
}).strict();

const MAX_BODY_BYTES = 8 * 1024;

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
    cors: PUBLIC_CORS_ORIGINS,
  },
  async (req, res) => {
    if (!assertMethod(req, res, ["GET", "POST"])) return;
    if (req.method === "POST" && !assertContentType(req, res)) return;
    if (!assertBodySize(req, res, MAX_BODY_BYTES)) return;
    if (
      !(await assertQuota(req, res, "preview-email", {
        limit: 20,
        windowSeconds: 10 * 60,
      }))
    ) return;

    const adminToken = req.headers["x-admin-token"] as string | undefined;
    const expected = process.env.ADMIN_PREVIEW_TOKEN;
    if (!expected || adminToken !== expected) {
      errorEnvelope(res, 403, "forbidden", "Forbidden.");
      return;
    }

    const params = req.method === "GET" ? req.query : req.body || {};
    const parsed = previewSchema.safeParse(params);
    if (!parsed.success) {
      errorEnvelope(res, 400, "invalid_request", "Invalid preview request.");
      return;
    }

    const { kind, phase, uid, sendTo, dryRun: dryRunValue } = parsed.data;
    const dryRun = String(dryRunValue) === "1" || String(dryRunValue) === "true";

    if (!uid || !sendTo) {
      errorEnvelope(res, 400, "invalid_request", "Missing preview recipient details.");
      return;
    }

    let previewRef: admin.firestore.DocumentReference | undefined;
    try {
      const userSnap = await admin.firestore().collection("users").doc(uid).get();
      if (!userSnap.exists) {
        errorEnvelope(res, 404, "not_found", "The requested user was not found.");
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
        errorEnvelope(res, 400, "invalid_request", "Invalid preview request.");
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

      // Persist the preview delivery attempt before dispatching email so an
      // upstream failure leaves a durable record for recovery and audit.
      previewRef = await admin.firestore().collection("previewEmailRequests").add({
        uid,
        sendTo,
        templateId: rendered.templateId,
        previewKind: kind,
        previewPhase: phase || null,
        status: "pending",
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
      });

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

      try {
        await previewRef.update({
          status: result.ok ? "sent" : "failed",
          messageId: result.messageId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (error) {
        console.error("Preview email status update failed:", error);
      }

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
        error: result.ok ? undefined : "Email could not be sent.",
        sentTo: sendTo,
        templateId: rendered.templateId,
      });
    } catch (err) {
      if (previewRef) {
        try {
          await previewRef.update({
            status: "failed",
            failureCode: "provider_error",
            updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } catch (statusError) {
          console.error("Preview email failure status update failed:", statusError);
        }
      }
      console.error("[previewEmail] failed:", err);
      errorEnvelope(res, 500, "internal_error", "Preview email failed. Please try again.");
    }
  }
);
