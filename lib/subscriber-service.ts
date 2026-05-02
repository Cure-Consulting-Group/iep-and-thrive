/**
 * Admin-only fetcher for the /admin/subscribers view.
 *
 * Reads all users/{uid} where users/{uid}.subscription exists (any status)
 * and joins each parent with their bookings to compute a recent no-show
 * count. The webhook is the only writer of users/{uid}.subscription —
 * this fetcher never mutates anything.
 *
 * See lib/subscription.ts for the SubscriptionState contract.
 */

import { collection, getDocs, query, where, Timestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { SubscriptionState, SubscriptionStatus } from '@/lib/subscription'

export interface SubscriberRow {
  uid: string
  parentName: string
  parentEmail: string
  isTest: boolean
  subscription: SubscriptionState
  /** Count of bookings with status='no_show' in the last 90 days. */
  recentNoShows: number
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

/** Fetch every parent with a subscription field and join recent-no-shows. */
export async function getAllSubscribers(): Promise<SubscriberRow[]> {
  const usersSnap = await getDocs(collection(db, 'users'))
  const rows: SubscriberRow[] = []

  // Build a lookup of recent no-show counts: parentId -> count
  // We do this in a single bookings query and group client-side rather
  // than per-parent N+1 queries.
  const ninetyDaysAgo = new Date()
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
  const cutoff = ninetyDaysAgo.toISOString().split('T')[0] // YYYY-MM-DD

  const noShowQ = query(
    collection(db, 'bookings'),
    where('status', '==', 'no_show'),
    where('date', '>=', cutoff)
  )
  const noShowSnap = await getDocs(noShowQ)
  const noShowsByParent = new Map<string, number>()
  for (const d of noShowSnap.docs) {
    const parentId = (d.data().parentId as string | undefined) || ''
    if (!parentId) continue
    noShowsByParent.set(parentId, (noShowsByParent.get(parentId) || 0) + 1)
  }

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
      recentNoShows: noShowsByParent.get(userDoc.id) || 0,
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
