/**
 * Admin-only fetcher for the /admin/subscribers view.
 *
 * Reads all users/{uid} where users/{uid}.subscription exists (any status).
 * The webhook is the only writer of users/{uid}.subscription; this staff view
 * is retained for historical and in-flight billing support and never mutates.
 *
 * See lib/subscription.ts for the SubscriptionState contract.
 */

import { collection, getDocs, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { SubscriptionState, SubscriptionStatus } from '@/lib/subscription'

export interface SubscriberRow {
  uid: string
  parentName: string
  parentEmail: string
  isTest: boolean
  subscription: SubscriptionState
}

/**
 * Coerce Firestore Timestamp | string into a Date for safe display. Returns
 * null if the value is missing or unparseable.
 */
export function coerceDate(value: Timestamp | string | null | undefined): Date | null {
  if (!value) return null
  if (typeof value === 'string') {
    const d = new Date(value)
    return isNaN(d.getTime()) ? null : d
  }
  // Firestore Timestamp
  if (typeof (value as Timestamp).toDate === 'function') {
    return (value as Timestamp).toDate()
  }
  return null
}

/** Fetch every parent with a historical subscription field. */
export async function getAllSubscribers(): Promise<SubscriberRow[]> {
  const usersSnap = await getDocs(collection(db, 'users'))
  const rows: SubscriberRow[] = []

  for (const userDoc of usersSnap.docs) {
    const data = userDoc.data() as {
      email?: string | null
      displayName?: string | null
      isTest?: boolean
      subscription?: SubscriptionState
    }
    if (!data.subscription) continue

    rows.push({
      uid: userDoc.id,
      parentName: data.displayName || '',
      parentEmail: data.email || '',
      isTest: !!data.isTest,
      subscription: data.subscription,
    })
  }

  // Sort: active first, then past_due, then everything else, then by name
  const order: Record<SubscriptionStatus, number> = {
    active: 0,
    past_due: 1,
    paused: 2,
    canceled: 3,
    incomplete: 4,
  }
  rows.sort((a, b) => {
    const oa = order[a.subscription.status] ?? 99
    const ob = order[b.subscription.status] ?? 99
    if (oa !== ob) return oa - ob
    return a.parentName.localeCompare(b.parentName)
  })

  return rows
}
