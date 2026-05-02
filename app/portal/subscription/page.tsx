'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getBookingsByParent, type Booking } from '@/lib/booking-service'
import { getUserSubscription } from '@/lib/subscription-service'
import type { SubscriptionState } from '@/lib/subscription'
import SubscriptionStatusCard from '@/components/portal/SubscriptionStatusCard'
import SessionsTrackerCard from '@/components/portal/SessionsTrackerCard'

const STATUS_BADGE: Record<string, string> = {
  confirmed: 'bg-sage-pale text-forest',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-forest text-white',
  no_show: 'bg-amber-light text-amber',
}

export default function PortalSubscriptionPage() {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [sub, allBookings] = await Promise.all([
        getUserSubscription(user.uid),
        getBookingsByParent(user.uid),
      ])
      setSubscription(sub)
      setBookings(allBookings)
    } catch (err) {
      console.error('[/portal/subscription] load failed:', err)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    load()
  }, [load])

  // Recent tutoring sessions (last 5, most recent first)
  const recentTutoring = bookings
    .filter((b) => b.type === 'tutoring')
    .sort((a, b) => (b.date + b.startTime).localeCompare(a.date + a.startTime))
    .slice(0, 5)

  return (
    <div className="max-w-[720px] mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">
          Subscription
        </h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Manage your tutoring plan, sessions, and payment.
        </p>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : !subscription ? (
        <EmptyState />
      ) : (
        <>
          {subscription.status === 'past_due' && <PastDueBanner getIdToken={() => user!.getIdToken()} />}

          <div className="space-y-6">
            <SubscriptionStatusCard
              subscription={subscription}
              getIdToken={() => user!.getIdToken()}
            />
            <SessionsTrackerCard subscription={subscription} />
            <RecentSessionsCard sessions={recentTutoring} />
            <PolicyReminderCard />
          </div>
        </>
      )}
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-live="polite">
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white border border-border rounded-[20px] p-8 animate-pulse"
        >
          <div className="h-4 w-24 bg-cream-deep rounded mb-4" />
          <div className="h-10 w-2/3 bg-cream-deep rounded mb-3" />
          <div className="h-3 w-3/4 bg-cream-deep rounded mb-2" />
          <div className="h-3 w-1/2 bg-cream-deep rounded mb-2" />
          <div className="h-3 w-2/3 bg-cream-deep rounded mb-6" />
          <div className="h-12 w-56 bg-cream-deep rounded-full" />
        </div>
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div
      data-testid="subscription-empty-state"
      className="bg-white border border-border rounded-[20px] p-8 sm:p-10 text-center"
    >
      <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light mb-2">
        No active subscription
      </p>
      <h2 className="font-display text-2xl font-bold text-forest mb-3">
        No active tutoring subscription
      </h2>
      <p className="text-sm font-body text-text-muted mb-6 max-w-md mx-auto">
        Subscribe for steady weekly support, or book a single session whenever
        you need it.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link
          href="/tutoring#pricing"
          className="rounded-full bg-forest text-white px-6 py-3 text-sm font-semibold font-body hover:bg-forest-mid transition-colors"
        >
          See plans →
        </Link>
        <Link
          href="/book?type=drop-in"
          className="rounded-full border-2 border-forest text-forest px-6 py-2.5 text-sm font-semibold font-body hover:bg-forest hover:text-white transition-colors"
        >
          Book single session
        </Link>
      </div>
    </div>
  )
}

function PastDueBanner({
  getIdToken,
}: {
  getIdToken: () => Promise<string | null>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = async () => {
    setError(null)
    setLoading(true)
    try {
      const token = await getIdToken()
      const res = await fetch(
        // Imported indirectly to avoid yet another import line.
        `${(await import('@/lib/functions-config')).CLOUD_FUNCTIONS.customerPortal}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({}),
        }
      )
      if (!res.ok) throw new Error(`Portal request failed (${res.status})`)
      const data = (await res.json()) as { url?: string }
      if (!data.url) throw new Error('No portal URL returned')
      window.location.href = data.url
    } catch (err) {
      console.error('[PastDueBanner] portal error:', err)
      setError('Could not open customer portal. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="bg-amber-light border border-amber/30 rounded-2xl px-5 py-4 mb-6 flex items-start gap-3">
      <span className="text-xl shrink-0" aria-hidden="true">
        ⚠
      </span>
      <div className="flex-1 min-w-0">
        <p className="font-body font-semibold text-text">
          Your most recent payment failed.
        </p>
        <p className="text-sm font-body text-text-muted mt-0.5">
          Update payment to keep your subscription active.
        </p>
        {error ? (
          <p role="alert" className="mt-2 text-xs font-body text-red-600">
            {error}
          </p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="shrink-0 rounded-full bg-amber text-white px-4 py-2 text-sm font-semibold font-body hover:bg-amber/90 transition-colors disabled:opacity-60"
      >
        {loading ? 'Opening…' : 'Update payment →'}
      </button>
    </div>
  )
}

function RecentSessionsCard({ sessions }: { sessions: Booking[] }) {
  if (sessions.length === 0) {
    return (
      <div className="bg-white border border-border rounded-[20px] p-6 sm:p-8">
        <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light mb-3">
          Recent sessions
        </p>
        <p className="text-sm font-body text-text-muted">
          Your last 5 tutoring sessions will show here once you&apos;ve booked
          and completed any.
        </p>
      </div>
    )
  }

  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="bg-white border border-border rounded-[20px] p-6 sm:p-8">
      <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light mb-3">
        Recent sessions
      </p>
      <ul className="divide-y divide-border">
        {sessions.map((b) => {
          const status =
            b.status === 'confirmed' && b.date < today
              ? 'completed'
              : b.status === 'confirmed'
                ? 'upcoming'
                : b.status === 'no_show'
                  ? 'missed'
                  : b.status
          const badgeLabel =
            status === 'upcoming'
              ? 'Upcoming'
              : status === 'completed'
                ? 'Completed'
                : status === 'missed'
                  ? 'Missed'
                  : status === 'cancelled'
                    ? 'Cancelled'
                    : status
          const badgeClass = STATUS_BADGE[b.status] || 'bg-cream-deep text-text'
          return (
            <li
              key={b.id}
              className="flex items-center justify-between py-3 text-sm font-body"
            >
              <div className="min-w-0">
                <p className="text-text font-medium">
                  {formatBookingDate(b.date)} · {b.startTime}
                </p>
                <p className="text-xs text-text-muted">
                  {b.studentName || 'Student'}
                </p>
              </div>
              <span
                className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full ${badgeClass}`}
              >
                {badgeLabel}
              </span>
            </li>
          )
        })}
      </ul>
      <Link
        href="/portal/bookings"
        className="inline-block mt-4 text-sm font-body font-semibold text-forest hover:text-forest-mid transition-colors"
      >
        See all sessions →
      </Link>
    </div>
  )
}

function PolicyReminderCard() {
  return (
    <div className="bg-cream-deep border border-border rounded-[20px] p-6 sm:p-8">
      <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light mb-3">
        Subscription policies
      </p>
      <ul className="space-y-2 text-sm font-body text-text leading-relaxed">
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-forest-light">
            •
          </span>
          Sessions don&apos;t roll over to the next cycle.
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-forest-light">
            •
          </span>
          Cancel sessions ≥ 24 hours before for a credit.
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-forest-light">
            •
          </span>
          Same-day cancellations forfeit the session.
        </li>
        <li className="flex gap-2">
          <span aria-hidden="true" className="text-forest-light">
            •
          </span>
          Pause or cancel anytime in the customer portal.
        </li>
      </ul>
    </div>
  )
}

function formatBookingDate(date: string): string {
  const d = new Date(date + 'T00:00:00')
  if (isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}
