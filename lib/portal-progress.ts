// Portal "this week's progress" data layer.
//
// Computes program-week context (Week N of 6) and pulls per-student weekly
// attendance, the latest parent-visible behavioral note, and the latest
// progress report. All attendance reads pass through `redactInstructorNotes`
// before returning to the parent UI: Firestore rules already gate by
// `parentId == auth.uid`, but parents must NEVER see the instructor-private
// `notes` field. Redacting at the app layer is defense-in-depth and the only
// way to prevent the field from reaching the rendered DOM.
//
// Program window: Tue Jul 7, 2026 — Sat Aug 15, 2026. Week N is computed from
// PROGRAM_START in 7-day buckets (Sun-anchored is awkward for a Tue start, so
// we anchor on the program start itself). Attendance is counted Mon–Fri for
// week-in-progress; the Aug 15 Sat showcase is only counted in the final week.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  where,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { AttendanceRecord } from '@/lib/attendance-service'
import type { ProgressReport } from '@/lib/report-service'

export const PROGRAM_START = new Date(2026, 6, 7) // Tue Jul 7, 2026
export const PROGRAM_END = new Date(2026, 7, 15)  // Sat Aug 15, 2026
export const PROGRAM_WEEKS = 6
export const SHOWCASE_DATE = '2026-08-15'

const ATTENDANCE_COLLECTION = 'attendance'
const REPORTS_COLLECTION = 'progressReports'

export type ParentAttendanceRecord = Omit<AttendanceRecord, 'notes'>

export interface ProgramWeekState {
  phase: 'pre' | 'active' | 'post'
  weekNumber: number       // 1..6 when active, 0 otherwise
  weekStartISO: string     // YYYY-MM-DD (Mon of current week, clipped to PROGRAM_START)
  weekEndISO: string       // YYYY-MM-DD (Fri of current week, or Sat for final week)
  daysExpected: number     // 5 for weeks 1-5, 6 for week 6 (incl. Sat showcase)
  daysUntilStart: number   // only meaningful when phase === 'pre'
}

function toISODate(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

function addDays(d: Date, n: number): Date {
  const next = new Date(d)
  next.setDate(next.getDate() + n)
  return next
}

// Find the Monday on or before a date. Sunday (0) maps to the previous Monday (-6).
function mondayOf(d: Date): Date {
  const dow = d.getDay()
  const offset = dow === 0 ? -6 : 1 - dow
  return addDays(d, offset)
}

export function computeProgramWeek(now: Date = new Date()): ProgramWeekState {
  const today = startOfDay(now)
  const start = startOfDay(PROGRAM_START)
  const end = startOfDay(PROGRAM_END)

  if (today < start) {
    const ms = start.getTime() - today.getTime()
    const daysUntil = Math.ceil(ms / (1000 * 60 * 60 * 24))
    return {
      phase: 'pre',
      weekNumber: 0,
      weekStartISO: toISODate(start),
      weekEndISO: toISODate(addDays(start, 4)),
      daysExpected: 5,
      daysUntilStart: daysUntil,
    }
  }

  if (today > end) {
    return {
      phase: 'post',
      weekNumber: 0,
      weekStartISO: toISODate(end),
      weekEndISO: toISODate(end),
      daysExpected: 0,
      daysUntilStart: 0,
    }
  }

  // Active. Compute week number from PROGRAM_START in 7-day buckets, but
  // surface the Mon–Fri window the parent expects (clip week 1 to Tue Jul 7).
  const daysSinceStart = Math.floor(
    (today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
  )
  const weekNumber = Math.min(PROGRAM_WEEKS, Math.floor(daysSinceStart / 7) + 1)

  const monday = weekNumber === 1 ? start : mondayOf(today)
  const friday = addDays(monday, 4)
  const isFinalWeek = weekNumber === PROGRAM_WEEKS

  return {
    phase: 'active',
    weekNumber,
    weekStartISO: toISODate(monday),
    weekEndISO: toISODate(isFinalWeek ? addDays(monday, 5) : friday),
    daysExpected: isFinalWeek ? 6 : 5,
    daysUntilStart: 0,
  }
}

function redactInstructorNotes(rec: AttendanceRecord): ParentAttendanceRecord {
  // Strip the instructor-private `notes` field before any parent-facing surface.
  const { notes: _omit, ...safe } = rec
  void _omit
  return safe as ParentAttendanceRecord
}

export async function getWeekAttendanceForStudent(
  studentId: string,
  weekStartISO: string,
  weekEndISO?: string
): Promise<ParentAttendanceRecord[]> {
  const start = new Date(weekStartISO + 'T00:00')
  const end = weekEndISO
    ? new Date(weekEndISO + 'T00:00')
    : addDays(start, 4)

  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('studentId', '==', studentId),
    where('date', '>=', toISODate(start)),
    where('date', '<=', toISODate(end)),
    orderBy('date', 'asc')
  )
  const snap = await getDocs(q)
  return snap.docs.map(
    (d) => redactInstructorNotes({ id: d.id, ...d.data() } as AttendanceRecord)
  )
}

export async function getLatestParentVisibleNote(
  studentId: string,
  withinDays = 7,
  now: Date = new Date()
): Promise<{ date: string; parentVisibleNote: string } | null> {
  const cutoff = addDays(startOfDay(now), -withinDays)
  const q = query(
    collection(db, ATTENDANCE_COLLECTION),
    where('studentId', '==', studentId),
    where('date', '>=', toISODate(cutoff)),
    orderBy('date', 'desc'),
    limit(20)
  )
  const snap = await getDocs(q)
  for (const d of snap.docs) {
    const data = d.data() as AttendanceRecord
    if (data.parentVisibleNote && data.parentVisibleNote.trim().length > 0) {
      return { date: data.date, parentVisibleNote: data.parentVisibleNote }
    }
  }
  return null
}

export async function getLatestReportForStudent(
  studentId: string
): Promise<ProgressReport | null> {
  const q = query(
    collection(db, REPORTS_COLLECTION),
    where('studentId', '==', studentId),
    orderBy('weekNumber', 'desc'),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as ProgressReport
}

export interface WeeklyStudentProgress {
  state: ProgramWeekState
  daysAttended: number
  daysExpected: number
  records: ParentAttendanceRecord[]
  latestNote: { date: string; parentVisibleNote: string } | null
  latestReport: ProgressReport | null
}

export async function getWeeklyProgressForStudent(
  studentId: string,
  now: Date = new Date()
): Promise<WeeklyStudentProgress> {
  const state = computeProgramWeek(now)
  const [records, latestNote, latestReport] = await Promise.all([
    state.phase === 'active'
      ? getWeekAttendanceForStudent(studentId, state.weekStartISO, state.weekEndISO)
      : Promise.resolve<ParentAttendanceRecord[]>([]),
    state.phase === 'active'
      ? getLatestParentVisibleNote(studentId, 7, now)
      : Promise.resolve(null),
    getLatestReportForStudent(studentId),
  ])

  const daysAttended = records.filter((r) => r.status === 'present').length

  return {
    state,
    daysAttended,
    daysExpected: state.daysExpected,
    records,
    latestNote,
    latestReport,
  }
}

// Single-doc read used when a parent visits a deep-linked attendance record.
// Same redaction guarantee.
export async function getRedactedAttendanceRecord(
  date: string,
  studentId: string
): Promise<ParentAttendanceRecord | null> {
  const id = `${date}_${studentId}`
  const ref = doc(db, ATTENDANCE_COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return redactInstructorNotes({ id: snap.id, ...snap.data() } as AttendanceRecord)
}
