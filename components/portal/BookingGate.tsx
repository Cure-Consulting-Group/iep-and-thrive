'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'
import type { BookingGateState } from '@/lib/subscription'

/**
 * BookingGate — centered card for anonymous, no-subscription, paused,
 * past-due, and canceled states. Active states (bookable / exhausted)
 * are rendered by SessionsCounter + the calendar in app/book/page.tsx.
 *
 * Each state has a unique <h3> for screen-reader landmarking.
 *
 * Card spec (per design §6 / §11):
 *   - centered, max-width 480px
 *   - white bg, 20px radius
 *   - padding 40px (24px on mobile)
 */

interface BookingGateProps {
  state: BookingGateState
  /** Optional Firebase ID token used to call customerPortal. Required for state E. */
  getIdToken?: () => Promise<string | null>
}

const DROP_IN_CHECKOUT_URL = `${CLOUD_FUNCTIONS.stripeCheckout}?product=drop-in`

export default function BookingGate({ state, getIdToken }: BookingGateProps) {
  // Branch by discriminated union — return one of the gate templates.
  switch (state.kind) {
    case 'anonymous':
      return (
        <GateCard testid="booking-gate-anonymous">
          <h3 className="font-display text-2xl font-bold text-forest mb-3">
            Sign in to book a tutoring session
          </h3>
          <p className="text-sm font-body text-text-muted mb-6 leading-relaxed">
            Already a subscriber? Sign in to see your booking calendar. New here?
            See plans starting at $115/session.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              href="/login?redirect=/book?type=tutoring"
              className="flex-1 rounded-full bg-forest text-white py-3 px-5 text-sm font-semibold font-body text-center transition-colors duration-200 hover:bg-forest-mid"
            >
              Sign in
            </Link>
            <Link
              href="/tutoring#pricing"
              className="flex-1 rounded-full border-2 border-forest text-forest py-2.5 px-5 text-sm font-semibold font-body text-center transition-colors duration-200 hover:bg-forest hover:text-white"
            >
              See plans →
            </Link>
          </div>
        </GateCard>
      )

    case 'no-subscription':
      return (
        <GateCard testid="booking-gate-no-subscription">
          <h3 className="font-display text-2xl font-bold text-forest mb-3">
            No active tutoring subscription
          </h3>
          <p className="text-sm font-body text-text-muted mb-6 leading-relaxed">
            You&apos;ll need an active subscription, or you can book a single session for $125.
          </p>
          <div className="flex flex-col gap-3">
            <Link
              href="/tutoring#pricing"
              className="rounded-full bg-forest text-white py-3 px-5 text-sm font-semibold font-body text-center transition-colors duration-200 hover:bg-forest-mid"
            >
              See subscription plans →
            </Link>
            <a
              href={DROP_IN_CHECKOUT_URL}
              className="rounded-full border-2 border-forest text-forest py-2.5 px-5 text-sm font-semibold font-body text-center transition-colors duration-200 hover:bg-forest hover:text-white"
            >
              Book a single session — $125
            </a>
          </div>
        </GateCard>
      )

    case 'paused':
    case 'past-due':
    case 'canceled': {
      const statusLabel =
        state.kind === 'paused'
          ? 'paused'
          : state.kind === 'past-due'
            ? 'past due'
            : 'canceled'
      return (
        <GateCard testid={`booking-gate-${state.kind}`}>
          <h3 className="font-display text-2xl font-bold text-forest mb-3">
            Your subscription is {statusLabel}
          </h3>
          <p className="text-sm font-body text-text-muted mb-6 leading-relaxed">
            Manage your subscription in the customer portal to resume booking.
          </p>
          <div className="flex flex-col gap-3">
            <CustomerPortalButton getIdToken={getIdToken} />
            <a
              href={DROP_IN_CHECKOUT_URL}
              className="rounded-full border-2 border-forest text-forest py-2.5 px-5 text-sm font-semibold font-body text-center transition-colors duration-200 hover:bg-forest hover:text-white"
            >
              Or book a single session — $125
            </a>
          </div>
        </GateCard>
      )
    }

    default:
      return null
  }
}

function GateCard({
  children,
  testid,
}: {
  children: React.ReactNode
  testid: string
}) {
  return (
    <div className="flex justify-center py-12">
      <div
        data-testid={testid}
        className="w-full max-w-[480px] bg-white rounded-[20px] border border-border px-6 py-8 sm:px-10 sm:py-10"
      >
        {children}
      </div>
    </div>
  )
}

function CustomerPortalButton({
  getIdToken,
}: {
  getIdToken?: () => Promise<string | null>
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const open = async () => {
    setError(null)
    setLoading(true)
    try {
      const token = getIdToken ? await getIdToken() : null
      const res = await fetch(CLOUD_FUNCTIONS.customerPortal, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({}),
      })
      if (!res.ok) throw new Error(`Customer portal request failed (${res.status})`)
      const data = (await res.json()) as { url?: string }
      if (!data.url) throw new Error('No portal URL returned')
      window.location.href = data.url
    } catch (err) {
      console.error('[BookingGate] customer portal error:', err)
      setError(
        err instanceof Error
          ? err.message
          : 'Could not open customer portal. Please email hello@iepandthrive.com.'
      )
      setLoading(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        disabled={loading}
        className="rounded-full bg-forest text-white py-3 px-5 text-sm font-semibold font-body transition-colors duration-200 hover:bg-forest-mid disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {loading ? 'Opening…' : 'Open customer portal →'}
      </button>
      {error ? (
        <p role="alert" className="text-xs font-body text-red-600 text-center">
          {error}
        </p>
      ) : null}
    </>
  )
}
