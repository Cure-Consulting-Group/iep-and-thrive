'use client'

import Link from 'next/link'
import { sessionsRemaining, type SubscriptionState } from '@/lib/subscription'
import SessionsCounter from '@/components/portal/SessionsCounter'
import { formatCycleDate } from '@/lib/subscription-service'

interface SessionsTrackerCardProps {
  subscription: SubscriptionState
}

export default function SessionsTrackerCard({
  subscription,
}: SessionsTrackerCardProps) {
  const remaining = sessionsRemaining(subscription)
  const total = subscription.sessionsAllowedPerCycle
  const used = subscription.sessionsUsedThisCycle
  const pct = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0
  const cycleEndLabel = formatCycleDate(subscription.currentPeriodEnd)

  return (
    <div className="bg-white border border-border rounded-[20px] p-6 sm:p-8">
      <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light mb-3">
        This billing cycle
      </p>

      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-display text-[2.4rem] leading-none font-bold text-forest">
          {remaining}
        </span>
        <span className="font-display text-xl text-text-muted">/ {total}</span>
      </div>
      <p className="text-sm font-body text-text-muted mb-4">sessions remaining</p>

      {/* Progress bar — sage-pale track, forest fill (filled = used) */}
      <div
        className="h-2 w-full rounded-full bg-sage-pale overflow-hidden mb-3"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={used}
        aria-label={`Sessions used: ${used} of ${total}`}
      >
        <div
          className="h-full bg-forest transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="text-xs font-body text-text-muted mb-5">
        Cycle ends {cycleEndLabel || '—'} · Sessions don&apos;t roll over
      </p>

      <div className="flex items-center gap-3">
        {/* Reuse the chip for screen-reader announcement consistency */}
        <SessionsCounter
          used={used}
          allowed={total}
          cycleEnd={subscription.currentPeriodEnd}
          status={subscription.status}
        />
      </div>

      <div className="mt-5">
        {remaining > 0 ? (
          <Link
            href="/book?type=tutoring"
            className="inline-flex rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold font-body hover:bg-forest-mid transition-colors"
          >
            Book your next session →
          </Link>
        ) : (
          <Link
            href="/book?type=drop-in"
            className="inline-flex rounded-full bg-amber text-white px-5 py-2.5 text-sm font-semibold font-body hover:bg-amber/90 transition-colors"
          >
            Book a drop-in session — $125
          </Link>
        )}
      </div>
    </div>
  )
}
