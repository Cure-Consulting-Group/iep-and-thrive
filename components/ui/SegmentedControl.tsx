'use client'

import { useRef, KeyboardEvent } from 'react'

/**
 * SegmentedControl — radiogroup pattern with arrow-key navigation.
 *
 * Used on /book to switch between booking types (Discovery call, Tutoring,
 * Drop-in). Default selection is whichever option matches `value`; consumer
 * controls state.
 *
 * A11y: implements WAI-ARIA radiogroup pattern.
 *   - role="radiogroup" on the wrapper
 *   - role="radio" on each segment, aria-checked, tabindex managed so only
 *     the active option is in the tab order
 *   - ArrowLeft/ArrowRight (and Up/Down) move selection AND focus
 */

export interface SegmentOption<V extends string = string> {
  value: V
  label: string
  /** Optional description rendered below the label (sm screens may hide). */
  description?: string
}

interface SegmentedControlProps<V extends string = string> {
  options: SegmentOption<V>[]
  value: V
  onChange: (value: V) => void
  /** Accessible name for the group (announced to screen readers). */
  ariaLabel: string
  className?: string
}

export default function SegmentedControl<V extends string = string>({
  options,
  value,
  onChange,
  ariaLabel,
  className = '',
}: SegmentedControlProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([])

  const focusIndex = (i: number) => {
    const idx = ((i % options.length) + options.length) % options.length
    refs.current[idx]?.focus()
    onChange(options[idx].value)
  }

  const handleKey = (idx: number) => (e: KeyboardEvent<HTMLButtonElement>) => {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault()
        focusIndex(idx + 1)
        break
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault()
        focusIndex(idx - 1)
        break
      case 'Home':
        e.preventDefault()
        focusIndex(0)
        break
      case 'End':
        e.preventDefault()
        focusIndex(options.length - 1)
        break
      default:
        break
    }
  }

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      className={`inline-flex items-center gap-1 rounded-full bg-white border border-border p-1 ${className}`}
    >
      {options.map((opt, idx) => {
        const checked = opt.value === value
        return (
          <button
            key={opt.value}
            ref={(el) => {
              refs.current[idx] = el
            }}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => onChange(opt.value)}
            onKeyDown={handleKey(idx)}
            className={`rounded-full px-4 py-2 text-sm font-body font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-forest-mid ${
              checked
                ? 'bg-forest text-white'
                : 'bg-transparent text-text-muted hover:text-forest hover:bg-sage/15'
            }`}
          >
            <span>{opt.label}</span>
            {opt.description ? (
              <span
                className={`ml-1.5 text-xs font-normal ${
                  checked ? 'text-white/70' : 'text-text-muted/70'
                } hidden sm:inline`}
              >
                {opt.description}
              </span>
            ) : null}
          </button>
        )
      })}
    </div>
  )
}
