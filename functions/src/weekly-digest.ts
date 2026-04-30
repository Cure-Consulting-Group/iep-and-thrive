/**
 * Weekly Friday Digest (D5)
 *
 * Scheduled every Friday 17:00 America/New_York. Window-gated to the program
 * range (Tue Jul 7, 2026 → Sat Aug 15, 2026). Outside that window the function
 * is a no-op so we don't have to redeploy to disable it pre-program or post-
 * program.
 *
 * ─── What it does ───
 *
 * 1. Loads enrolled students (status in ['deposited', 'enrolled']) from the
 *    `users/{uid}/students/{sid}` subcollection across all parent users.
 * 2. Groups students by parentId (one email per parent).
 * 3. Per student, computes Mon→Fri attendance counts (week 6 includes Sat
 *    showcase if Aug 15 falls within range), pulls all `parentVisibleNote`
 *    values for the week, counts `breakthrough` and `needs-parent-fyi` flags,
 *    and surfaces a "new this week" report if one was published.
 * 4. Renders the `weeklyDigestTemplate` and sends via Gmail.
 * 5. Writes one row per send to `emailLog/`.
 *
 * ─── Privacy contract ───
 *
 * Reads `notes` is forbidden in this surface. Only `parentVisibleNote` may
 * leave the function in any rendered output. The query reads full attendance
 * docs (because Firestore doesn't project), but the projection happens in code
 * before reaching the template.
 */

import { onSchedule } from "firebase-functions/v2/scheduler";
import * as admin from "firebase-admin";
import { sendEmailWithResult, logEmail } from "./email-service";
import {
  weeklyDigestTemplate,
  WeeklyDigestStudentSection,
} from "./email-templates";

// ─── Program window constants ───
//
// Dates anchored to America/New_York wall-clock. We don't actually need TZ math
// to decide "is today in the window" because we compare YYYY-MM-DD strings
// derived from an ET-formatted Date — the schedule itself is TZ-pinned to ET.

const PROGRAM_START_ISO = "2026-07-07"; // Tue
const PROGRAM_END_ISO = "2026-08-15"; // Sat
const SHOWCASE_ISO = "2026-08-15";
const PROGRAM_WEEKS = 6;

const PROGRAM_TRACK_LABELS: Record<string, string> = {
  reading: "Reading & Language",
  math: "Math & Numeracy",
  full: "Full Academic",
};

// ─── Date utilities (ET wall-clock) ───

function nowInET(): Date {
  // Construct a Date whose components reflect ET regardless of host TZ.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  return new Date(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
}

function toISO(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function addDays(d: Date, n: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + n);
  return out;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function mondayOf(d: Date): Date {
  const dow = d.getDay();
  const offset = dow === 0 ? -6 : 1 - dow;
  return addDays(d, offset);
}

interface WeekWindow {
  weekNumber: number;
  weekStartISO: string;
  weekEndISO: string;
  daysExpected: number;
  rangeLabel: string;
}

function computeWeekWindow(now: Date): WeekWindow | null {
  const today = startOfDay(now);
  const start = new Date(2026, 6, 7);
  const end = new Date(2026, 7, 15);
  if (today < start || today > end) return null;

  const daysSinceStart = Math.floor((today.getTime() - start.getTime()) / 86400000);
  const weekNumber = Math.min(PROGRAM_WEEKS, Math.floor(daysSinceStart / 7) + 1);
  const monday = weekNumber === 1 ? start : mondayOf(today);
  const isFinalWeek = weekNumber === PROGRAM_WEEKS;
  const lastDay = isFinalWeek ? addDays(monday, 5) : addDays(monday, 4);

  return {
    weekNumber,
    weekStartISO: toISO(monday),
    weekEndISO: toISO(lastDay),
    daysExpected: isFinalWeek ? 6 : 5,
    rangeLabel: `${monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${lastDay.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
  };
}

// ─── Data loaders ───

interface EnrolledStudent {
  studentId: string;
  studentName: string;
  programTrack: string;
  parentId: string;
  parentEmail: string;
  parentName: string;
}

async function loadEnrolledStudents(): Promise<EnrolledStudent[]> {
  const db = admin.firestore();
  const usersSnap = await db.collection("users").get();
  const out: EnrolledStudent[] = [];

  for (const userDoc of usersSnap.docs) {
    const userData = userDoc.data() || {};
    if (userData.isTest === true) continue;
    const parentEmail = (userData.email as string) || "";
    const parentName = (userData.displayName as string) || "";
    if (!parentEmail) continue;

    const studentsSnap = await db
      .collection("users")
      .doc(userDoc.id)
      .collection("students")
      .where("enrollmentStatus", "in", ["deposited", "enrolled"])
      .get();

    for (const sDoc of studentsSnap.docs) {
      const s = sDoc.data() || {};
      out.push({
        studentId: sDoc.id,
        studentName: (s.name as string) || "Student",
        programTrack: (s.programTrack as string) || "full",
        parentId: userDoc.id,
        parentEmail,
        parentName,
      });
    }
  }

  return out;
}

async function loadWeekAttendance(
  studentId: string,
  weekStartISO: string,
  weekEndISO: string
): Promise<admin.firestore.DocumentData[]> {
  const snap = await admin
    .firestore()
    .collection("attendance")
    .where("studentId", "==", studentId)
    .where("date", ">=", weekStartISO)
    .where("date", "<=", weekEndISO)
    .orderBy("date", "asc")
    .get();
  return snap.docs.map((d) => d.data());
}

async function loadNewReportThisWeek(
  studentId: string,
  weekStartISO: string,
  weekEndISO: string
): Promise<{ weekNumber: number; reportUrl: string } | null> {
  // We can't compose two range filters on different fields, so we fetch the
  // most recent report by weekNumber and filter by publishedAt in code. Fine
  // because per-student report count is bounded (≤7 over the program).
  const snap = await admin
    .firestore()
    .collection("progressReports")
    .where("studentId", "==", studentId)
    .orderBy("weekNumber", "desc")
    .limit(3)
    .get();

  for (const d of snap.docs) {
    const r = d.data();
    const publishedAt = r.publishedAt?.toDate?.() as Date | undefined;
    if (!publishedAt) continue;
    const iso = toISO(publishedAt);
    if (iso >= weekStartISO && iso <= weekEndISO) {
      return {
        weekNumber: Number(r.weekNumber) || 0,
        reportUrl: (r.reportUrl as string) || "",
      };
    }
  }
  return null;
}

// ─── Per-student aggregation ───

function buildSection(
  student: EnrolledStudent,
  weekNumber: number,
  daysExpected: number,
  records: admin.firestore.DocumentData[],
  newReport: { weekNumber: number; reportUrl: string } | null
): WeeklyDigestStudentSection {
  let presentCount = 0;
  let absentCount = 0;
  let lateCount = 0;
  let breakthroughCount = 0;
  let parentFyiCount = 0;
  const parentVisibleNotes: { date: string; text: string }[] = [];

  for (const r of records) {
    const status = r.status as string;
    if (status === "present") presentCount++;
    else if (status === "absent") absentCount++;
    else if (status === "late-arrival") lateCount++;

    const flags: string[] = Array.isArray(r.flags) ? r.flags : [];
    if (flags.includes("breakthrough")) breakthroughCount++;
    if (flags.includes("needs-parent-fyi")) parentFyiCount++;

    const note: string = (r.parentVisibleNote as string) || "";
    if (note.trim().length > 0) {
      parentVisibleNotes.push({ date: r.date as string, text: note.trim() });
    }
  }

  return {
    studentName: student.studentName,
    programTrack: PROGRAM_TRACK_LABELS[student.programTrack] || student.programTrack,
    weekNumber,
    presentCount,
    absentCount,
    lateCount,
    daysExpected,
    parentVisibleNotes,
    breakthroughCount,
    parentFyiCount,
    newReport,
  };
}

// ─── Cloud Function ───

export const sendWeeklyDigest = onSchedule(
  {
    schedule: "0 17 * * 5",
    timeZone: "America/New_York",
    region: "us-east1",
  },
  async () => {
    const now = nowInET();
    const todayISO = toISO(now);

    if (todayISO < PROGRAM_START_ISO || todayISO > PROGRAM_END_ISO) {
      console.log(
        `[WeeklyDigest] ${todayISO} outside program window (${PROGRAM_START_ISO} – ${PROGRAM_END_ISO}); skipping.`
      );
      return;
    }
    void SHOWCASE_ISO;

    const window = computeWeekWindow(now);
    if (!window) {
      console.log("[WeeklyDigest] Could not compute week window; skipping.");
      return;
    }

    console.log(
      `[WeeklyDigest] Running for week ${window.weekNumber} (${window.weekStartISO}–${window.weekEndISO}).`
    );

    const students = await loadEnrolledStudents();
    if (students.length === 0) {
      console.log("[WeeklyDigest] No enrolled students; nothing to send.");
      return;
    }

    // Group by parentId so multi-student parents get one email.
    const byParent = new Map<string, EnrolledStudent[]>();
    for (const s of students) {
      const arr = byParent.get(s.parentId) ?? [];
      arr.push(s);
      byParent.set(s.parentId, arr);
    }

    for (const [parentId, parentStudents] of byParent) {
      const parent = parentStudents[0];

      const sections: WeeklyDigestStudentSection[] = [];
      const studentIds: string[] = [];
      for (const s of parentStudents) {
        const [records, newReport] = await Promise.all([
          loadWeekAttendance(s.studentId, window.weekStartISO, window.weekEndISO),
          loadNewReportThisWeek(s.studentId, window.weekStartISO, window.weekEndISO),
        ]);
        sections.push(
          buildSection(s, window.weekNumber, window.daysExpected, records, newReport)
        );
        studentIds.push(s.studentId);
      }

      const template = weeklyDigestTemplate({
        parentName: parent.parentName || "there",
        weekNumber: window.weekNumber,
        weekRangeLabel: window.rangeLabel,
        students: sections,
      });

      const result = await sendEmailWithResult({
        to: parent.parentEmail,
        subject: template.subject,
        htmlBody: template.html,
      });

      await logEmail(parent.parentEmail, template.subject, "weekly_digest", result.ok, {
        bodyHtmlPreview: template.html,
        messageId: result.messageId,
        error: result.error,
        meta: {
          parentId,
          studentIds,
          weekNumber: window.weekNumber,
          weekStartISO: window.weekStartISO,
          weekEndISO: window.weekEndISO,
        },
      });

      console.log(
        `[WeeklyDigest] Parent ${parentId} (${parent.parentEmail}) — ok=${result.ok} students=${studentIds.length}`
      );
    }

    console.log("[WeeklyDigest] Complete.");
  }
);
