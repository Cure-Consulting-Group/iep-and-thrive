'use client'

import type { Timestamp } from 'firebase/firestore'
import type { SubscriptionStatus } from '@/lib/subscription'

/**
 * SessionsCounter — chip showing X of Y sessions remaining.
 *
 * Two visual variants:
 *   - remaining > 0 → forest dot · --forest text · --sage-pale bg
 *   - remaining === 0 → amber dot · --amber text · --amber-light bg
 *
 * A11y: role="status" aria-live="polite" so the chip announces decrements
 * after a booking is confirmed.
 */

interface SessionsCounterProps {
  used: number
  allowed: number
  cycleEnd: Timestamp | string
  /** Optional sub status — currently only used for downstream consumers. */
  status?: SubscriptionStatus
  className?: string
}

function formatCycleEnd(cycleEnd: Timestamp | string): string {
  let d: Date
  if (typeof cycleEnd === 'string') {
    d = new Date(cycleEnd)
  } else if (cycleEnd && typeof (cycleEnd as Timestamp).toDate === 'function') {
    d = (cycleEnd as Timestamp).toDate()
  } else {
    return ''
  }
  if (isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export default function SessionsCounter({
  used,
  allowed,
  cycleEnd,
  className = '',
}: SessionsCounterProps) {
  const remaining = Math.max(0, allowed - used)
  const exhausted = remaining === 0
  const cycleLabel = formatCycleEnd(cycleEnd)

  // Use forest variant when remaining > 0; amber when exhausted.
  const colorClasses = exhausted
    ? 'bg-amber-light text-amber'
    : 'bg-sage-pale text-forest'
  const dotClasses = exhausted ? 'bg-amber' : 'bg-forest-light'

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="sessions-counter"
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-body font-semibold ${colorClasses} ${className}`}
    >
      <span
        aria-hidden="true"
        className={`block w-2 h-2 rounded-full ${dotClasses}`}
      />
      <span>
        {remaining} of {allowed} sessions remaining
        {cycleLabel ? <span className="font-normal opacity-80"> · Resets {cycleLabel}</span> : null}
      </span>
    </div>
  )
}
