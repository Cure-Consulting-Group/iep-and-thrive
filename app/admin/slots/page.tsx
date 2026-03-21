'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  createSlot,
  createBulkSlots,
  getSlotsByDate,
  deleteSlot,
  toggleSlotAvailability,
  type AvailableSlot,
} from '@/lib/booking-service'

const SLOT_TYPES: { value: AvailableSlot['type']; label: string }[] = [
  { value: 'discovery_call', label: 'Discovery Call' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'check_in', label: 'Check-In' },
]

export default function AdminSlotsPage() {
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const [viewDate, setViewDate] = useState(getTodayString())
  const [slots, setSlots] = useState<AvailableSlot[]>([])
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  // Single slot form
  const [sDate, setSDate] = useState(getTodayString())
  const [sStart, setSStart] = useState('10:00')
  const [sEnd, setSEnd] = useState('10:20')
  const [sType, setSType] = useState<AvailableSlot['type']>('discovery_call')

  // Bulk form
  const [bStartDate, setBStartDate] = useState(getTodayString())
  const [bEndDate, setBEndDate] = useState('')
  const [bDays, setBDays] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri
  const [bStartHour, setBStartHour] = useState(10)
  const [bEndHour, setBEndHour] = useState(12)
  const [bDuration, setBDuration] = useState(20)
  const [bType, setBType] = useState<AvailableSlot['type']>('discovery_call')

  const loadSlots = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getSlotsByDate(viewDate)
      setSlots(data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [viewDate])

  useEffect(() => {
    loadSlots()
  }, [loadSlots])

  const handleSingleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    try {
      const dur = timeDiffMinutes(sStart, sEnd)
      await createSlot({
        date: sDate,
        startTime: sStart,
        endTime: sEnd,
        duration: dur,
        type: sType,
        isAvailable: true,
        bookedBy: null,
      })
      setSuccess('Slot created!')
      if (sDate === viewDate) loadSlots()
    } catch (err) {
      console.error(err)
    }
  }

  const handleBulkCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSuccess('')
    try {
      const dates = generateDatesInRange(bStartDate, bEndDate, bDays)
      const count = await createBulkSlots(dates, bStartHour, bEndHour, bDuration, bType)
      setSuccess(`${count} slots created across ${dates.length} days!`)
      loadSlots()
    } catch (err) {
      console.error(err)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slot?')) return
    await deleteSlot(id)
    loadSlots()
  }

  const handleToggle = async (id: string, current: boolean) => {
    await toggleSlotAvailability(id, !current)
    loadSlots()
  }

  return (
    <div>
      <h1 className="font-display text-2xl font-bold text-forest mb-2">Manage Availability</h1>
      <p className="text-text-muted font-body text-sm mb-8">
        Create and manage bookable time slots for discovery calls and consultations.
      </p>

      {success && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm font-body">
          ✓ {success}
        </div>
      )}

      {/* Create Slots */}
      <div className="bg-white rounded-2xl border border-border p-6 mb-8">
        <div className="flex items-center gap-3 mb-6">
          <h2 className="font-display text-lg font-semibold text-forest">Create Slots</h2>
          <div className="flex bg-sage/10 rounded-full p-0.5">
            <button
              onClick={() => setMode('single')}
              className={`px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all ${
                mode === 'single' ? 'bg-forest text-white' : 'text-text-muted'
              }`}
            >
              Single
            </button>
            <button
              onClick={() => setMode('bulk')}
              className={`px-4 py-1.5 rounded-full text-xs font-body font-semibold transition-all ${
                mode === 'bulk' ? 'bg-forest text-white' : 'text-text-muted'
              }`}
            >
              Bulk
            </button>
          </div>
        </div>

        {mode === 'single' ? (
          <form onSubmit={handleSingleCreate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <FormField label="Date">
              <input type="date" value={sDate} onChange={(e) => setSDate(e.target.value)} className="form-input" required />
            </FormField>
            <FormField label="Start Time">
              <input type="time" value={sStart} onChange={(e) => setSStart(e.target.value)} className="form-input" required />
            </FormField>
            <FormField label="End Time">
              <input type="time" value={sEnd} onChange={(e) => setSEnd(e.target.value)} className="form-input" required />
            </FormField>
            <FormField label="Type">
              <select value={sType} onChange={(e) => setSType(e.target.value as AvailableSlot['type'])} className="form-input">
                {SLOT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </FormField>
            <div className="flex items-end">
              <button type="submit" className="w-full rounded-full bg-forest text-white py-2.5 text-sm font-semibold font-body hover:bg-forest-mid transition-all">
                Create Slot
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleBulkCreate} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FormField label="Start Date">
                <input type="date" value={bStartDate} onChange={(e) => setBStartDate(e.target.value)} className="form-input" required />
              </FormField>
              <FormField label="End Date">
                <input type="date" value={bEndDate} onChange={(e) => setBEndDate(e.target.value)} className="form-input" required />
              </FormField>
              <FormField label="Time Range">
                <div className="flex items-center gap-2">
                  <select value={bStartHour} onChange={(e) => setBStartHour(Number(e.target.value))} className="form-input">
                    {Array.from({ length: 12 }, (_, i) => i + 7).map((h) => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                  <span className="text-text-muted text-sm">to</span>
                  <select value={bEndHour} onChange={(e) => setBEndHour(Number(e.target.value))} className="form-input">
                    {Array.from({ length: 12 }, (_, i) => i + 8).map((h) => (
                      <option key={h} value={h}>{formatHour(h)}</option>
                    ))}
                  </select>
                </div>
              </FormField>
              <FormField label="Slot Duration">
                <select value={bDuration} onChange={(e) => setBDuration(Number(e.target.value))} className="form-input">
                  <option value={15}>15 min</option>
                  <option value={20}>20 min</option>
                  <option value={30}>30 min</option>
                  <option value={45}>45 min</option>
                  <option value={60}>60 min</option>
                </select>
              </FormField>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label="Days of Week">
                <div className="flex flex-wrap gap-2">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                    <button
                      key={day}
                      type="button"
                      onClick={() => {
                        const dayNum = i + 1
                        setBDays((prev) =>
                          prev.includes(dayNum)
                            ? prev.filter((d) => d !== dayNum)
                            : [...prev, dayNum]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-full text-xs font-body font-semibold transition-all ${
                        bDays.includes(i + 1)
                          ? 'bg-forest text-white'
                          : 'bg-sage/10 text-text-muted hover:bg-sage/20'
                      }`}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </FormField>
              <FormField label="Slot Type">
                <select value={bType} onChange={(e) => setBType(e.target.value as AvailableSlot['type'])} className="form-input">
                  {SLOT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </FormField>
            </div>

            <button type="submit" className="rounded-full bg-forest text-white px-6 py-2.5 text-sm font-semibold font-body hover:bg-forest-mid transition-all">
              Generate Slots
            </button>
          </form>
        )}
      </div>

      {/* View Slots */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-lg font-semibold text-forest">Slots for Date</h2>
          <input
            type="date"
            value={viewDate}
            onChange={(e) => setViewDate(e.target.value)}
            className="form-input w-auto"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="w-8 h-8 border-3 border-forest/20 border-t-forest rounded-full animate-spin" />
          </div>
        ) : slots.length === 0 ? (
          <div className="text-center py-8">
            <span className="text-3xl block mb-2">🕐</span>
            <p className="text-text-muted font-body text-sm">No slots for this date.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {slots.map((slot) => (
              <div
                key={slot.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                  slot.isAvailable
                    ? 'border-border bg-white'
                    : 'border-amber/30 bg-amber/5'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-sm font-body font-bold text-forest">
                      {slot.startTime} — {slot.endTime}
                    </p>
                    <p className="text-xs font-body text-text-muted">{slot.duration} min</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-body font-semibold ${
                    slot.type === 'discovery_call'
                      ? 'bg-forest/10 text-forest'
                      : slot.type === 'consultation'
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-sage/20 text-sage'
                  }`}>
                    {SLOT_TYPES.find((t) => t.value === slot.type)?.label}
                  </span>
                  {!slot.isAvailable && (
                    <span className="px-2.5 py-1 rounded-full text-xs font-body font-semibold bg-amber/20 text-amber">
                      Booked
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggle(slot.id, slot.isAvailable)}
                    className="text-xs font-body text-text-muted hover:text-forest transition-colors px-3 py-1.5 rounded-full hover:bg-sage/10"
                  >
                    {slot.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-xs font-body text-red-500 hover:text-red-700 transition-colors px-3 py-1.5 rounded-full hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Helpers ───

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-forest font-body mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function getTodayString() {
  return new Date().toISOString().split('T')[0]
}

function timeDiffMinutes(start: string, end: string) {
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  return (eh * 60 + em) - (sh * 60 + sm)
}

function formatHour(h: number) {
  const suffix = h >= 12 ? 'PM' : 'AM'
  const hour = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${hour} ${suffix}`
}

function generateDatesInRange(start: string, end: string, days: number[]): string[] {
  const dates: string[] = []
  const current = new Date(start + 'T00:00:00')
  const endDate = new Date(end + 'T00:00:00')

  while (current <= endDate) {
    // getDay() returns 0=Sun. Convert: Mon=1..Sun=7
    const dayOfWeek = current.getDay() === 0 ? 7 : current.getDay()
    if (days.includes(dayOfWeek)) {
      dates.push(current.toISOString().split('T')[0])
    }
    current.setDate(current.getDate() + 1)
  }
  return dates
}
