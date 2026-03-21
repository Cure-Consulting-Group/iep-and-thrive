'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAllBookings, Booking } from '@/lib/booking-service'
import { getAllResources, Resource } from '@/lib/resource-service'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, todayBookings: 0, resources: 0, totalBookings: 0 })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const today = new Date().toISOString().split('T')[0]
      const [bookings, resources, usersSnap] = await Promise.all([
        getAllBookings(),
        getAllResources(),
        getDocs(collection(db, 'users')),
      ])

      // Count students across all users
      let studentCount = 0
      for (const userDoc of usersSnap.docs) {
        const studentsSnap = await getDocs(collection(db, 'users', userDoc.id, 'students'))
        studentCount += studentsSnap.size
      }

      const todayBookings = bookings.filter((b) => b.date === today).length
      setStats({
        students: studentCount,
        todayBookings,
        resources: resources.length,
        totalBookings: bookings.length,
      })
      setRecentBookings(bookings.slice(-5).reverse())
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">Admin Dashboard</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Manage students, bookings, resources, and reports.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard label="Total Students" value={String(stats.students)} icon="🎓" href="/admin/students" />
          <StatCard label="Today's Bookings" value={String(stats.todayBookings)} icon="📅" href="/admin/bookings" />
          <StatCard label="Total Bookings" value={String(stats.totalBookings)} icon="🗓️" href="/admin/bookings" />
          <StatCard label="Resources" value={String(stats.resources)} icon="📁" href="/admin/resources" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/slots" className="bg-forest/10 rounded-2xl p-5 text-center hover:bg-forest/20 transition-colors group">
          <span className="text-xl block mb-1">⏰</span>
          <p className="font-body text-sm font-semibold text-forest group-hover:underline">Manage Slots</p>
        </Link>
        <Link href="/admin/students" className="bg-forest/10 rounded-2xl p-5 text-center hover:bg-forest/20 transition-colors group">
          <span className="text-xl block mb-1">🎓</span>
          <p className="font-body text-sm font-semibold text-forest group-hover:underline">Student Roster</p>
        </Link>
        <Link href="/admin/resources" className="bg-forest/10 rounded-2xl p-5 text-center hover:bg-forest/20 transition-colors group">
          <span className="text-xl block mb-1">📤</span>
          <p className="font-body text-sm font-semibold text-forest group-hover:underline">Upload Resource</p>
        </Link>
        <Link href="/admin/reports" className="bg-forest/10 rounded-2xl p-5 text-center hover:bg-forest/20 transition-colors group">
          <span className="text-xl block mb-1">📝</span>
          <p className="font-body text-sm font-semibold text-forest group-hover:underline">Upload Report</p>
        </Link>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-forest">Recent Bookings</h2>
          <Link href="/admin/bookings" className="text-sm font-body text-forest hover:underline">
            View all →
          </Link>
        </div>
        {recentBookings.length === 0 ? (
          <p className="text-text-muted font-body text-sm">No bookings yet.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {recentBookings.map((b) => (
              <div key={b.id} className="py-3 flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-sage/20 flex items-center justify-center shrink-0">
                  <span className="text-xs font-display font-bold text-forest">
                    {new Date(b.date + 'T00:00').getDate()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body text-sm font-semibold text-text truncate">
                    {b.parentName} — {b.studentName}
                  </p>
                  <p className="text-xs font-body text-text-muted">
                    {b.date} · {b.startTime}–{b.endTime}
                  </p>
                </div>
                <span className={`text-xs font-body font-semibold px-2 py-0.5 rounded-full ${
                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                  b.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                  b.status === 'completed' ? 'bg-forest text-white' :
                  'bg-amber-100 text-amber-700'
                }`}>
                  {b.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ label, value, icon, href }: { label: string; value: string; icon: string; href: string }) {
  return (
    <Link href={href} className="bg-white rounded-2xl border border-border p-6 hover:border-sage transition-colors group">
      <div className="flex items-center justify-between mb-2">
        <span className="text-2xl">{icon}</span>
        <svg className="w-4 h-4 text-text-muted group-hover:text-forest transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
      <div className="text-3xl font-display font-bold text-forest">{value}</div>
      <p className="text-sm font-body text-text-muted mt-1">{label}</p>
    </Link>
  )
}
