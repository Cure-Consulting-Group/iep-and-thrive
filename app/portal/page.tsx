'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth-context'
import { getBookingsByParent, Booking } from '@/lib/booking-service'
import { getReportsByParent, ProgressReport } from '@/lib/report-service'
import { getStudentsByParent, Student } from '@/lib/student-service'

const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-gray-100 text-gray-700',
  discovery: 'bg-blue-100 text-blue-700',
  deposited: 'bg-amber-100 text-amber-700',
  enrolled: 'bg-green-100 text-green-700',
  completed: 'bg-forest text-white',
}

export default function PortalDashboard() {
  const { profile, user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    try {
      const [studs, books, reps] = await Promise.all([
        getStudentsByParent(user.uid),
        getBookingsByParent(user.uid),
        getReportsByParent(user.uid),
      ])
      setStudents(studs)
      setBookings(books)
      setReports(reps)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    }
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  const today = new Date().toISOString().split('T')[0]
  const upcomingBookings = bookings.filter((b) => b.date >= today && b.status === 'confirmed')
  const nextBooking = upcomingBookings[0]
  const unreadReports = reports.filter((r) => !r.viewedAt).length

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">
          Welcome, {profile?.displayName?.split(' ')[0] || 'Parent'}
        </h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Here&apos;s an overview of your IEP &amp; Thrive account.
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="text-3xl font-display font-bold text-forest">{students.length}</div>
              <p className="text-sm font-body text-text-muted mt-1">Students Enrolled</p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="text-3xl font-display font-bold text-forest">{upcomingBookings.length}</div>
              <p className="text-sm font-body text-text-muted mt-1">Upcoming Sessions</p>
            </div>
            <div className="bg-white rounded-2xl border border-border p-6">
              <div className="flex items-center gap-2">
                <span className="text-3xl font-display font-bold text-forest">{reports.length}</span>
                {unreadReports > 0 && (
                  <span className="text-xs font-body font-semibold bg-forest text-white px-2 py-0.5 rounded-full">
                    {unreadReports} new
                  </span>
                )}
              </div>
              <p className="text-sm font-body text-text-muted mt-1">Progress Reports</p>
            </div>
          </div>

          {/* Next Booking */}
          {nextBooking && (
            <div className="bg-white rounded-2xl border border-sage p-6 mb-6">
              <h2 className="font-display text-sm font-semibold text-text-muted uppercase mb-3">Next Session</h2>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-sage/20 flex flex-col items-center justify-center">
                  <span className="text-xs font-body font-semibold text-forest">
                    {new Date(nextBooking.date + 'T00:00').toLocaleDateString('en-US', { month: 'short' })}
                  </span>
                  <span className="text-lg font-display font-bold text-forest">
                    {new Date(nextBooking.date + 'T00:00').getDate()}
                  </span>
                </div>
                <div>
                  <p className="font-body font-semibold text-text">
                    {nextBooking.type.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                  </p>
                  <p className="text-sm font-body text-text-muted">
                    {nextBooking.startTime} – {nextBooking.endTime} · {nextBooking.studentName}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Student Cards */}
          {students.length > 0 && (
            <div className="mb-6">
              <h2 className="font-display text-sm font-semibold text-text-muted uppercase mb-3">Your Students</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {students.map((s) => (
                  <div key={s.id} className="bg-white rounded-2xl border border-border p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center">
                        <span className="font-semibold text-forest text-sm">{s.name?.charAt(0)?.toUpperCase()}</span>
                      </div>
                      <div>
                        <p className="font-body font-semibold text-text">{s.name}</p>
                        <p className="text-xs font-body text-text-muted">Grade {s.grade} · {s.district}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-body font-semibold px-2.5 py-1 rounded-full ${STATUS_COLORS[s.enrollmentStatus] || 'bg-gray-100'}`}>
                      {s.enrollmentStatus?.charAt(0).toUpperCase()}{s.enrollmentStatus?.slice(1)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/book" className="bg-forest/10 rounded-2xl p-6 text-center hover:bg-forest/20 transition-colors group">
              <span className="text-2xl block mb-2">📅</span>
              <p className="font-body font-semibold text-forest group-hover:underline">Book a Session</p>
            </Link>
            <Link href="/portal/resources" className="bg-forest/10 rounded-2xl p-6 text-center hover:bg-forest/20 transition-colors group">
              <span className="text-2xl block mb-2">📁</span>
              <p className="font-body font-semibold text-forest group-hover:underline">View Resources</p>
            </Link>
            <Link href="/portal/reports" className="bg-forest/10 rounded-2xl p-6 text-center hover:bg-forest/20 transition-colors group">
              <span className="text-2xl block mb-2">📈</span>
              <p className="font-body font-semibold text-forest group-hover:underline">Progress Reports</p>
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
