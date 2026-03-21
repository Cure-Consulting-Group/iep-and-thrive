'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth-context'
import {
  getAvailableSlots,
  createBooking,
  type AvailableSlot,
} from '@/lib/booking-service'

const TYPE_LABELS: Record<string, string> = {
  discovery_call: 'Discovery Call',
  consultation: 'Consultation',
  check_in: 'Check-In',
}

export default function BookingPage() {
  const { user, profile } = useAuth()
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null)
  const [step, setStep] = useState<'calendar' | 'confirm' | 'success'>('calendar')
  const [studentName, setStudentName] = useState('')
  const [notes, setNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Load 30 days of availability
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

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, AvailableSlot[]>>((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = []
    acc[slot.date].push(slot)
    return acc
  }, {})

  const availableDates = Object.keys(slotsByDate).sort()

  const handleSelectSlot = (slot: AvailableSlot) => {
    setSelectedSlot(slot)
    setStep('confirm')
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !profile || !selectedSlot) return
    setSubmitting(true)
    try {
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
      setStep('success')
    } catch (err) {
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  // Success screen
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
            Your {TYPE_LABELS[selectedSlot.type]} has been booked.
          </p>

          <div className="bg-white rounded-2xl border border-border p-6 text-left mb-6">
            <DetailRow label="Date" value={formatDate(selectedSlot.date)} />
            <DetailRow label="Time" value={`${selectedSlot.startTime} — ${selectedSlot.endTime}`} />
            <DetailRow label="Type" value={TYPE_LABELS[selectedSlot.type]} />
            <DetailRow label="Student" value={studentName} />
          </div>

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

  // Confirmation form
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
                {selectedSlot.startTime} — {selectedSlot.endTime} · {TYPE_LABELS[selectedSlot.type]}
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleConfirm} className="space-y-5">
          <div>
            <label htmlFor="studentName" className="block text-sm font-semibold text-forest font-body mb-1.5">
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
            <label htmlFor="notes" className="block text-sm font-semibold text-forest font-body mb-1.5">
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

  // Calendar view
  return (
    <main id="main" className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="font-display text-3xl font-bold text-forest mb-2">Book a Session</h1>
      <p className="text-text-muted font-body text-sm mb-8">
        Select a date and time that works for you. All sessions are 20 minutes.
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-10 h-10 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      ) : availableDates.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">📅</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">No Availability</h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            There are no available time slots in the next 30 days. Please check back soon or contact us directly.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Date selector */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {availableDates.map((date) => {
              const d = new Date(date + 'T00:00:00')
              const isSelected = selectedDate === date
              return (
                <button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center min-w-[72px] px-4 py-3 rounded-2xl border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-forest bg-forest text-white'
                      : 'border-border bg-white text-text hover:border-forest/30'
                  }`}
                >
                  <span className={`text-xs font-body font-semibold uppercase ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                    {d.toLocaleDateString('en-US', { weekday: 'short' })}
                  </span>
                  <span className="text-lg font-display font-bold">
                    {d.getDate()}
                  </span>
                  <span className={`text-xs font-body ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                    {d.toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className={`mt-1 text-xs font-body font-semibold ${isSelected ? 'text-white' : 'text-forest'}`}>
                    {slotsByDate[date].length} slot{slotsByDate[date].length !== 1 ? 's' : ''}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Time slots */}
          {selectedDate && slotsByDate[selectedDate] && (
            <div className="bg-white rounded-2xl border border-border p-6">
              <h2 className="font-display text-lg font-semibold text-forest mb-4">
                {formatDate(selectedDate)}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {slotsByDate[selectedDate].map((slot) => (
                  <button
                    key={slot.id}
                    onClick={() => handleSelectSlot(slot)}
                    className="flex flex-col items-center p-4 rounded-xl border-2 border-border bg-white hover:border-forest hover:bg-forest/5 transition-all duration-200 group"
                  >
                    <span className="text-sm font-body font-bold text-forest group-hover:text-forest">
                      {slot.startTime}
                    </span>
                    <span className="text-xs font-body text-text-muted mt-0.5">
                      {slot.duration} min · {TYPE_LABELS[slot.type]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {!selectedDate && (
            <div className="bg-sage/5 rounded-2xl p-8 text-center">
              <p className="text-text-muted font-body text-sm">
                👆 Select a date above to see available times
              </p>
            </div>
          )}
        </div>
      )}
    </main>
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
