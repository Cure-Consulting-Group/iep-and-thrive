// Client-side service for instructor admin checklists / tasks.
//
// Initially used for C2 — the per-week materials prep checklist
// (\`adminTasks/materials-prep-week-{n}\`). Designed to be reusable for
// future instructor checklist surfaces (showcase prep, end-of-week wrap, etc.)
// by keeping a generic \`AdminTaskDoc<T>\` shape and per-feature item types.
//
// Why a single collection: rules are simpler (one match block, admin-only),
// and the docs are tiny (a few dozen items per week). Doc IDs are
// deterministic strings so create-or-update is idempotent.
//
// The materials helper merges a freshly-parsed manifest with persisted
// per-item state (\`done\`, \`completedAt\`, \`completedBy\`). Items present in
// the parse but missing from the persisted doc are added; persisted items
// missing from the new parse are dropped (they reflect stale curriculum).

import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
  Timestamp,
  FieldValue,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type {
  MaterialsCategory,
  MaterialsItem,
  MaterialsManifest,
} from "@/lib/materials-types"

const COLLECTION = "adminTasks"

export function materialsDocId(weekNumber: number): string {
  return `materials-prep-week-${weekNumber}`
}

export interface MaterialsChecklistItem extends MaterialsItem {
  done: boolean
  completedAt?: Timestamp | FieldValue | null
  completedBy?: string | null
}

export interface MaterialsChecklistDoc {
  weekNumber: number
  items: MaterialsChecklistItem[]
  generatedAt: string
  parserVersion: number
  updatedAt?: Timestamp | FieldValue
}

export async function getMaterialsChecklist(weekNumber: number): Promise<MaterialsChecklistDoc | null> {
  const ref = doc(db, COLLECTION, materialsDocId(weekNumber))
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  return snap.data() as MaterialsChecklistDoc
}

// Merge a freshly-parsed manifest with the persisted doc — keeps done/completedAt
// for items whose id is unchanged and drops items the parser no longer sees.
export function mergeManifest(
  manifest: MaterialsManifest,
  persisted: MaterialsChecklistDoc | null
): MaterialsChecklistDoc {
  const persistedById: Record<string, MaterialsChecklistItem> = {}
  if (persisted) {
    for (const it of persisted.items) persistedById[it.id] = it
  }
  const items: MaterialsChecklistItem[] = manifest.items.map((it) => {
    const prev = persistedById[it.id]
    return {
      ...it,
      done: prev?.done ?? false,
      completedAt: prev?.completedAt ?? null,
      completedBy: prev?.completedBy ?? null,
    }
  })
  return {
    weekNumber: manifest.weekNumber,
    items,
    generatedAt: manifest.generatedAt,
    parserVersion: manifest.parserVersion,
  }
}

export async function saveMaterialsChecklist(
  doc_: MaterialsChecklistDoc
): Promise<void> {
  const ref = doc(db, COLLECTION, materialsDocId(doc_.weekNumber))
  await setDoc(
    ref,
    {
      ...doc_,
      updatedAt: serverTimestamp(),
    },
    { merge: false }
  )
}

export async function toggleMaterialsItem(
  weekNumber: number,
  itemId: string,
  next: boolean,
  userId: string
): Promise<MaterialsChecklistDoc> {
  const ref = doc(db, COLLECTION, materialsDocId(weekNumber))
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(`Checklist not found for week ${weekNumber}`)
  const data = snap.data() as MaterialsChecklistDoc
  const items = data.items.map((it) =>
    it.id === itemId
      ? {
          ...it,
          done: next,
          completedAt: next ? Timestamp.now() : null,
          completedBy: next ? userId : null,
        }
      : it
  )
  const updated: MaterialsChecklistDoc = { ...data, items }
  await updateDoc(ref, { items, updatedAt: serverTimestamp() })
  return updated
}

export async function setCategoryDone(
  weekNumber: number,
  category: MaterialsCategory,
  next: boolean,
  userId: string
): Promise<MaterialsChecklistDoc> {
  const ref = doc(db, COLLECTION, materialsDocId(weekNumber))
  const snap = await getDoc(ref)
  if (!snap.exists()) throw new Error(`Checklist not found for week ${weekNumber}`)
  const data = snap.data() as MaterialsChecklistDoc
  const items = data.items.map((it) =>
    it.category === category
      ? {
          ...it,
          done: next,
          completedAt: next ? Timestamp.now() : null,
          completedBy: next ? userId : null,
        }
      : it
  )
  await updateDoc(ref, { items, updatedAt: serverTimestamp() })
  return { ...data, items }
}
