/**
 * Client-side helpers for reading a parent's tutoring subscription state
 * from users/{uid}.subscription. The Stripe webhook is the authoritative
 * writer; this file only reads + decrements.
 *
 * Decrement is a single Firestore transaction shared with the booking write
 * (see app/book/page.tsx) so we never race past sessionsAllowedPerCycle.
 */

import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  increment,
  type Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { SubscriptionState } from '@/lib/subscription'

export async function getUserSubscription(
  uid: string
): Promise<SubscriptionState | null> {
  const ref = doc(db, 'users', uid)
  const snap = await getDoc(ref)
  if (!snap.exists()) return null
  const data = snap.data() as { subscription?: SubscriptionState }
  return data.subscription ?? null
}

export interface BookingSlotWrite {
  parentId: string
  parentName: string
  parentEmail: string
  studentName: string
  type: 'tutoring'
  slotId: string
  date: string
  startTime: string
  endTime: string
  notes: string
}

export class SubscriptionExhaustedError extends Error {
  constructor() {
    super(
      'No sessions remaining in this billing cycle. Resets at next renewal.'
    )
    this.name = 'SubscriptionExhaustedError'
  }
}

export class SubscriptionInactiveError extends Error {
  constructor(status: string) {
    super(`Cannot book — subscription status is "${status}".`)
    this.name = 'SubscriptionInactiveError'
  }
}

export class SlotUnavailableError extends Error {
  constructor() {
    super('That time slot is no longer available.')
    this.name = 'SlotUnavailableError'
  }
}

/**
 * Atomically:
 *   1. Read user subscription + slot
 *   2. Reject if subscription not active or sessions exhausted
 *   3. Reject if slot already booked
 *   4. Mark slot unavailable, create booking, increment sessionsUsedThisCycle
 *
 * Returns the new booking doc ID.
 */
export async function bookTutoringSessionWithCounterIncrement(
  booking: BookingSlotWrite
): Promise<string> {
  const userRef = doc(db, 'users', booking.parentId)
  const slotRef = doc(db, 'availableSlots', booking.slotId)
  // Pre-allocate a doc ref for the new booking so we can return its id.
  const bookingRef = doc(
    // collection(db, 'bookings') would also work, but doc() with no path
    // requires a CollectionReference — easiest to use the raw helper.
    // We use a plain path string and an auto-id placeholder.
    db,
    'bookings',
    crypto.randomUUID()
  )

  await runTransaction(db, async (tx) => {
    const userSnap = await tx.get(userRef)
    const slotSnap = await tx.get(slotRef)

    if (!slotSnap.exists()) throw new SlotUnavailableError()
    const slotData = slotSnap.data() as { isAvailable: boolean }
    if (!slotData.isAvailable) throw new SlotUnavailableError()

    if (!userSnap.exists()) throw new SubscriptionInactiveError('missing')
    const userData = userSnap.data() as { subscription?: SubscriptionState }
    const sub = userData.subscription
    if (!sub) throw new SubscriptionInactiveError('missing')
    if (sub.status !== 'active') throw new SubscriptionInactiveError(sub.status)
    if (sub.sessionsUsedThisCycle >= sub.sessionsAllowedPerCycle) {
      throw new SubscriptionExhaustedError()
    }

    tx.update(slotRef, {
      isAvailable: false,
      bookedBy: booking.parentId,
    })

    tx.set(bookingRef, {
      parentId: booking.parentId,
      parentName: booking.parentName,
      parentEmail: booking.parentEmail,
      studentName: booking.studentName,
      type: booking.type,
      slotId: booking.slotId,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: 'confirmed',
      googleCalendarEventId: '',
      notes: booking.notes,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    tx.update(userRef, {
      'subscription.sessionsUsedThisCycle': increment(1),
      'subscription.updatedAt': serverTimestamp(),
    })
  })

  return bookingRef.id
}

/**
 * Cancel a tutoring booking. If cancellation is ≥ 24h before the slot
 * start, decrement (refund) sessionsUsedThisCycle. Same-day cancellations
 * forfeit the session — slot is freed but the counter is NOT refunded.
 *
 * Returns whether the session counter was refunded.
 */
export async function cancelTutoringBooking(args: {
  bookingId: string
  slotId: string
  parentId: string
  /** Slot start timestamp ("YYYY-MM-DDTHH:mm"); used to determine 24h forfeit. */
  slotStart: string
}): Promise<{ refunded: boolean }> {
  const slotRef = doc(db, 'availableSlots', args.slotId)
  const bookingRef = doc(db, 'bookings', args.bookingId)
  const userRef = doc(db, 'users', args.parentId)

  const slotDate = new Date(`${args.slotStart}:00`)
  const now = new Date()
  const diffHours = (slotDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  const refund = diffHours >= 24

  await runTransaction(db, async (tx) => {
    tx.update(slotRef, { isAvailable: true, bookedBy: null })
    tx.update(bookingRef, {
      status: 'cancelled',
      updatedAt: serverTimestamp(),
    })
    if (refund) {
      tx.update(userRef, {
        'subscription.sessionsUsedThisCycle': increment(-1),
        'subscription.updatedAt': serverTimestamp(),
      })
    }
  })

  return { refunded: refund }
}

/** Format a Firestore Timestamp or ISO string as "Mon DD". */
export function formatCycleDate(value: Timestamp | string | undefined): string {
  if (!value) return ''
  let d: Date
  if (typeof value === 'string') d = new Date(value)
  else d = (value as Timestamp).toDate()
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
