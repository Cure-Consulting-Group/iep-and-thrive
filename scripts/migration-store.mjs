/**
 * Firestore adapter for the migration runner — TASK-LP-076.
 *
 * Kept separate from scripts/migrate.mjs so the decision logic in that file can
 * be unit-tested against a fake store without an emulator or credentials. This
 * file is the only part that touches Firestore, and it contains no decisions —
 * every "should this record change" judgment lives in the pure core.
 */

import { initializeApp, applicationDefault, getApps } from 'firebase-admin/app'
import { getFirestore, FieldValue } from 'firebase-admin/firestore'
import { CHECKPOINT_COLLECTION, QUARANTINE_COLLECTION } from './migrate.mjs'

export async function createFirestoreStore(projectId) {
  if (!projectId) throw new Error('createFirestoreStore requires an explicit projectId')
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not set')
  }
  if (!getApps().length) {
    initializeApp({ credential: applicationDefault(), projectId })
  }
  const db = getFirestore()

  return {
    async readCheckpoint(name) {
      const snap = await db.collection(CHECKPOINT_COLLECTION).doc(name).get()
      return snap.exists ? (snap.get('cursor') ?? null) : null
    },

    async writeCheckpoint(name, cursor) {
      await db.collection(CHECKPOINT_COLLECTION).doc(name).set(
        { cursor, updatedAt: FieldValue.serverTimestamp() },
        { merge: true },
      )
    },

    /**
     * Ordered by document id and seeked with startAfter, so a resumed run
     * continues from the checkpoint rather than re-reading from the top.
     * Ordering by id keeps the cursor stable even if documents are written
     * while the migration runs.
     */
    async readBatch(collection, cursor, size) {
      let q = db.collection(collection).orderBy('__name__').limit(size)
      if (cursor) q = q.startAfter(cursor)
      const snap = await q.get()
      return snap.docs.map((d) => ({ id: d.id, data: d.data() }))
    },

    /**
     * Quarantine stores a copy plus the reason. The source document is left
     * exactly as it was — a record we could not confidently interpret is not
     * one to start editing.
     */
    async quarantine(migrationName, items) {
      const batch = db.batch()
      for (const item of items) {
        const ref = db.collection(QUARANTINE_COLLECTION).doc(`${migrationName}__${item.id}`)
        batch.set(ref, {
          migration: migrationName,
          sourceId: item.id,
          reason: item.reason,
          snapshot: item.data,
          quarantinedAt: FieldValue.serverTimestamp(),
        })
      }
      await batch.commit()
    },

    async commit(collection, writes) {
      // Firestore caps a batch at 500 operations; the runner's default batch
      // size is well under that, but chunk anyway so a caller raising
      // --batch-size cannot silently exceed the limit.
      const CHUNK = 400
      for (let i = 0; i < writes.length; i += CHUNK) {
        const batch = db.batch()
        for (const w of writes.slice(i, i + CHUNK)) {
          batch.set(db.collection(collection).doc(w.id), w.data, { merge: true })
        }
        await batch.commit()
      }
    },
  }
}
