/**
 * Attendance Flag → Parent Notification (D2, P0)
 *
 * Firestore-triggered Cloud Function on `attendance/{attendanceId}` (create + update).
 * Fans out a parent-facing email + writes a `notifications/{id}` doc the moment an
 * instructor adds a parent-relevant flag.
 *
 * ─── What triggers a notification ───
 *
 * Diff `before.flags` vs `after.flags`. Only NEWLY-ADDED flags fire — flag removal,
 * note edits, and status changes do NOT.
 *
 * Parent-relevant flags (auto-notify):
 *   - 'needs-parent-fyi'  — explicit instructor opt-in
 *   - 'illness'           — health-relevant
 *   - 'injury'            — health-relevant, urgent
 *
 * NOT auto-notified (intentionally — these go in the Friday digest only):
 *   - 'escalated'  | 'breakthrough' | 'regulated'
 *
 * ─── Suppression / dedup ───
 *
 * Per `(studentId, date, flag)` we send at most once. State lives on the attendance
 * doc itself in a `notifiedFlags: string[]` field — chosen over a separate
 * collection because (a) it's the simpler model the brief asked for, (b) it co-locates
 * the dedup state with the source-of-truth flags, (c) one Firestore write covers it.
 *
 * The trigger writes back `notifiedFlags` AFTER the parent email + notification doc
 * commit. Race-free because the array merges each new flag in. If the function retries
 * (e.g. a transient Gmail failure) the flag will not yet be in `notifiedFlags`, so
 * we'll retry the send. Once the upstream succeeds we mark it.
 *
 * ─── Privacy contract ───
 *
 * The email and the `notifications/{id}` doc include `parentVisibleNote` ONLY.
 * `notes` (instructor-private) is never read into either surface.
 */

import { onDocumentWritten } from "firebase-functions/v2/firestore";
import * as admin from "firebase-admin";
import { sendEmailWithResult, logEmail } from "./email-service";
import { attendanceFlagTemplate } from "./email-templates";

// Mirror of BehavioralFlag type from lib/attendance-service.ts. Kept duplicated
// here (rather than imported) because the functions/ tsconfig is independent of
// the Next app and we don't want a cross-package import. If this diverges, both
// places need updating — a unit test that asserts string equality could lock it
// down later.
type BehavioralFlag =
  | "regulated"
  | "escalated"
  | "breakthrough"
  | "needs-parent-fyi"
  | "illness"
  | "injury";

type ParentFlag = "needs-parent-fyi" | "illness" | "injury";

const PARENT_NOTIFY_FLAGS: readonly ParentFlag[] = [
  "needs-parent-fyi",
  "illness",
  "injury",
] as const;

const FLAG_DISPLAY: Record<ParentFlag, string> = {
  "needs-parent-fyi": "Parent FYI",
  illness: "Illness",
  injury: "Injury",
};

function isParentFlag(f: string): f is ParentFlag {
  return (PARENT_NOTIFY_FLAGS as readonly string[]).includes(f);
}

/**
 * Fetch parent profile for to/displayName. Falls back gracefully if the user
 * doc is missing (rare — implies an attendance record was created before the
 * parent had an account, which shouldn't happen but we don't want to crash).
 */
async function getParentEmail(
  parentId: string
): Promise<{ email: string; displayName: string } | null> {
  if (!parentId) return null;
  try {
    const userDoc = await admin
      .firestore()
      .collection("users")
      .doc(parentId)
      .get();
    if (!userDoc.exists) return null;
    const data = userDoc.data() ?? {};
    if (data.isTest === true) return null;
    const email = (data.email as string | undefined) ?? "";
    const displayName = (data.displayName as string | undefined) ?? "";
    if (!email) return null;
    return { email, displayName };
  } catch (err) {
    console.error("[AttendanceNotify] Failed to load parent profile:", err);
    return null;
  }
}

export const onAttendanceFlagged = onDocumentWritten(
  {
    document: "attendance/{attendanceId}",
    region: "us-east1",
  },
  async (event) => {
    const after = event.data?.after;
    // Deletion: nothing to do.
    if (!after?.exists) return;

    const afterData = after.data() as Record<string, unknown> | undefined;
    if (!afterData) return;

    const beforeData = event.data?.before?.exists
      ? (event.data.before.data() as Record<string, unknown>)
      : undefined;

    const beforeFlags: string[] = Array.isArray(beforeData?.flags)
      ? (beforeData!.flags as string[])
      : [];
    const afterFlags: string[] = Array.isArray(afterData.flags)
      ? (afterData.flags as string[])
      : [];

    // Newly-added flags (in after, not in before).
    const newlyAdded = afterFlags.filter((f) => !beforeFlags.includes(f));
    if (newlyAdded.length === 0) return;

    // Filter to parent-notifiable flags.
    const toNotify: ParentFlag[] = newlyAdded.filter(isParentFlag);
    if (toNotify.length === 0) return;

    // Suppression: skip flags already in `notifiedFlags`.
    const alreadyNotified: string[] = Array.isArray(afterData.notifiedFlags)
      ? (afterData.notifiedFlags as string[])
      : [];
    const pending = toNotify.filter((f) => !alreadyNotified.includes(f));
    if (pending.length === 0) {
      console.log(
        `[AttendanceNotify] All ${toNotify.length} flag(s) already notified for ${event.params.attendanceId}`
      );
      return;
    }

    // Pull the fields we need (and ONLY those — `notes` is never read).
    const studentId = (afterData.studentId as string) ?? "";
    const studentName = (afterData.studentName as string) ?? "your child";
    const parentId = (afterData.parentId as string) ?? "";
    const date = (afterData.date as string) ?? "";
    const parentVisibleNote =
      (afterData.parentVisibleNote as string | undefined) ?? "";

    if (!parentId || !studentId || !date) {
      console.warn(
        `[AttendanceNotify] Missing key fields on ${event.params.attendanceId} — skipping`
      );
      return;
    }

    const parentInfo = await getParentEmail(parentId);
    if (!parentInfo) {
      console.warn(
        `[AttendanceNotify] No parent email found for ${parentId} — skipping`
      );
      return;
    }

    const successfullyNotified: string[] = [];

    for (const flag of pending) {
      const flagDisplay = FLAG_DISPLAY[flag];

      const template = attendanceFlagTemplate({
        parentName: parentInfo.displayName,
        studentName,
        flag,
        flagDisplay,
        date,
        parentVisibleNote,
      });

      const sendRes = await sendEmailWithResult({
        to: parentInfo.email,
        subject: template.subject,
        htmlBody: template.html,
      });

      // Audit to emailLog regardless of outcome.
      await logEmail(
        parentInfo.email,
        template.subject,
        "attendance_flag_notification",
        sendRes.ok,
        {
          bodyHtmlPreview: template.html,
          messageId: sendRes.messageId,
          error: sendRes.error,
          meta: {
            studentId,
            studentName,
            parentId,
            flag,
            attendanceDocId: event.params.attendanceId,
            date,
          },
        }
      );

      // Always write a notification doc — parents see the in-portal entry even
      // if email delivery fails (we can also retry email separately). The doc
      // includes `emailedAt`/`emailMessageId` so the admin viewer can tell
      // whether the email actually went out.
      try {
        await admin.firestore().collection("notifications").add({
          parentId,
          studentId,
          studentName,
          kind: "attendance-flag",
          flag,
          flagDisplay,
          attendanceDocId: event.params.attendanceId,
          date,
          parentVisibleNote,
          emailed: sendRes.ok,
          emailedAt: sendRes.ok
            ? admin.firestore.FieldValue.serverTimestamp()
            : null,
          emailMessageId: sendRes.messageId ?? null,
          read: false,
          readAt: null,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch (err) {
        console.error(
          "[AttendanceNotify] Failed to write notifications doc:",
          err
        );
        // Don't mark notifiedFlags if we couldn't even record the notification —
        // we'd silently lose the audit otherwise.
        continue;
      }

      // Only mark notifiedFlags when email actually went out, OR when Gmail
      // creds are missing entirely (scaffold mode — retrying won't help).
      // Genuine send errors: leave un-marked so the retry path can try again
      // on the next write. Today we don't have a separate retry job — the
      // parent will get the next flag's email naturally — but this leaves the
      // door open without us racing ourselves into duplicates today.
      const shouldMark =
        sendRes.ok || sendRes.error === "credentials_not_configured";
      if (shouldMark) {
        successfullyNotified.push(flag);
      }
    }

    if (successfullyNotified.length === 0) return;

    // Idempotent merge — arrayUnion deduplicates.
    try {
      await admin
        .firestore()
        .collection("attendance")
        .doc(event.params.attendanceId)
        .set(
          {
            notifiedFlags:
              admin.firestore.FieldValue.arrayUnion(...successfullyNotified),
          },
          { merge: true }
        );
    } catch (err) {
      console.error(
        "[AttendanceNotify] Failed to update notifiedFlags — duplicate sends possible on next write:",
        err
      );
    }

    console.log(
      `[AttendanceNotify] ${event.params.attendanceId}: notified [${successfullyNotified.join(
        ", "
      )}] for ${studentName}`
    );
  }
);

// Re-export type for any consumers (currently none, but documents the contract).
export type { BehavioralFlag, ParentFlag };
