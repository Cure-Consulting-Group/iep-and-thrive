'use client'

import { useEffect, useState } from 'react'
import { getEnrollmentCountdown, type CountdownState } from '@/lib/dates'

export type EnrollmentCountdownVariant = 'trust-row' | 'form-header'

interface Props {
  /**
   * Visual variant. 'trust-row' pairs with the cream hero / dark-on-light
   * surfaces; 'form-header' inverts onto the forest enrollment band.
   */
  variant: EnrollmentCountdownVariant
  className?: string
}

/**
 * Live 'X days until enrollment closes' countdown chip. Reads from the single
 * source of truth in lib/dates.ts so the hero, enrollment form, and any future
 * surfaces (drip emails, OG tags) stay in lockstep.
 *
 * Renders a placeholder on the server pass to avoid a hydration mismatch (the
 * calc depends on 'new Date()' at render time). Once mounted, it shows the open
 * copy until the deadline passes; afterward it swaps to 'Waitlist only.'
 */
export default function EnrollmentCountdown({ variant, className }: Props) {
  const [state, setState] = useState<CountdownState | null>(null)

  useEffect(() => {
    setState(getEnrollmentCountdown())
  }, [])

  if (!state) {
    // SSR / pre-hydration: render the deadline label only so the section's
    // height stays stable and the test selector still has something to find.
    return (
      <span
        data-testid='enrollment-countdown'
        data-status='loading'
        className={`${baseClasses(variant)} ${className ?? ''}`}
        aria-live='polite'
      >
        Enrollment deadline · May 30, 2026
      </span>
    )
  }

  return (
    <span
      data-testid='enrollment-countdown'
      data-status={state.status}
      data-days={state.days}
      className={`${baseClasses(variant)} ${className ?? ''}`}
      aria-live='polite'
    >
      <span
        aria-hidden='true'
        className={`inline-block h-1.5 w-1.5 rounded-full ${
          state.status === 'open' ? dotColor(variant) : 'bg-amber'
        }`}
      />
      {state.label}
    </span>
  )
}

function baseClasses(variant: EnrollmentCountdownVariant): string {
  // Pill, micro-label typography per CLAUDE.md design tokens. Uses the existing
  // tailwind theme color tokens so it inherits any future palette tweaks.
  if (variant === 'form-header') {
    return [
      'inline-flex',
      'items-center',
      'gap-2',
      'rounded-full',
      'bg-white/10',
      'border',
      'border-white/20',
      'px-3',
      'py-1.5',
      'text-[11px]',
      'font-semibold',
      'uppercase',
      'tracking-[0.08em]',
      'text-sage',
    ].join(' ')
  }
  return [
    'inline-flex',
    'items-center',
    'gap-2',
    'rounded-full',
    'bg-amber-light',
    'px-3',
    'py-1.5',
    'text-[11px]',
    'font-semibold',
    'uppercase',
    'tracking-[0.08em]',
    'text-forest',
  ].join(' ')
}

function dotColor(variant: EnrollmentCountdownVariant): string {
  return variant === 'form-header' ? 'bg-sage' : 'bg-amber'
}
