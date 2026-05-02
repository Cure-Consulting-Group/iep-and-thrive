'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { getAllSubscribers, coerceDate, type SubscriberRow } from '@/lib/subscriber-service'
import {
  tierLabel,
  sessionsRemaining,
  type SubscriptionStatus,
} from '@/lib/subscription'

const STATUS_LABELS: Record<SubscriptionStatus, string> = {
  active: 'Active',
  past_due: 'Past-due',
  paused: 'Paused',
  canceled: 'Cancelled',
  incomplete: 'Incomplete',
}

const STATUS_STYLES: Record<SubscriptionStatus, string> = {
  active: 'bg-green-100 text-green-700',
  past_due: 'bg-amber/20 text-amber',
  paused: 'bg-blue-100 text-blue-700',
  canceled: 'bg-gray-200 text-gray-700',
  incomplete: 'bg-gray-100 text-gray-600',
}

type FilterKey = 'all' | SubscriptionStatus

const FILTER_CHIPS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'past_due', label: 'Past-due' },
  { key: 'paused', label: 'Paused' },
  { key: 'canceled', label: 'Cancelled' },
]

export default function AdminSubscribersPage() {
  const [rows, setRows] = useState<SubscriberRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<FilterKey>('all')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await getAllSubscribers()
      setRows(data)
    } catch (err) {
      console.error('Failed to load subscribers:', err)
      setError('Failed to load subscribers. Check console for details.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const filtered = rows.filter((r) =>
    filter === 'all' ? true : r.subscription.status === filter
  )

  // Counts for the filter chip badges
  const counts: Record<FilterKey, number> = {
    all: rows.length,
    active: rows.filter((r) => r.subscription.status === 'active').length,
    past_due: rows.filter((r) => r.subscription.status === 'past_due').length,
    paused: rows.filter((r) => r.subscription.status === 'paused').length,
    canceled: rows.filter((r) => r.subscription.status === 'canceled').length,
    incomplete: rows.filter((r) => r.subscription.status === 'incomplete').length,
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">Subscribers</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          All families with an active or past tutoring subscription.
        </p>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
        {FILTER_CHIPS.map((chip) => (
          <button
            key={chip.key}
            onClick={() => setFilter(chip.key)}
            className={`px-4 py-2 rounded-full text-xs font-body font-semibold whitespace-nowrap transition-all ${
              filter === chip.key
                ? 'bg-forest text-white'
                : 'bg-sage/10 text-text-muted hover:bg-sage/20'
            }`}
          >
            {chip.label}
            <span
              className={`ml-1.5 inline-block px-1.5 rounded-full text-[10px] font-bold ${
                filter === chip.key ? 'bg-white/20' : 'bg-white/60 text-forest'
              }`}
            >
              {counts[chip.key]}
            </span>
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-body">
          {error}
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-border p-4 animate-pulse"
            >
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState hasAny={rows.length > 0} />
      ) : (
        <>
          <div className="hidden lg:grid grid-cols-12 px-5 py-2 text-[11px] font-body font-semibold uppercase tracking-wide text-text-muted">
            <div className="col-span-3">Parent</div>
            <div className="col-span-2">Tier</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Sessions</div>
            <div className="col-span-2">Cycle ends</div>
            <div className="col-span-1 text-right">No-shows</div>
          </div>
          <div className="space-y-2">
            {filtered.map((row) => (
              <SubscriberRowCard key={row.uid} row={row} />
            ))}
          </div>
          <p className="text-center text-xs text-text-muted font-body mt-4">
            Showing {filtered.length} of {rows.length} subscribers
          </p>
        </>
      )}
    </div>
  )
}

function SubscriberRowCard({ row }: { row: SubscriberRow }) {
  const { subscription: sub, parentName, parentEmail } = row
  const remaining = sessionsRemaining(sub)
  const cycleEnd = coerceDate(sub.currentPeriodEnd)
  const cycleEndLabel = cycleEnd
    ? cycleEnd.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '—'

  // Flag near-exhaustion (< 25% remaining) so founder eyeballs it
  const usedRatio = sub.sessionsAllowedPerCycle > 0
    ? sub.sessionsUsedThisCycle / sub.sessionsAllowedPerCycle
    : 0
  const sessionsTone =
    sub.status === 'active' && usedRatio >= 0.75 ? 'text-amber font-semibold' : 'text-text'

  // Link to the students page filtered to this parent's email
  const studentsHref = `/admin/students?search=${encodeURIComponent(parentEmail)}`

  return (
    <Link
      href={studentsHref}
      className="block bg-white rounded-xl border border-border hover:border-forest/40 hover:shadow-sm transition-all px-5 py-4"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Parent */}
        <div className="lg:col-span-3 min-w-0">
          <p className="font-body font-semibold text-text truncate flex items-center gap-2">
            {parentName || '(no name)'}
            {row.isTest && (
              <span className="text-[10px] font-body font-bold uppercase tracking-wide bg-amber-light text-amber px-1.5 py-0.5 rounded">
                test
              </span>
            )}
          </p>
          <p className="font-body text-xs text-text-muted truncate">{parentEmail}</p>
        </div>

        {/* Tier */}
        <div className="lg:col-span-2">
          <span className="lg:hidden text-[11px] uppercase tracking-wide text-text-muted mr-1">
            Tier:
          </span>
          <span className="font-body text-sm text-text">{tierLabel(sub.tier)}</span>
        </div>

        {/* Status badge */}
        <div className="lg:col-span-2">
          <span
            className={`inline-block px-2.5 py-1 rounded-full text-xs font-body font-semibold ${
              STATUS_STYLES[sub.status] || 'bg-gray-100 text-gray-700'
            }`}
          >
            {STATUS_LABELS[sub.status] || sub.status}
            {sub.cancelAtPeriodEnd && sub.status === 'active' && (
              <span className="ml-1 text-[10px] font-normal opacity-70">
                · ends at period
              </span>
            )}
          </span>
        </div>

        {/* Sessions counter */}
        <div className="lg:col-span-2">
          <span className="lg:hidden text-[11px] uppercase tracking-wide text-text-muted mr-1">
            Sessions:
          </span>
          <span className={`font-body text-sm ${sessionsTone}`}>
            {sub.sessionsUsedThisCycle} / {sub.sessionsAllowedPerCycle} used
          </span>
          {sub.status === 'active' && remaining === 0 && (
            <span className="ml-2 text-[10px] uppercase tracking-wide text-amber font-bold">
              exhausted
            </span>
          )}
        </div>

        {/* Cycle ends */}
        <div className="lg:col-span-2">
          <span className="lg:hidden text-[11px] uppercase tracking-wide text-text-muted mr-1">
            Cycle ends:
          </span>
          <span className="font-body text-sm text-text">{cycleEndLabel}</span>
        </div>

        {/* No-shows */}
        <div className="lg:col-span-1 lg:text-right">
          <span className="lg:hidden text-[11px] uppercase tracking-wide text-text-muted mr-1">
            No-shows:
          </span>
          {row.recentNoShows > 0 ? (
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-body font-semibold ${
                row.recentNoShows >= 2
                  ? 'bg-red-100 text-red-700'
                  : 'bg-amber/20 text-amber'
              }`}
              title="No-shows in the last 90 days"
            >
              {row.recentNoShows}
            </span>
          ) : (
            <span className="font-body text-xs text-text-muted">—</span>
          )}
        </div>
      </div>
    </Link>
  )
}

function EmptyState({ hasAny }: { hasAny: boolean }) {
  if (hasAny) {
    return (
      <div className="bg-white rounded-2xl border border-border p-12 text-center">
        <span className="text-3xl mb-2 block">🔍</span>
        <p className="text-text-muted font-body text-sm">
          No subscribers match the current filter.
        </p>
      </div>
    )
  }
  return (
    <div className="bg-white rounded-2xl border border-border p-12 text-center">
      <span className="text-4xl mb-4 block">💳</span>
      <h2 className="font-display text-lg font-semibold text-forest mb-2">
        No active subscribers yet
      </h2>
      <p className="text-text-muted font-body text-sm max-w-md mx-auto mb-5">
        When parents subscribe to weekly or twice-weekly tutoring, they&rsquo;ll
        show up here. Until then, you can preview the marketing surface to
        share with prospects.
      </p>
      <Link
        href="/tutoring"
        className="inline-flex items-center gap-2 rounded-full bg-forest text-white px-5 py-2.5 text-sm font-semibold font-body hover:bg-forest-mid transition-all"
      >
        Preview /tutoring page
        <span aria-hidden>→</span>
      </Link>
    </div>
  )
}
