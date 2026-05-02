'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/auth-context'
import { getBookingsByParent, cancelBooking, type Booking } from '@/lib/booking-service'
import { cancelTutoringBooking } from '@/lib/subscription-service'

const TYPE_LABELS: Record<string, string> = {
  discovery_call: 'Discovery Call',
  consultation: 'Consultation',
  check_in: 'Check-In',
  tutoring: 'Tutoring Session',
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-forest/10 text-forest',
  no_show: 'bg-amber/20 text-amber',
}

export default function PortalBookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    if (!user) return
    setLoading(true)
    try {
      const data = await getBookingsByParent(user.uid)
      setBookings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { if (user) load() }, [user]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCancel = async (booking: Booking) => {
    // Tutoring bookings have a 24-hour forfeit policy: cancellations made
    // less than 24h before the slot still free the slot but DO NOT refund
    // the session counter. Warn the parent before they confirm.
    const slotStart = new Date(`${booking.date}T${booking.startTime}:00`)
    const diffHours = (slotStart.getTime() - Date.now()) / (1000 * 60 * 60)
    const isTutoring = booking.type === 'tutoring'
    const forfeit = isTutoring && diffHours < 24
    const msg = forfeit
      ? 'This is within 24 hours of your session. Cancelling will forfeit this session (no credit back to your subscription). Continue?'
      : isTutoring
        ? 'Cancel this tutoring session? Your session will be credited back to your subscription.'
        : 'Are you sure you want to cancel this booking?'
    if (!confirm(msg)) return
    if (!user) return
    if (isTutoring) {
      await cancelTutoringBooking({
        bookingId: booking.id,
        slotId: booking.slotId,
        parentId: user.uid,
        slotStart: `${booking.date}T${booking.startTime}`,
      })
    } else {
      await cancelBooking(booking.id, booking.slotId)
    }
    load()
  }

  const today = new Date().toISOString().split('T')[0]
  const upcoming = bookings.filter((b) => b.date >= today && b.status === 'confirmed')
  const past = bookings.filter((b) => b.date < today || b.status !== 'confirmed')

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-2xl font-bold text-forest">My Bookings</h1>
          <p className="text-text-muted font-body text-sm mt-1">
            View and manage your upcoming and past bookings.
          </p>
        </div>
        <a
          href="/book"
          className="inline-flex items-center rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-forest-mid"
        >
          + Book Session
        </a>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      ) : bookings.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">📅</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">No Bookings Yet</h2>
          <p className="text-text-muted font-body text-sm mb-6 max-w-sm mx-auto">
            Book a discovery call to discuss your child&apos;s needs and learn how IEP &amp; Thrive can help.
          </p>
          <a
            href="/book"
            className="inline-flex items-center rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-forest-mid"
          >
            Book a Discovery Call
            <span className="ml-1" aria-hidden="true">&rarr;</span>
          </a>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-forest mb-3">Upcoming</h2>
              <div className="space-y-3">
                {upcoming.map((b) => (
                  <BookingCard
                    key={b.id}
                    booking={b}
                    canCancel={canCancelBooking(b.date, b.startTime, b.type)}
                    onCancel={() => handleCancel(b)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Past */}
          {past.length > 0 && (
            <section>
              <h2 className="font-display text-lg font-semibold text-forest mb-3">Past</h2>
              <div className="space-y-3">
                {past.map((b) => (
                  <BookingCard key={b.id} booking={b} canCancel={false} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}

function BookingCard({
  booking,
  canCancel,
  onCancel,
}: {
  booking: Booking
  canCancel: boolean
  onCancel?: () => void
}) {
  return (
    <div className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-sage/10 rounded-xl flex flex-col items-center justify-center shrink-0">
          <span className="text-xs font-body font-bold text-forest leading-none">
            {new Date(booking.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short' })}
          </span>
          <span className="text-lg font-display font-bold text-forest leading-none">
            {new Date(booking.date + 'T00:00:00').getDate()}
          </span>
        </div>
        <div>
          <p className="font-body font-semibold text-text text-sm">
            {TYPE_LABELS[booking.type]}
          </p>
          <p className="text-xs font-body text-text-muted">
            {booking.startTime} — {booking.endTime}
          </p>
          <p className="text-xs font-body text-text-muted mt-0.5">
            Student: {booking.studentName}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <span className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold ${STATUS_STYLES[booking.status]}`}>
          {booking.status}
        </span>
        {canCancel && (
          <button
            onClick={onCancel}
            className="px-3 py-1.5 rounded-full text-xs font-body font-semibold text-red-500 hover:bg-red-50 transition-all"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  )
}

function canCancelBooking(
  date: string,
  startTime: string,
  type: string
): boolean {
  const bookingDate = new Date(`${date}T${startTime}:00`)
  const now = new Date()
  const diffHours = (bookingDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  // Tutoring sessions are cancellable up to slot start (with same-day
  // forfeit). Other booking types keep the strict 24h cutoff so the cancel
  // button hides automatically when no refund is available.
  if (type === 'tutoring') return diffHours > 0
  return diffHours >= 24
}
