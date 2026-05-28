// Reads the iOS-generated session subcollections so the parent portal
// can surface per-mission lesson progress and sparks awards alongside
// the existing in-program tutoring data.
//
// Schema (written by the iOS app — Phase 1 → Phase 2.4):
//   users/{uid}/students/{studentId}/lessons/{uuid}
//     { id, levelIndex, category, isCompleted, lastAttemptAt, score }
//   users/{uid}/students/{studentId}/sparks/{uuid}
//     { id, amount, reason, earnedAt }
//
// Both subcollections are owned by the same parent UID and gated by the
// Firestore rules deployed for Phase 1. This module only reads them.

import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { z } from 'zod'

// ─── Types ───

export interface LessonProgressRecord {
  id: string
  levelIndex: number
  category: 'literacy' | 'math'
  isCompleted: boolean
  lastAttemptAt: Date
  score: number
}

export interface SparksRecordEntry {
  id: string
  amount: number
  reason: string
  earnedAt: Date
}

export interface IOSSessionSummary {
  totalLessonsCompleted: number
  totalSparks: number
  lastActivityAt: Date | null
}

// ─── Zod runtime validation ───
//
// Firestore can hand back Date | Timestamp | string depending on how the
// doc was written. iOS writes via setData(from: Codable) which encodes
// Date as Firestore Timestamp — but we accept the variations defensively
// so a malformed doc doesn't take down the parent dashboard.

const FirestoreDate = z
  .union([
    z.instanceof(Date),
    z.instanceof(Timestamp).transform((t) => t.toDate()),
    z.string().transform((s) => new Date(s)),
  ])
  .refine((d) => !isNaN(d.getTime()), { message: 'invalid date' })

const LessonProgressSchema = z.object({
  id: z.string(),
  levelIndex: z.number().int().nonnegative(),
  category: z.enum(['literacy', 'math']),
  isCompleted: z.boolean(),
  lastAttemptAt: FirestoreDate,
  score: z.number().int(),
})

const SparksRecordSchema = z.object({
  id: z.string(),
  amount: z.number().int(),
  reason: z.string(),
  earnedAt: FirestoreDate,
})

// ─── Queries ───

/**
 * Reads every lesson doc under the given student. Sorted descending by
 * lastAttemptAt so the most recent session is first. Malformed docs are
 * skipped (logged once via console.warn in dev) instead of throwing —
 * one bad doc shouldn't blank out the parent's dashboard.
 */
export async function getLessonsForStudent(
  uid: string,
  studentId: string
): Promise<LessonProgressRecord[]> {
  const lessonsRef = collection(
    db,
    'users',
    uid,
    'students',
    studentId,
    'lessons'
  )
  const snap = await getDocs(query(lessonsRef, orderBy('lastAttemptAt', 'desc')))
  return snap.docs
    .map((d) => {
      const parsed = LessonProgressSchema.safeParse(d.data())
      if (!parsed.success) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[ios-progress] skipping malformed lesson ${d.id}:`, parsed.error)
        }
        return null
      }
      return parsed.data
    })
    .filter((x): x is LessonProgressRecord => x !== null)
}

/** Same approach for sparks awards. */
export async function getSparksForStudent(
  uid: string,
  studentId: string
): Promise<SparksRecordEntry[]> {
  const sparksRef = collection(
    db,
    'users',
    uid,
    'students',
    studentId,
    'sparks'
  )
  const snap = await getDocs(query(sparksRef, orderBy('earnedAt', 'desc')))
  return snap.docs
    .map((d) => {
      const parsed = SparksRecordSchema.safeParse(d.data())
      if (!parsed.success) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`[ios-progress] skipping malformed spark ${d.id}:`, parsed.error)
        }
        return null
      }
      return parsed.data
    })
    .filter((x): x is SparksRecordEntry => x !== null)
}

/**
 * Lightweight summary used by the portal home tile. Returns zeros and
 * null lastActivity when the child hasn't started using the iPad yet —
 * NOT an error case, the very common day-zero state.
 */
export async function getIOSSessionSummary(
  uid: string,
  studentId: string
): Promise<IOSSessionSummary> {
  const [lessons, sparks] = await Promise.all([
    getLessonsForStudent(uid, studentId),
    getSparksForStudent(uid, studentId),
  ])

  const completed = lessons.filter((l) => l.isCompleted)
  const totalSparks = sparks.reduce((acc, s) => acc + s.amount, 0)

  // Last activity is the max timestamp across both collections — sparks
  // and lessons usually fire together, but a child could earn a spark
  // outside a mission complete (Phase 4 telemetry adds those).
  const lessonMax = lessons[0]?.lastAttemptAt ?? null
  const sparkMax = sparks[0]?.earnedAt ?? null
  const lastActivityAt =
    lessonMax && sparkMax
      ? lessonMax > sparkMax
        ? lessonMax
        : sparkMax
      : lessonMax ?? sparkMax

  return {
    totalLessonsCompleted: completed.length,
    totalSparks,
    lastActivityAt,
  }
}

// Exported for unit tests so the parsing layer can be exercised
// directly without a Firestore round-trip.
export const _schemas = { LessonProgressSchema, SparksRecordSchema }
