// Attendance + behavioral flag capture for Cohort 1.
// Schema: flat collection `attendance/{attendanceId}` keyed by `${date}_${studentId}`
// Why flat (not /attendance/{date}/students/{sid}): Firestore subcollection rules are
// awkward to query for "all attendance for this student over date range". Flat keyed
// docs let us run simple equality queries on `studentId` or `date` and use a single
// index. Doc IDs are deterministic (`YYYY-MM-DD_studentId`) so create-or-update is
// idempotent without a fetch-first roundtrip.
//
// Privacy: parents see attendance for their own student only (via `parentId == auth.uid`
// in firestore.rules). Instructor private notes (`notes`) are stored in the same doc;
// parents are blocked at the rules layer from reading docs where they aren't the
// parentId. We rely on app-layer filtering in the parent-facing UI to surface only
// `parentVisibleNote`. Rules also block non-admins from reading the `notes` field via
// rules — see firestore.rules block at `match /attendance/{id}`.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  setDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type AttendanceStatus = 'present' | 'absent' | 'early-dismissal' | 'late-arrival'

export type BehavioralFlag =
  | 'regulated'
  | 'escalated'
  | 'breakthrough'
  | 'needs-parent-fyi'
  | 'illness'
  | 'injury'

export const FLAG_LABELS: Record<BehavioralFlag, { label: string; emoji: string; tone: 'good' | 'warn' | 'alert' | 'info' }> = {
  regulated: { label: 'Regulated', emoji: '🟢', tone: 'good' },
  breakthrough: { label: 'Breakthrough', emoji: '⭐', tone: 'good' },
  escalated: { label: 'Escalated', emoji: '🔴', tone: 'alert' },
  'needs-parent-fyi': { label: 'Parent FYI', emoji: '📣', tone: 'warn' },
  illness: { label: 'Illness', emoji: '🤒', tone: 'warn' },
  injury: { label: 'Injury', emoji: '🩹', tone: 'alert' },
}

export const STATUS_OPTIONS: { value: AttendanceStatus; label: string; emoji: string }[] = [
  { value: 'present',         label: 'Present',         emoji: '✓' },
  { value: 'absent',          label: 'Absent',          emoji: '✕' },
  { value: 'late-arrival',    label: 'Late arrival',    emoji: '⏰' },
  { value: 'early-dismissal', label: 'Early dismissal', emoji: '🚪' },
]

export interface AttendanceRecord {
  id: string                       // `${date}_${studentId}`
  studentId: string
  studentName: string              // denormalized
  parentId: string
  date: string                     // YYYY-MM-DD
  status: AttendanceStatus
  arrivalTime: string              // HH:mm or ''
  departureTime: string            // HH:mm or ''
  flags: BehavioralFlag[]
  notes: string                    // instructor private — NOT shown to parents
  parentVisibleNote: string        // shown to parents
  createdBy: string
  createdAt: Timestamp | FieldValue
  updatedAt: Timestamp | FieldValue
}

const COLLECTION = 'attendance'

export function buildAttendanceId(date: string, studentId: string): string {
  return `${date}_${studentId}`
}

export async function getAttendanceForDate(date: string): Promise<AttendanceRecord[]> {
  const q = query(collection(db, COLLECTION), where('date', '==', date), orderBy('studentName'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord))
}

export async function getAttendanceForStudent(studentId: string): Promise<AttendanceRecord[]> {
  const q = query(collection(db, COLLECTION), where('studentId', '==', studentId), orderBy('date', 'desc'))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AttendanceRecord))
}

export async function getAttendanceRecord(date: string, studentId: string): Promise<AttendanceRecord | null> {
  const id = buildAttendanceId(date, studentId)
  const ref = doc(db, COLLECTION, id)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as AttendanceRecord
}

export interface UpsertAttendanceInput {
  date: string
  studentId: string
  studentName: string
  parentId: string
  status?: AttendanceStatus
  arrivalTime?: string
  departureTime?: string
  flags?: BehavioralFlag[]
  notes?: string
  parentVisibleNote?: string
  createdBy: string
}

export async function upsertAttendance(input: UpsertAttendanceInput): Promise<AttendanceRecord> {
  const id = buildAttendanceId(input.date, input.studentId)
  const ref = doc(db, COLLECTION, id)
  const existing = await getDoc(ref)

  const base = {
    studentId: input.studentId,
    studentName: input.studentName,
    parentId: input.parentId,
    date: input.date,
    status: input.status ?? (existing.data()?.status ?? 'present'),
    arrivalTime: input.arrivalTime ?? (existing.data()?.arrivalTime ?? ''),
    departureTime: input.departureTime ?? (existing.data()?.departureTime ?? ''),
    flags: input.flags ?? (existing.data()?.flags ?? []),
    notes: input.notes ?? (existing.data()?.notes ?? ''),
    parentVisibleNote: input.parentVisibleNote ?? (existing.data()?.parentVisibleNote ?? ''),
    createdBy: existing.data()?.createdBy ?? input.createdBy,
    createdAt: existing.data()?.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  }

  await setDoc(ref, base, { merge: true })

  return {
    id,
    ...base,
  } as AttendanceRecord
}

export async function toggleFlag(
  date: string,
  studentId: string,
  studentName: string,
  parentId: string,
  flag: BehavioralFlag,
  createdBy: string
): Promise<BehavioralFlag[]> {
  const existing = await getAttendanceRecord(date, studentId)
  const current = existing?.flags ?? []
  const next = current.includes(flag) ? current.filter((f) => f !== flag) : [...current, flag]
  await upsertAttendance({
    date,
    studentId,
    studentName,
    parentId,
    flags: next,
    createdBy,
  })
  return next
}
