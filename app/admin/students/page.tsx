'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  getAllStudents,
  updateEnrollmentStatus,
  Student,
  EnrollmentStatus,
} from '@/lib/student-service'

const STATUS_LABELS: Record<EnrollmentStatus, string> = {
  inquiry: 'Inquiry',
  discovery: 'Discovery',
  deposited: 'Deposited',
  enrolled: 'Enrolled',
  completed: 'Completed',
}

const STATUS_COLORS: Record<EnrollmentStatus, string> = {
  inquiry: 'bg-gray-100 text-gray-700',
  discovery: 'bg-blue-100 text-blue-700',
  deposited: 'bg-amber-100 text-amber-700',
  enrolled: 'bg-green-100 text-green-700',
  completed: 'bg-forest text-white',
}

const TRACK_LABELS: Record<string, string> = {
  reading: 'Reading & Language',
  math: 'Math & Numeracy',
  full: 'Full Academic',
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterTrack, setFilterTrack] = useState<string>('all')
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getAllStudents()
      setStudents(data)
    } catch (err) {
      console.error('Failed to load students:', err)
    }
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  const handleStatusChange = async (parentId: string, studentId: string, status: EnrollmentStatus) => {
    try {
      await updateEnrollmentStatus(parentId, studentId, status)
      setStudents((prev) =>
        prev.map((s) => (s.id === studentId ? { ...s, enrollmentStatus: status } : s))
      )
    } catch (err) {
      console.error('Failed to update status:', err)
    }
  }

  const filtered = students.filter((s) => {
    const matchSearch =
      !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.parentName.toLowerCase().includes(search.toLowerCase()) ||
      s.parentEmail.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || s.enrollmentStatus === filterStatus
    const matchTrack = filterTrack === 'all' || s.programTrack === filterTrack
    return matchSearch && matchStatus && matchTrack
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-forest">Students</h1>
        <p className="text-text-muted font-body text-sm mt-1">
          Manage student roster and enrollment status.
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="form-input flex-1 min-w-[200px]"
        />
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="form-input w-auto"
        >
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
        <select
          value={filterTrack}
          onChange={(e) => setFilterTrack(e.target.value)}
          className="form-input w-auto"
        >
          <option value="all">All Programs</option>
          {Object.entries(TRACK_LABELS).map(([val, label]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        {(Object.entries(STATUS_LABELS) as [EnrollmentStatus, string][]).map(([status, label]) => {
          const count = students.filter((s) => s.enrollmentStatus === status).length
          return (
            <button
              key={status}
              onClick={() => setFilterStatus(filterStatus === status ? 'all' : status)}
              className={`rounded-xl p-3 text-center border transition-all ${
                filterStatus === status ? 'border-forest bg-sage/20' : 'border-border bg-white'
              }`}
            >
              <div className="text-xl font-bold font-display text-forest">{count}</div>
              <div className="text-xs font-body text-text-muted">{label}</div>
            </button>
          )
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-xl border border-border p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-border p-12 text-center">
          <span className="text-4xl mb-4 block">🎓</span>
          <h2 className="font-display text-lg font-semibold text-forest mb-2">
            {students.length === 0 ? 'No Students Yet' : 'No Matching Students'}
          </h2>
          <p className="text-text-muted font-body text-sm max-w-sm mx-auto">
            {students.length === 0
              ? 'Students will appear here when parents add them via the portal.'
              : 'Try adjusting your search or filters.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((student) => (
            <div
              key={student.id}
              className="bg-white rounded-xl border border-border overflow-hidden transition-all"
            >
              {/* Row */}
              <button
                onClick={() => setExpandedId(expandedId === student.id ? null : student.id)}
                className="w-full px-5 py-4 flex items-center gap-4 text-left hover:bg-sage/5 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-sage/20 flex items-center justify-center shrink-0">
                  <span className="text-forest font-semibold text-sm">
                    {student.name?.charAt(0)?.toUpperCase() || '?'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-body font-semibold text-text truncate">{student.name}</p>
                  <p className="font-body text-xs text-text-muted truncate">
                    {student.parentName} · {student.parentEmail}
                  </p>
                </div>
                <span className="hidden sm:inline-block text-xs font-body text-text-muted">
                  {TRACK_LABELS[student.programTrack] || student.programTrack}
                </span>
                <span className="hidden sm:inline-block text-xs font-body text-text-muted">
                  Grade {student.grade}
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[student.enrollmentStatus] || 'bg-gray-100'}`}>
                  {STATUS_LABELS[student.enrollmentStatus] || student.enrollmentStatus}
                </span>
                <svg className={`w-4 h-4 text-text-muted transition-transform ${expandedId === student.id ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Expanded Detail */}
              {expandedId === student.id && (
                <div className="px-5 pb-5 border-t border-border pt-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-body text-xs font-semibold text-text-muted uppercase mb-2">Student Info</h3>
                      <div className="space-y-1.5 text-sm font-body">
                        <p><span className="text-text-muted">Name:</span> {student.name}</p>
                        <p><span className="text-text-muted">DOB:</span> {student.dateOfBirth || '—'}</p>
                        <p><span className="text-text-muted">Grade:</span> {student.grade || '—'}</p>
                        <p><span className="text-text-muted">District:</span> {student.district || '—'}</p>
                        <p><span className="text-text-muted">Program:</span> {TRACK_LABELS[student.programTrack] || '—'}</p>
                        {student.medicalNotes && (
                          <p><span className="text-text-muted">Medical Notes:</span> {student.medicalNotes}</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="font-body text-xs font-semibold text-text-muted uppercase mb-2">Parent Info</h3>
                      <div className="space-y-1.5 text-sm font-body">
                        <p><span className="text-text-muted">Name:</span> {student.parentName}</p>
                        <p><span className="text-text-muted">Email:</span> {student.parentEmail}</p>
                      </div>

                      <h3 className="font-body text-xs font-semibold text-text-muted uppercase mt-4 mb-2">Emergency Contacts</h3>
                      {student.emergencyContacts?.length ? (
                        <div className="space-y-1.5 text-sm font-body">
                          {student.emergencyContacts.map((ec, i) => (
                            <p key={i}>{ec.name} ({ec.relationship}) — {ec.phone}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-text-muted font-body">No emergency contacts on file</p>
                      )}
                    </div>
                  </div>

                  {/* Status + IEP Actions */}
                  <div className="mt-4 pt-4 border-t border-border flex flex-wrap items-center gap-3">
                    <label className="text-xs font-body font-semibold text-text-muted">Update Status:</label>
                    <select
                      value={student.enrollmentStatus}
                      onChange={(e) =>
                        handleStatusChange(student.parentId, student.id, e.target.value as EnrollmentStatus)
                      }
                      className="form-input w-auto text-sm"
                    >
                      {Object.entries(STATUS_LABELS).map(([val, label]) => (
                        <option key={val} value={val}>{label}</option>
                      ))}
                    </select>
                    {student.iepDocumentUrl && (
                      <a
                        href={student.iepDocumentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm font-body text-forest underline hover:text-forest/80"
                      >
                        📄 View IEP Document
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          <p className="text-center text-xs text-text-muted font-body mt-4">
            Showing {filtered.length} of {students.length} students
          </p>
        </div>
      )}
    </div>
  )
}
