/**
 * Summer Guide Drip Cloud Function
 * Scheduled daily at 9:00 AM ET to send follow-up emails
 * to leads who downloaded the IEP Summer Guide.
 *
 * Drip sequence:
 *   Email #1 — Immediate (handled by summerGuideCapture)
 *   Email #2 — Day 2: Value + social proof
 *   Email #3 — Day 5: Urgency + offer (final)
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { logEmail, escapeHtml } from "./email-service";
import { deliverEmail } from "./email-ledger";
import {
  summerGuideDeliveryTemplate,
  summerGuideDripEmail2Template,
  summerGuideDripEmail3Template,
} from "./summer-guide-emails";

export const summerGuideDrip = onSchedule(
  {
    schedule: "0 9 * * *",
    timeZone: "America/New_York",
    region: "us-east1",
  },
  async () => {
    const now = new Date();

    // Process at most 200 leads per run. The next scheduled run continues the
    // queue, keeping Firestore cost, provider fan-out, and function latency bounded.
    const snapshot = await admin
      .firestore()
      .collection("guideLeads")
      .where("status", "==", "active")
      .limit(200)
      .get();

    console.log(
      `[SummerGuideDrip] Found ${snapshot.size} active guide leads`
    );

    const promises = snapshot.docs.map(async (doc) => {
      const lead = doc.data();
      const capturedAt = lead.capturedAt?.toDate?.();

      if (!capturedAt) {
        console.log(`[SummerGuideDrip] Lead ${doc.id} missing capturedAt, skipping`);
        return;
      }

      const daysSinceCapture = Math.floor(
        (now.getTime() - capturedAt.getTime()) / (1000 * 60 * 60 * 24)
      );
      // Older leads predate the durable counter and were already delivered at
      // capture time; new leads start at zero so a failed immediate send can retry.
      const emailsSent = typeof lead.emailsSent === "number" ? lead.emailsSent : 1;
      const safeName = escapeHtml(lead.name || "there");

      // Recover a failed immediate guide delivery before moving to later phases.
      if (emailsSent < 1) {
        const template = summerGuideDeliveryTemplate({ name: safeName });
        const result = await deliverEmail({
          key: {
            template: "guide_delivery",
            recipient: lead.email,
            program: "summer-guide",
            phase: "immediate",
          },
          options: {
            to: lead.email,
            subject: template.subject,
            htmlBody: template.html,
            classification: template.classification,
          },
        });

        await logEmail(lead.email, template.subject, "guide_delivery", result.ok, {
          messageId: result.messageId,
          error: result.error,
          skipped: result.status === "skipped",
        });

        if (result.ok) {
          await doc.ref.update({ emailsSent: 1 });
        }
        return;
      }

      // Email #2 — send on day 2+ if not yet sent
      if (daysSinceCapture >= 2 && emailsSent < 2) {
        const template = summerGuideDripEmail2Template({ name: safeName });

        const result = await deliverEmail({
          key: {
            template: "guide_drip_2",
            recipient: lead.email,
            program: "summer-guide",
            phase: "day-2",
          },
          options: {
            to: lead.email,
            subject: template.subject,
            htmlBody: template.html,
            classification: template.classification,
          },
        });

        await logEmail(lead.email, template.subject, "guide_drip_2", result.ok, {
          messageId: result.messageId,
          error: result.error,
          skipped: result.status === "skipped",
        });

        if (result.ok) {
          await doc.ref.update({ emailsSent: 2 });
          console.log("[SummerGuideDrip] Email #2 delivered");
        }
        return;
      }

      // Email #3 — send on day 5+ if not yet sent, then complete
      if (daysSinceCapture >= 5 && emailsSent < 3) {
        const template = summerGuideDripEmail3Template({ name: safeName });

        const result = await deliverEmail({
          key: {
            template: "guide_drip_3",
            recipient: lead.email,
            program: "summer-guide",
            phase: "day-5",
          },
          options: {
            to: lead.email,
            subject: template.subject,
            htmlBody: template.html,
            classification: template.classification,
          },
        });

        await logEmail(lead.email, template.subject, "guide_drip_3", result.ok, {
          messageId: result.messageId,
          error: result.error,
          skipped: result.status === "skipped",
        });

        if (result.ok) {
          await doc.ref.update({ emailsSent: 3, status: "completed" });
          console.log("[SummerGuideDrip] Email #3 delivered; sequence completed");
        }
      }
    });

    await Promise.all(promises);
    console.log("[SummerGuideDrip] Drip processing complete");
  }
);
