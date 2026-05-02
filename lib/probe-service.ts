// Weekly Orton-Gillingham probe data capture (C4).
//
// Schema: flat collection `probeResults/{id}` keyed by
// `week{n}_{type}_{studentId}` so a single probe per student per week per
// type is idempotently upsertable. We avoid using subcollections under the
// student because the most common query is "all probes for week N" (batch
// entry view) which is awkward against a deep tree.
//
// Why these fields specifically:
//   - score: percent accuracy for phonics, words-per-minute for ORF.
//   - errorCount + errorTypes: the CSE-ready final report needs error
//     pattern data, not just totals. errorTypes is a free-form array (e.g.
//     ["short-vowel", "digraph", "r-controlled"]) so we don't
//     prematurely lock the taxonomy.
//   - passageId: optional link to which ORF passage was used; lets future
//     tooling control passage rotation across weeks.
//   - notes: instructor private. Not surfaced to parents (rules read is
//     gated, but UI for parents will not render it).
//
// Designed so C6 (auto weekly report) and the parent portal probe-trend
// tile can both pull from this single source.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  setDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export type ProbeType = "phonics" | "orf"

export interface ProbeResult {
  id: string
  studentId: string
  studentName: string             // denormalized
  parentId: string
  week: number                    // 1..6
  type: ProbeType
  score: number                   // phonics: 0-100 (%); orf: words per minute
  errorCount?: number
  errorTypes?: string[]
  passageId?: string
  capturedAt: Timestamp | FieldValue
  capturedBy: string              // admin uid
  notes?: string
}

const COLLECTION = "probeResults"

export function buildProbeId(week: number, type: ProbeType, studentId: string): string {
  return `week${week}_${type}_${studentId}`
}

export interface UpsertProbeInput {
  week: number
  type: ProbeType
  studentId: string
  studentName: string
  parentId: string
  score: number
  errorCount?: number
  errorTypes?: string[]
  passageId?: string
  notes?: string
  capturedBy: string
}

export async function addProbeResult(input: UpsertProbeInput): Promise<ProbeResult> {
  const id = buildProbeId(input.week, input.type, input.studentId)
  const ref = doc(db, COLLECTION, id)
  const data: Omit<ProbeResult, "id"> = {
    studentId: input.studentId,
    studentName: input.studentName,
    parentId: input.parentId,
    week: input.week,
    type: input.type,
    score: input.score,
    errorCount: input.errorCount,
    errorTypes: input.errorTypes,
    passageId: input.passageId,
    notes: input.notes,
    capturedAt: serverTimestamp(),
    capturedBy: input.capturedBy,
  }
  // Strip undefined optional fields so Firestore doesn't try to write nulls.
  const clean: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(data)) if (v !== undefined) clean[k] = v
  await setDoc(ref, clean, { merge: true })
  return { id, ...data } as ProbeResult
}

export async function getProbesByStudent(studentId: string): Promise<ProbeResult[]> {
  const q = query(
    collection(db, COLLECTION),
    where("studentId", "==", studentId),
    orderBy("week", "asc")
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProbeResult))
}

export async function getProbesByWeek(weekNumber: number): Promise<ProbeResult[]> {
  const q = query(collection(db, COLLECTION), where("week", "==", weekNumber))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as ProbeResult))
}

export async function getLatestProbeForStudent(
  studentId: string,
  type: ProbeType
): Promise<ProbeResult | null> {
  const q = query(
    collection(db, COLLECTION),
    where("studentId", "==", studentId),
    where("type", "==", type),
    orderBy("week", "desc"),
    limit(1)
  )
  const snap = await getDocs(q)
  if (snap.empty) return null
  const d = snap.docs[0]
  return { id: d.id, ...d.data() } as ProbeResult
}

export async function getProbe(
  week: number,
  type: ProbeType,
  studentId: string
): Promise<ProbeResult | null> {
  const ref = doc(db, COLLECTION, buildProbeId(week, type, studentId))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as ProbeResult
}
