'use client'

import { useState } from 'react'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'
import {
  TUTORING_PRICING,
  type SubscriptionState,
} from '@/lib/subscription'
import { formatCycleDate } from '@/lib/subscription-service'

interface SubscriptionStatusCardProps {
  subscription: SubscriptionState
  /** Returns a Firebase ID token for the customer-portal Cloud Function. */
  getIdToken: () => Promise<string | null>
}

const STATUS_LABEL: Record<SubscriptionState['status'], string> = {
  active: 'Active',
  past_due: 'Past due',
  paused: 'Paused',
  canceled: 'Cancelled',
  incomplete: 'Incomplete',
}

const STATUS_DOT: Record<SubscriptionState['status'], string> = {
  active: 'bg-forest-light',
  past_due: 'bg-amber',
  paused: 'bg-warm-gray',
  canceled: 'bg-warm-gray',
  incomplete: 'bg-amber',
}

export default function SubscriptionStatusCard({
  subscription,
  getIdToken,
}: SubscriptionStatusCardProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tier = subscription.tier
  const tierMeta =
    tier === 'weekly' ? TUTORING_PRICING.weekly : TUTORING_PRICING.twiceWeekly

  const openPortal = async () => {
    setError(null)
    setLoading(true)
    try {
      const token = await getIdToken()
      const res = await fetch(CLOUD_FUNCTIONS.customerPortal, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error(`Portal request failed (${res.status})`)
      const data = (await res.json()) as { url?: string }
      if (!data.url) throw new Error('No portal URL returned')
      window.location.href = data.url
    } catch (err) {
      console.error('[SubscriptionStatusCard] portal error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Could not open customer portal. Please try again.'
      )
      setLoading(false)
    }
  }

  return (
    <div className="bg-white border border-border rounded-[20px] p-6 sm:p-8">
      <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light mb-3">
        Active subscription
      </p>
      <h3 className="font-display text-2xl font-bold text-forest mb-4">
        {tierMeta.title} · {tierMeta.label}
        <span className="text-base font-body font-normal text-text-muted">
          {' '}
          {tierMeta.unit}
        </span>
      </h3>

      <dl className="space-y-2 mb-6">
        <Row label="Status">
          <span className="inline-flex items-center gap-2">
            <span
              aria-hidden="true"
              className={`block w-2 h-2 rounded-full ${
                STATUS_DOT[subscription.status]
              }`}
            />
            <span className="font-medium">
              {STATUS_LABEL[subscription.status]}
              {subscription.cancelAtPeriodEnd ? ' (ends at period end)' : ''}
            </span>
          </span>
        </Row>
        <Row
          label={
            subscription.status === 'canceled' && subscription.cancelAtPeriodEnd
              ? 'Ends'
              : 'Renews'
          }
        >
          {formatCycleDate(subscription.currentPeriodEnd) || '—'}
        </Row>
        <Row label="Charge">{tierMeta.label}</Row>
      </dl>

      <button
        type="button"
        onClick={openPortal}
        disabled={loading}
        className="rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold font-body hover:bg-forest-mid transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Opening…' : 'Manage subscription in customer portal →'}
      </button>
      {error ? (
        <p role="alert" className="mt-3 text-xs font-body text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  )
}

function Row({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between text-sm font-body">
      <dt className="text-text-muted">{label}</dt>
      <dd className="text-text font-medium">{children}</dd>
    </div>
  )
}
