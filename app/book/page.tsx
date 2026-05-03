'use client'

import { Suspense, useState, useEffect, useCallback, useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import {
  getAvailableSlots,
  createBooking,
  type AvailableSlot,
} from '@/lib/booking-service'
import {
  bookingGateState,
  type SubscriptionState,
} from '@/lib/subscription'
import {
  bookTutoringSessionWithCounterIncrement,
  getUserSubscription,
} from '@/lib/subscription-service'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'
import SegmentedControl from '@/components/ui/SegmentedControl'
import BookingGate from '@/components/portal/BookingGate'
import SessionsCounter from '@/components/portal/SessionsCounter'
import MonthCalendar from '@/components/booking/MonthCalendar'

const TYPE_LABELS: Record<string, string> = {
  discovery_call: 'Discovery Call',
  consultation: 'Consultation',
  check_in: 'Check-In',
  tutoring: 'Tutoring Session',
}

type BookingType = 'discovery' | 'tutoring' | 'drop-in'

const SEGMENTS: { value: BookingType; label: string; description?: string }[] = [
  { value: 'discovery', label: 'Discovery call', description: 'Free' },
  { value: 'tutoring', label: 'Tutoring session', description: 'Subscribers' },
  { value: 'drop-in', label: 'Drop-in', description: '$125' },
]

const DROP_IN_CHECKOUT_URL = `${CLOUD_FUNCTIONS.stripeCheckout}?product=drop-in`

export default function BookingPage() {
  return (
    <Suspense fallback={<div className="text-text-muted text-sm py-8">Loading…</div>}>
      <BookingPageInner />
    </Suspense>
  )
}

function BookingPageInner() {
  const { user, profile } = useAuth()
  const searchParams = useSearchParams()
  const router = useRouter()

  // Booking-type tab. URL ?type=tutoring|discovery|drop-in is the source of
  // truth so links into the page deep-link to the right segment.
  const initialType: BookingType = (() => {
    const t = searchParams?.get('type')
    if (t === 'tutoring') return 'tutoring'
    if (t === 'drop-in') return 'drop-in'
    return 'discovery'
  })()
  const [bookingType, setBookingType] = useState<BookingType>(initialType)

  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [step, setStep] = useState<'calendar' | 'confirm' | 'success'>('calendar')
  const [studentName, setStudentName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Subscription state for tutoring tab.
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null)
  const [subLoading, setSubLoading] = useState(false)

  // Drop-in tab is "redirect to Stripe immediately on segment switch."
  useEffect(() => {
    if (bookingType === 'drop-in') {
      window.location.href = DROP_IN_CHECKOUT_URL
    }
  }, [bookingType])

  // Sync URL with selected booking type so deep links update naturally.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const sp = new URLSearchParams(searchParams?.toString() || '')
    if (sp.get('type') !== bookingType) {
      sp.set('type', bookingType)
      router.replace(`/book?${sp.toString()}`, { scroll: false })
    }
  }, [bookingType, router, searchParams])

  // Load slots — filter by tutoring vs. non-tutoring.
  const loadSlots = useCallback(async () => {
    setLoading(true)
    const today = new Date()
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)
    try {
      const data = await getAvailableSlots(
        today.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      )
      setSlots(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  // Load the user's subscription when switching to the tutoring tab.
  useEffect(() => {
    if (bookingType !== 'tutoring' || !user) {
      setSubscription(null)
      return
    }
    let cancelled = false
    setSubLoading(true)
    getUserSubscription(user.uid)
      .then((sub) => {
        if (!cancelled) setSubscription(sub)
      })
      .catch((err) => {
        console.error('[/book] failed to load subscription:', err)
      })
      .finally(() => {
        if (!cancelled) setSubLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [bookingType, user])

  const filteredSlots = useMemo(() => {
    if (bookingType === 'tutoring') {
      return slots.filter((s) => (s.type as string) === 'tutoring')
    }
    // Discovery tab: keep existing behavior — show non-tutoring slot types.
    return slots.filter((s) => (s.type as string) !== 'tutoring')
  }, [bookingType, slots])

  const slotsByDate = filteredSlots.reduce<Record<string, AvailableSlot[]>>(
    (acc, slot) => {
      if (!acc[slot.date]) acc[slot.date] = []
      acc[slot.date].push(slot)
      return acc
    },
    {}
  )

  const availableDates = Object.keys(slotsByDate).sort()

  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot)
    setStep('confirm')
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile || !selectedSlot) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      if (bookingType === 'tutoring') {
        await bookTutoringSessionWithCounterIncrement({
          parentId: user.uid,
          parentName: profile.displayName || '',
          parentEmail: user.email || '',
          studentName,
          type: 'tutoring',
          slotId: selectedSlot.id,
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          notes,
        })
        // Refresh subscription so SessionsCounter announces the new value.
        const fresh = await getUserSubscription(user.uid)
        setSubscription(fresh)
      } else {
        await createBooking({
          parentId: user.uid,
          parentName: profile.displayName || '',
          parentEmail: user.email || '',
          studentName,
          type: selectedSlot.type,
          slotId: selectedSlot.id,
          date: selectedSlot.date,
          startTime: selectedSlot.startTime,
          endTime: selectedSlot.endTime,
          notes,
        })
      }
      setStep('success')
    } catch (err) {
      console.error(err)
      setSubmitError(
        err instanceof Error
          ? err.message
          : 'Could not complete booking. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Tutoring gate state — derive once per render
  // ─────────────────────────────────────────────────────────────────────────
  const gateState = useMemo(
    () =>
      bookingGateState({
        authUid: user?.uid ?? null,
        subscription,
      }),
    [user, subscription]
  )

  const renderSegmentedControl = () => (
    <div className="mb-8 flex justify-center">
      <SegmentedControl<BookingType>
        ariaLabel="Booking type"
        options={SEGMENTS}
        value={bookingType}
        onChange={(v) => {
          setBookingType(v)
          // Reset transient form state when switching tabs.
          setSelectedDate(null)
          setSelectedSlot(null)
          setStep('calendar')
          setStudentName('')
          setNotes('')
        }}
      />
    </div>
  )

  // ─────────────────────────────────────────────────────────────────────────
  // Success screen
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'success' && selectedSlot) {
    return (
      <main id="main" className="min-h-[80vh] flex items-center justify-center px-4 py-16">
        <div className="max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-3xl">✓</span>
          </div>
          <h1 className="font-display text-2xl font-bold text-forest mb-3">
            Booking Confirmed!
          </h1>
          <p className="text-text-muted font-body text-sm mb-6">
            Your {TYPE_LABELS[selectedSlot.type] || 'session'} has been booked.
          </p>

          <div className="bg-white rounded-2xl border border-border p-6 text-left mb-6">
            <DetailRow label="Date" value={formatDate(selectedSlot.date)} />
            <DetailRow
              label="Time"
              value={`${selectedSlot.startTime} — ${selectedSlot.endTime}`}
            />
            <DetailRow
              label="Type"
              value={TYPE_LABELS[selectedSlot.type] || selectedSlot.type}
            />
            <DetailRow label="Student" value={studentName} />
          </div>

          {bookingType === 'tutoring' && subscription ? (
            <div className="mb-6 flex justify-center">
              <SessionsCounter
                used={subscription.sessionsUsedThisCycle}
                allowed={subscription.sessionsAllowedPerCycle}
                cycleEnd={subscription.currentPeriodEnd}
                status={subscription.status}
              />
            </div>
          ) : null}

          <p className="text-xs text-text-muted font-body mb-6">
            You&apos;ll receive a confirmation email shortly with meeting details.
          </p>

          <div className="flex gap-3 justify-center">
            <a
              href="/portal/bookings"
              className="rounded-full bg-forest text-white px-6 py-3 text-sm font-semibold font-body hover:bg-forest-mid transition-all"
            >
              View My Bookings
            </a>
            <button
              onClick={() => {
                setStep('calendar')
                setSelectedSlot(null)
                setStudentName('')
                setNotes('')
                loadSlots()
              }}
              className="rounded-full border-2 border-border text-text px-6 py-3 text-sm font-semibold font-body hover:bg-sage/10 transition-all"
            >
              Book Another
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Confirmation form
  // ─────────────────────────────────────────────────────────────────────────
  if (step === 'confirm' && selectedSlot) {
    return (
      <main id="main" className="max-w-lg mx-auto px-4 py-12">
        <button
          onClick={() => setStep('calendar')}
          className="flex items-center gap-1 text-sm font-body text-text-muted hover:text-forest mb-6 transition-colors"
        >
          ← Back to calendar
        </button>

        <h1 className="font-display text-2xl font-bold text-forest mb-2">
          Confirm Your Booking
        </h1>
        <p className="text-text-muted font-body text-sm mb-6">
          Review the details below and confirm.
        </p>

        <div className="bg-sage/10 rounded-2xl p-5 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">📅</span>
            <div>
              <p className="font-body font-semibold text-forest text-sm">
                {formatDate(selectedSlot.date)}
              </p>
              <p className="text-text-muted font-body text-xs">
                {selectedSlot.startTime} — {selectedSlot.endTime} ·{' '}
                {TYPE_LABELS[selectedSlot.type] || selectedSlot.type}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="space-y-5">
          <div>
            <label
              htmlFor="studentName"
              className="block text-sm font-semibold text-forest font-body mb-1.5"
            >
              Student Name
            </label>
            <input
              id="studentName"
              type="text"
              required
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              className="w-full rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm font-body text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all"
              placeholder="Your child's name"
            />
          </div>

          <div>
            <label
              htmlFor="notes"
              className="block text-sm font-semibold text-forest font-body mb-1.5"
            >
              Notes <span className="font-normal text-text-muted">(optional)</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-xl border border-border bg-cream/50 px-4 py-3 text-sm font-body text-text placeholder:text-text-muted/50 focus:outline-none focus:ring-2 focus:ring-forest/30 focus:border-forest transition-all resize-none"
              placeholder="What would you like to discuss?"
            />
          </div>

          {submitError ? (
            <p role="alert" className="text-sm font-body text-red-600">
              {submitError}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-full bg-forest text-white py-3 text-sm font-semibold font-body transition-all duration-200 hover:bg-forest-mid disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </main>
    )
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Calendar / Gate views
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main id="main" className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-forest mb-2">
        Book a Session
      </h1>
      <p className="text-text-muted font-body text-sm mb-8">
        {bookingType === 'tutoring'
          ? 'Choose a tutoring slot. Sessions count toward your active subscription cycle.'
          : bookingType === 'drop-in'
            ? 'Redirecting to checkout…'
            : 'Select a date and time that works for you. All sessions are 20 minutes.'}
      </p>

      {renderSegmentedControl()}

      {/* Tutoring tab: gate states */}
      {bookingType === 'tutoring' && (
        <>
          {subLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
            </div>
          ) : gateState.kind === 'anonymous' ||
            gateState.kind === 'no-subscription' ||
            gateState.kind === 'paused' ||
            gateState.kind === 'past-due' ||
            gateState.kind === 'canceled' ? (
            <BookingGate
              state={gateState}
              getIdToken={user ? () => user.getIdToken() : undefined}
            />
          ) : (
            <TutoringActiveCalendar
              gateKind={gateState.kind}
              subscription={
                gateState.kind === 'active-bookable'
                  ? gateState.sub
                  : gateState.sub
              }
              loading={loading}
              availableDates={availableDates}
              slotsByDate={slotsByDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onSelectSlot={handleSelectSlot}
            />
          )}
        </>
      )}

      {/* Drop-in tab: spinner while we redirect */}
      {bookingType === 'drop-in' && (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      )}

      {/* Discovery tab: existing flow */}
      {bookingType === 'discovery' && (
        <>
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="w-10 h-10 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
            </div>
          ) : availableDates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-12 text-center">
              <span className="text-4xl mb-4 block">📅</span>
              <h2 className="font-display text-lg font-semibold text-forest mb-2">
                No Availability
              </h2>
              <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
                There are no available time slots in the next 30 days. Please
                check back soon or contact us directly.
              </p>
            </div>
          ) : (
            <CalendarBody
              availableDates={availableDates}
              slotsByDate={slotsByDate}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              onSelectSlot={handleSelectSlot}
            />
          )}
        </>
      )}
    </main>
  )
}

// ─────────────────────────────────────────────────────────────────────────
// Subcomponents
// ─────────────────────────────────────────────────────────────────────────

interface CalendarBodyProps {
  availableDates: string[]
  slotsByDate: Record<string, AvailableSlot[]>
  selectedDate: string | null
  setSelectedDate: (d: string) => void
  onSelectSlot: (slot: AvailableSlot) => void
  /** When true, the calendar is rendered at 50% opacity and click-disabled. */
  disabled?: boolean
}

function CalendarBody({
  availableDates,
  slotsByDate,
  selectedDate,
  setSelectedDate,
  onSelectSlot,
  disabled = false,
}: CalendarBodyProps) {
  const countsByDate = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(slotsByDate).map(([d, arr]) => [d, arr.length])
      ),
    [slotsByDate]
  )

  return (
    <div
      className={`grid md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] gap-6 ${disabled ? 'opacity-50 pointer-events-none' : ''}`}
      aria-disabled={disabled || undefined}
    >
      {/* Left: month calendar */}
      <MonthCalendar
        availableDates={availableDates}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
        countsByDate={countsByDate}
      />

      {/* Right: time slots */}
      <div>
        {selectedDate && slotsByDate[selectedDate] ? (
          <div className="bg-white rounded-2xl border border-border p-6">
            <h2 className="font-display text-lg font-semibold text-forest mb-4">
              {formatDate(selectedDate)}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {slotsByDate[selectedDate].map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => onSelectSlot(slot)}
                  className="flex flex-col items-center p-4 rounded-xl border-2 border-border bg-white hover:border-forest hover:bg-forest/5 transition-all duration-200 group"
                >
                  <span className="text-sm font-body font-bold text-forest group-hover:text-forest">
                    {slot.startTime}
                  </span>
                  <span className="text-xs font-body text-text-muted mt-0.5">
                    {slot.duration} min · {TYPE_LABELS[slot.type] || slot.type}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-sage/5 rounded-2xl p-8 text-center h-full flex flex-col items-center justify-center">
            <span className="text-3xl mb-3">📅</span>
            <p className="text-text-muted font-body text-sm">
              Select a date to see available times.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

interface TutoringActiveCalendarProps {
  gateKind: 'active-bookable' | 'active-exhausted'
  subscription: SubscriptionState
  loading: boolean
  availableDates: string[]
  slotsByDate: Record<string, AvailableSlot[]>
  selectedDate: string | null
  setSelectedDate: (d: string) => void
  onSelectSlot: (slot: AvailableSlot) => void
}

function TutoringActiveCalendar(props: TutoringActiveCalendarProps) {
  const {
    gateKind,
    subscription,
    loading,
    availableDates,
    slotsByDate,
    selectedDate,
    setSelectedDate,
    onSelectSlot,
  } = props

  const exhausted = gateKind === 'active-exhausted'

  return (
    <div className="space-y-6">
      {/* Sessions counter chip */}
      <div className="flex justify-center">
        <SessionsCounter
          used={subscription.sessionsUsedThisCycle}
          allowed={subscription.sessionsAllowedPerCycle}
          cycleEnd={subscription.currentPeriodEnd}
          status={subscription.status}
        />
      </div>

      {/* Calendar (dimmed if exhausted) */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      ) : availableDates.length === 0 && !exhausted ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">📅</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">
            No tutoring slots open
          </h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            New slots open weekly. Check back soon, or email
            hello@iepandthrive.com if you need a session sooner.
          </p>
        </div>
      ) : (
        <div className="relative">
          <CalendarBody
            availableDates={availableDates}
            slotsByDate={slotsByDate}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            onSelectSlot={onSelectSlot}
            disabled={exhausted}
          />

          {exhausted && (
            <div className="mt-6 bg-cream-deep border border-border rounded-2xl p-6 text-center">
              <h3 className="font-display text-lg font-bold text-forest mb-2">
                All sessions used this cycle
              </h3>
              <p className="text-sm font-body text-text-muted mb-4">
                Your next sessions unlock when your billing cycle resets. Need
                a session sooner?
              </p>
              <a
                href={DROP_IN_CHECKOUT_URL}
                className="inline-flex items-center rounded-full bg-amber text-white px-6 py-3 text-sm font-semibold font-body hover:bg-amber/90 transition-all"
              >
                Book a single session — $125
              </a>
            </div>
          )}
        </div>
      )}

      {/* Policy block */}
      <div className="border-t border-border pt-4 text-xs font-body text-text-muted leading-relaxed">
        <p>
          <span aria-hidden="true">ⓘ </span>
          Sessions don&apos;t roll over to the next month. Cancel a session at
          least 24 hours before for a credit; same-day cancellations forfeit
          the session.
        </p>
      </div>
    </div>
  )
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-2 border-b border-border/50 last:border-0">
      <span className="text-sm font-body text-text-muted">{label}</span>
      <span className="text-sm font-body font-medium text-text">{value}</span>
    </div>
  )
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}
