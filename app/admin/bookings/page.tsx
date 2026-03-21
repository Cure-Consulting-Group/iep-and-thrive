'use client'

import { useState, useEffect } from 'react'
import { getAllBookings, updateBookingStatus, type Booking } from '@/lib/booking-service'

const TYPE_LABELS: Record<string, string> = {
  discovery_call: 'Discovery Call',
  consultation: 'Consultation',
  check_in: 'Check-In',
}

const STATUS_STYLES: Record<string, string> = {
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  completed: 'bg-forest/10 text-forest',
  no_show: 'bg-amber/20 text-amber',
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>('all')

  const load = async () => {
    setLoading(true)
    try {
      const data = await getAllBookings()
      setBookings(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleStatus = async (id: string, status: Booking['status']) => {
    await updateBookingStatus(id, status)
    load()
  }

  const today = new Date().toISOString().split('T')[0]
  const filtered = bookings.filter((b) => {
    if (filter === 'today') return b.date === today
    if (filter === 'upcoming') return b.date >= today && b.status === 'confirmed'
    if (filter === 'past') return b.date < today
    if (filter !== 'all') return b.status === filter
    return true
  })

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest mb-2">All Bookings</h1>
      <p className="text-text-muted font-body text-sm mb-6">
        View and manage all parent bookings.
      </p>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto mb-6 pb-1">
        {[
          { key: 'all', label: 'All' },
          { key: 'today', label: "Today's" },
          { key: 'upcoming', label: 'Upcoming' },
          { key: 'past', label: 'Past' },
          { key: 'confirmed', label: 'Confirmed' },
          { key: 'completed', label: 'Completed' },
          { key: 'no_show', label: 'No-Show' },
          { key: 'cancelled', label: 'Cancelled' },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full text-xs font-body font-semibold whitespace-nowrap transition-all ${
              filter === f.key ? 'bg-forest text-white' : 'bg-sage/10 text-text-muted hover:bg-sage/20'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-3xl mb-2 block">📅</span>
          <p className="text-text-muted font-body text-sm">No bookings found.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-border p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-4">
                <div className="text-center min-w-[48px]">
                  <p className="text-sm font-body font-bold text-forest">{formatShortDate(b.date)}</p>
                  <p className="text-xs font-body text-text-muted">{b.startTime}</p>
                </div>
                <div>
                  <p className="font-body font-semibold text-text text-sm">
                    {b.parentName || 'Parent'}
                  </p>
                  <p className="text-xs font-body text-text-muted">
                    Student: {b.studentName} · {TYPE_LABELS[b.type]}
                  </p>
                  {b.notes && (
                    <p className="text-xs font-body text-text-muted mt-1 italic">&ldquo;{b.notes}&rdquo;</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <span className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold ${STATUS_STYLES[b.status]}`}>
                  {b.status}
                </span>

                {b.status === 'confirmed' && (
                  <>
                    <button
                      onClick={() => handleStatus(b.id, 'completed')}
                      className="px-3 py-1.5 rounded-full text-xs font-body font-semibold bg-forest/10 text-forest hover:bg-forest hover:text-white transition-all"
                    >
                      ✓ Complete
                    </button>
                    <button
                      onClick={() => handleStatus(b.id, 'no_show')}
                      className="px-3 py-1.5 rounded-full text-xs font-body font-semibold bg-amber/10 text-amber hover:bg-amber hover:text-white transition-all"
                    >
                      No-Show
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
