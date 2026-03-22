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
import { sendEmail, logEmail, escapeHtml } from "./email-service";
import {
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

    // Query all active guide leads
    const snapshot = await admin
      .firestore()
      .collection("guideLeads")
      .where("status", "==", "active")
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
      const emailsSent = lead.emailsSent || 1;
      const safeName = escapeHtml(lead.name || "there");

      // Email #2 — send on day 2+ if not yet sent
      if (daysSinceCapture >= 2 && emailsSent < 2) {
        const template = summerGuideDripEmail2Template({ name: safeName });

        const sent = await sendEmail({
          to: lead.email,
          subject: template.subject,
          htmlBody: template.html,
        });

        await logEmail(
          lead.email,
          template.subject,
          "guide_drip_2",
          sent
        );

        await doc.ref.update({ emailsSent: 2 });
        console.log(`[SummerGuideDrip] Sent Email #2 to ${lead.email}`);
        return;
      }

      // Email #3 — send on day 5+ if not yet sent, then complete
      if (daysSinceCapture >= 5 && emailsSent < 3) {
        const template = summerGuideDripEmail3Template({ name: safeName });

        const sent = await sendEmail({
          to: lead.email,
          subject: template.subject,
          htmlBody: template.html,
        });

        await logEmail(
          lead.email,
          template.subject,
          "guide_drip_3",
          sent
        );

        await doc.ref.update({ emailsSent: 3, status: "completed" });
        console.log(
          `[SummerGuideDrip] Sent Email #3 to ${lead.email} — sequence completed`
        );
      }
    });

    await Promise.all(promises);
    console.log("[SummerGuideDrip] Drip processing complete");
  }
);
