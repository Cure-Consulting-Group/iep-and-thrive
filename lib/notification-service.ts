// Parent-facing notification ledger.
//
// Backed by `notifications/{id}` (top-level collection). Documents are written
// only by Cloud Functions (Admin SDK) — see `functions/src/attendance-notifications.ts`.
// Parents can read their own (rules-enforced) and may flip `read`/`readAt`.
//
// Doc shape:
//   parentId, studentId, studentName
//   kind: 'attendance-flag'      // extensible — add more kinds later
//   flag, flagDisplay            // attendance-flag specific
//   attendanceDocId              // source attendance/{id}
//   date                         // YYYY-MM-DD
//   parentVisibleNote
//   emailed, emailedAt, emailMessageId
//   read, readAt
//   createdAt
//
// The /portal page surfaces unread count via `getUnreadCount`. The dedicated
// /portal/notifications page lists & marks read.

import {
  collection,
  doc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  updateDoc,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'

export type NotificationKind = 'attendance-flag'

export interface NotificationDoc {
  id: string
  parentId: string
  studentId: string
  studentName: string
  kind: NotificationKind
  flag?: string
  flagDisplay?: string
  attendanceDocId?: string
  date?: string
  parentVisibleNote?: string
  emailed?: boolean
  emailedAt?: Timestamp | null
  emailMessageId?: string | null
  read: boolean
  readAt?: Timestamp | null
  createdAt?: Timestamp | null
}

const COLLECTION = 'notifications'

export async function getNotificationsForParent(
  parentId: string,
  max = 50
): Promise<NotificationDoc[]> {
  const q = query(
    collection(db, COLLECTION),
    where('parentId', '==', parentId),
    orderBy('createdAt', 'desc'),
    limit(max)
  )
  const snap = await getDocs(q)
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as NotificationDoc))
}

export async function getUnreadCount(parentId: string): Promise<number> {
  const q = query(
    collection(db, COLLECTION),
    where('parentId', '==', parentId),
    where('read', '==', false)
  )
  const snap = await getDocs(q)
  return snap.size
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, notificationId), {
    read: true,
    readAt: serverTimestamp(),
  })
}

export async function markAllRead(notifications: NotificationDoc[]): Promise<void> {
  const unread = notifications.filter((n) => !n.read)
  if (unread.length === 0) return

  // Batch — Firestore caps at 500 writes per batch; we won't hit that here.
  const batch = writeBatch(db)
  for (const n of unread) {
    batch.update(doc(db, COLLECTION, n.id), {
      read: true,
      readAt: serverTimestamp(),
    })
  }
  await batch.commit()
}
