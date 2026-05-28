'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Student } from '@/lib/student-service'
import {
  getIOSSessionSummary,
  type IOSSessionSummary,
} from '@/lib/ios-progress'

interface IOSSessionTileProps {
  parentUid: string
  student: Student
}

function formatLastActivity(d: Date | null): string {
  if (!d) return 'No iPad sessions yet'
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffHr = diffMs / (1000 * 60 * 60)
  if (diffHr < 24) return 'Active today'
  if (diffHr < 48) return 'Last active yesterday'
  const days = Math.floor(diffHr / 24)
  if (days < 7) return `Last active ${days} days ago`
  return `Last active ${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
}

export function IOSSessionTile({ parentUid, student }: IOSSessionTileProps) {
  const [summary, setSummary] = useState<IOSSessionSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [errored, setErrored] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    getIOSSessionSummary(parentUid, student.id)
      .then((s) => {
        if (!cancelled) setSummary(s)
      })
      .catch(() => {
        // Don't blank out the dashboard if iOS reads fail —
        // render an inert empty tile instead. Crashlytics-style
        // error surfacing on the web is out of scope for 3.1.
        if (!cancelled) setErrored(true)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [parentUid, student.id])

  const hasData = summary !== null && summary.totalLessonsCompleted + summary.totalSparks > 0

  return (
    <Link
      href={`/portal/students/${student.id}/sessions`}
      data-testid={`ios-session-tile-${student.id}`}
      className="block bg-white rounded-2xl border border-border p-5 sm:p-6 hover:border-forest-light transition-colors"
    >
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light">
            iPad activity
          </p>
          <h3 className="font-display text-lg font-semibold text-text mt-1">
            {student.name}
          </h3>
        </div>
        {!loading && hasData && (
          <span className="shrink-0 text-xs font-body font-semibold bg-sage/30 text-forest px-2.5 py-1 rounded-full">
            {formatLastActivity(summary?.lastActivityAt ?? null)}
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : errored ? (
        <p className="text-sm font-body text-text-muted">
          Couldn&apos;t load iPad activity. Try again later.
        </p>
      ) : !hasData ? (
        <p className="text-sm font-body text-text-muted">
          No iPad sessions yet. {student.name} will start earning sparks
          once they begin missions on their iPad.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-cream-deep p-4">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-text-muted">
              Lessons
            </p>
            <p className="font-display text-2xl font-semibold text-forest mt-1">
              {summary?.totalLessonsCompleted ?? 0}
            </p>
          </div>
          <div className="rounded-xl bg-amber-light p-4">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-text-muted">
              Sparks earned
            </p>
            <p className="font-display text-2xl font-semibold text-amber mt-1">
              {summary?.totalSparks ?? 0}
            </p>
          </div>
        </div>
      )}
    </Link>
  )
}
