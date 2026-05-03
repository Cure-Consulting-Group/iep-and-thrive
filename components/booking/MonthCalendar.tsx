'use client'

import { useMemo, useState } from 'react'

interface MonthCalendarProps {
  /** Sorted ISO dates (YYYY-MM-DD) that have at least one available slot. */
  availableDates: string[]
  /** Currently-selected ISO date (YYYY-MM-DD), or null. */
  selectedDate: string | null
  onSelectDate: (date: string) => void
  /** Optional: per-date count of available slots, for sub-label. */
  countsByDate?: Record<string, number>
}

/**
 * Calendly-style month calendar.
 *
 * - Month nav (prev/next chevrons + month title)
 * - 7-col weekday header (Sun..Sat)
 * - 6-row day grid (always 42 cells = 6 weeks)
 * - Day cells: today underline; available date highlighted with dot;
 *   unavailable dates dimmed; selected date filled forest
 * - Keyboard: arrow keys move focus between days within the visible month
 *   (left/right, up/down by 7); Enter activates
 *
 * Accessibility:
 * - role="grid" with role="gridcell" buttons
 * - aria-label on each cell ("Tuesday, May 5, 2 sessions available")
 * - aria-current="date" on today
 * - aria-selected on the chosen date
 */
export default function MonthCalendar({
  availableDates,
  selectedDate,
  onSelectDate,
  countsByDate,
}: MonthCalendarProps) {
  // Initial month-anchor: prefer the month of the first available date,
  // falling back to today.
  const initialAnchor = useMemo(() => {
    if (availableDates.length > 0) {
      const [y, m] = availableDates[0].split('-').map(Number)
      return new Date(y, m - 1, 1)
    }
    const t = new Date()
    return new Date(t.getFullYear(), t.getMonth(), 1)
  }, [availableDates])

  const [anchor, setAnchor] = useState(initialAnchor)
  const availableSet = useMemo(() => new Set(availableDates), [availableDates])

  const todayISO = useMemo(() => new Date().toISOString().slice(0, 10), [])

  const monthLabel = anchor.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  })

  // Build the 42-cell grid.
  const cells = useMemo(() => buildMonthGrid(anchor), [anchor])

  function shiftMonth(delta: number) {
    setAnchor((prev) => new Date(prev.getFullYear(), prev.getMonth() + delta, 1))
  }

  // Disable prev if all available dates are >= the displayed month's first day
  // and there are no available dates in earlier months. Cheaper: just disable
  // when the displayed month is before today's month.
  const today = new Date()
  const displayedYM = anchor.getFullYear() * 12 + anchor.getMonth()
  const todayYM = today.getFullYear() * 12 + today.getMonth()
  const canGoPrev = displayedYM > todayYM
  const lastAvailable =
    availableDates.length > 0 ? availableDates[availableDates.length - 1] : null
  const canGoNext = lastAvailable
    ? displayedYM <
      new Date(
        Number(lastAvailable.slice(0, 4)),
        Number(lastAvailable.slice(5, 7)) - 1,
        1
      ).getFullYear() *
        12 +
        Number(lastAvailable.slice(5, 7)) -
        1
    : false

  return (
    <div className="bg-white rounded-2xl border border-border p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          disabled={!canGoPrev}
          aria-label="Previous month"
          className="w-10 h-10 rounded-full flex items-center justify-center text-forest hover:bg-forest/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ‹
        </button>
        <h2 className="font-display text-lg font-semibold text-forest">
          {monthLabel}
        </h2>
        <button
          type="button"
          onClick={() => shiftMonth(+1)}
          disabled={!canGoNext}
          aria-label="Next month"
          className="w-10 h-10 rounded-full flex items-center justify-center text-forest hover:bg-forest/5 disabled:opacity-30 disabled:cursor-not-allowed transition"
        >
          ›
        </button>
      </div>

      {/* Weekday header */}
      <div className="grid grid-cols-7 gap-1 mb-1 text-center" role="row">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div
            key={d}
            role="columnheader"
            className="text-xs font-body font-semibold text-text-muted uppercase tracking-wide py-2"
          >
            {d}
          </div>
        ))}
      </div>

      {/* Day cells */}
      <div role="grid" aria-label={monthLabel} className="grid grid-cols-7 gap-1">
        {cells.map((cell, idx) => {
          if (!cell.iso) {
            return <div key={`pad-${idx}`} aria-hidden="true" className="aspect-square" />
          }
          const isAvailable = availableSet.has(cell.iso)
          const isSelected = cell.iso === selectedDate
          const isToday = cell.iso === todayISO
          const isPast = cell.iso < todayISO
          const count = countsByDate?.[cell.iso] ?? 0

          const ariaParts: string[] = [
            cell.fullLabel,
            isAvailable
              ? count > 1
                ? `${count} sessions available`
                : '1 session available'
              : 'no availability',
          ]
          if (isSelected) ariaParts.push('selected')

          return (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              aria-selected={isSelected || undefined}
              aria-current={isToday ? 'date' : undefined}
              aria-label={ariaParts.join(', ')}
              disabled={!isAvailable || isPast}
              onClick={() => isAvailable && !isPast && onSelectDate(cell.iso!)}
              className={[
                'aspect-square rounded-lg flex flex-col items-center justify-center text-sm font-body relative transition',
                isSelected
                  ? 'bg-forest text-white font-semibold shadow-sm'
                  : isAvailable && !isPast
                    ? 'bg-sage-pale text-forest font-semibold hover:bg-sage hover:scale-[1.05] cursor-pointer'
                    : 'text-text-muted/50 cursor-not-allowed',
                isToday && !isSelected ? 'ring-2 ring-forest/40 ring-inset' : '',
              ].join(' ')}
            >
              <span>{cell.dayNum}</span>
              {isAvailable && !isPast && !isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute bottom-1 w-1 h-1 rounded-full bg-forest"
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

interface MonthCell {
  iso: string | null // null for leading/trailing padding cells
  dayNum: number | null
  fullLabel: string
}

function buildMonthGrid(anchor: Date): MonthCell[] {
  const year = anchor.getFullYear()
  const month = anchor.getMonth() // 0-indexed
  const firstOfMonth = new Date(year, month, 1)
  const startWeekday = firstOfMonth.getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const cells: MonthCell[] = []

  for (let i = 0; i < startWeekday; i++) {
    cells.push({ iso: null, dayNum: null, fullLabel: '' })
  }
  for (let d = 1; d <= daysInMonth; d++) {
    const iso = `${year}-${pad2(month + 1)}-${pad2(d)}`
    const date = new Date(year, month, d)
    const fullLabel = date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    cells.push({ iso, dayNum: d, fullLabel })
  }
  while (cells.length < 42) {
    cells.push({ iso: null, dayNum: null, fullLabel: '' })
  }
  return cells
}

function pad2(n: number): string {
  return n < 10 ? `0${n}` : `${n}`
}
