// Pre/post assessment battery digital capture (C5).
//
// Schema: assessmentResults/{id} keyed {type}_{studentId} so each student
// has at most one pre and one post doc. Subtests live as an array on the
// assessment doc because the comparison view always wants pre vs post
// in lockstep.
//
// instrument is intentionally free-text (e.g. WIST, CTOPP-2, TOWRE-2,
// or a custom informal battery). Founder may swap instruments mid-cohort
// or per-student; locking it to an enum costs more than it buys.
//
// Subtests carry raw / standard / percentile because that is what
// district CSE teams expect to see when the September meeting opens.

import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  setDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from "firebase/firestore"
import { db } from "@/lib/firebase"

export type AssessmentType = "pre" | "post"

export interface SubtestResult {
  name: string
  rawScore?: number
  standardScore?: number
  percentile?: number
  notes?: string
}

export interface AssessmentResult {
  id: string
  studentId: string
  studentName: string
  parentId: string
  instrument: string
  type: AssessmentType
  subtests: SubtestResult[]
  administeredAt: Timestamp | FieldValue
  administeredBy: string
  notes?: string
}

const COLLECTION = "assessmentResults"

export function buildAssessmentId(type: AssessmentType, studentId: string): string {
  return type + "_" + studentId
}

export interface UpsertAssessmentInput {
  type: AssessmentType
  studentId: string
  studentName: string
  parentId: string
  instrument: string
  subtests: SubtestResult[]
  administeredBy: string
  notes?: string
}

export async function upsertAssessment(input: UpsertAssessmentInput): Promise<AssessmentResult> {
  const id = buildAssessmentId(input.type, input.studentId)
  const ref = doc(db, COLLECTION, id)
  const cleanSubtests: SubtestResult[] = input.subtests.map((s) => {
    const o: SubtestResult = { name: s.name }
    if (s.rawScore !== undefined) o.rawScore = s.rawScore
    if (s.standardScore !== undefined) o.standardScore = s.standardScore
    if (s.percentile !== undefined) o.percentile = s.percentile
    if (s.notes !== undefined && s.notes !== "") o.notes = s.notes
    return o
  })
  const data = {
    studentId: input.studentId,
    studentName: input.studentName,
    parentId: input.parentId,
    instrument: input.instrument,
    type: input.type,
    subtests: cleanSubtests,
    administeredAt: serverTimestamp(),
    administeredBy: input.administeredBy,
    ...(input.notes ? { notes: input.notes } : {}),
  }
  await setDoc(ref, data, { merge: true })
  return { id, ...data } as AssessmentResult
}

export async function getAssessment(type: AssessmentType, studentId: string): Promise<AssessmentResult | null> {
  const ref = doc(db, COLLECTION, buildAssessmentId(type, studentId))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return { id: snap.id, ...snap.data() } as AssessmentResult
}

export async function getAssessmentsByStudent(studentId: string): Promise<AssessmentResult[]> {
  const q = query(collection(db, COLLECTION), where("studentId", "==", studentId))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AssessmentResult))
}

export async function getAssessmentsByType(type: AssessmentType): Promise<AssessmentResult[]> {
  const q = query(collection(db, COLLECTION), where("type", "==", type))
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AssessmentResult))
}
