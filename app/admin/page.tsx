'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { getAllResources } from '@/lib/resource-service'

export default function AdminDashboard() {
  const [stats, setStats] = useState({ students: 0, resources: 0 })
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [resources, usersSnap] = await Promise.all([
        getAllResources(),
        getDocs(collection(db, 'users')),
      ])

      // Count students across all users
      let studentCount = 0
      for (const userDoc of usersSnap.docs) {
        const studentsSnap = await getDocs(collection(db, 'users', userDoc.id, 'students'))
        studentCount += studentsSnap.size
      }

      setStats({
        students: studentCount,
        resources: resources.length,
      })
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
          Manage students, learning resources, and reports.
        </p>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl border border-border p-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-12 mb-2" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <StatCard label="Total Students" value={String(stats.students)} icon="🎓" href="/admin/students" />
          <StatCard label="Resources" value={String(stats.resources)} icon="📁" href="/admin/resources" />
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
