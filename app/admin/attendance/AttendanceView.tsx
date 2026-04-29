'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { getAllStudents, Student } from '@/lib/student-service'
import {
  AttendanceRecord,
  AttendanceStatus,
  BehavioralFlag,
  FLAG_LABELS,
  STATUS_OPTIONS,
  getAttendanceForDate,
  upsertAttendance,
} from '@/lib/attendance-service'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function formatLong(iso: string): string {
  const d = new Date(iso + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

const FLAG_TONE_CLASSES: Record<'good' | 'warn' | 'alert' | 'info', { selected: string; idle: string }> = {
  good:  { selected: 'bg-sage-pale border-forest text-forest',         idle: 'bg-white border-border text-text-muted hover:border-forest-light' },
  warn:  { selected: 'bg-amber-light border-amber text-amber',         idle: 'bg-white border-border text-text-muted hover:border-amber' },
  alert: { selected: 'bg-red-100 border-red-500 text-red-700',         idle: 'bg-white border-border text-text-muted hover:border-red-400' },
  info:  { selected: 'bg-cream-deep border-forest text-forest',        idle: 'bg-white border-border text-text-muted hover:border-forest' },
}

export default function AttendanceView() {
  const params = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const initialDate = params.get('date') || todayISO()
  const initialStudentId = params.get('studentId') || ''

  const [date, setDate] = useState(initialDate)
  const [students, setStudents] = useState<Student[]>([])
  const [byStudentId, setByStudentId] = useState<Record<string, AttendanceRecord>>({})
  const [activeStudentId, setActiveStudentId] = useState(initialStudentId)
  const [loading, setLoading] = useState(true)
  const [savingStudentId, setSavingStudentId] = useState<string | null>(null)

  // Fetch enrolled roster + attendance for selected date.
  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const [stu, att] = await Promise.all([getAllStudents(), getAttendanceForDate(date)])
      const enrolled = stu.filter((s) => s.enrollmentStatus === 'deposited' || s.enrollmentStatus === 'enrolled')
      setStudents(enrolled)
      const map: Record<string, AttendanceRecord> = {}
      for (const r of att) map[r.studentId] = r
      setByStudentId(map)
      // Auto-select first student if no selection or invalid selection.
      if (!enrolled.find((s) => s.id === activeStudentId)) {
        setActiveStudentId(enrolled[0]?.id ?? '')
      }
    } catch (err) {
      console.error('Failed to load attendance roster:', err)
    } finally {
      setLoading(false)
    }
  }, [date, activeStudentId])

  useEffect(() => {
    refresh()
  // refresh handles its own deps; we want this to run when date changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [date])

  const activeStudent = useMemo(() => students.find((s) => s.id === activeStudentId), [students, activeStudentId])
  const activeRecord = activeStudentId ? byStudentId[activeStudentId] : undefined

  const persist = useCallback(async (
    student: Student,
    patch: Partial<AttendanceRecord>
  ) => {
    if (!user) return
    setSavingStudentId(student.id)
    try {
      const next = await upsertAttendance({
        date,
        studentId: student.id,
        studentName: student.name,
        parentId: student.parentId,
        createdBy: user.uid,
        status: patch.status,
        arrivalTime: patch.arrivalTime,
        departureTime: patch.departureTime,
        flags: patch.flags,
        notes: patch.notes,
        parentVisibleNote: patch.parentVisibleNote,
      })
      setByStudentId((prev) => ({ ...prev, [student.id]: next }))
    } catch (err) {
      console.error('Failed to save attendance:', err)
      alert('Could not save. Check your connection and try again.')
    } finally {
      setSavingStudentId(null)
    }
  }, [date, user])

  const handleStatus = (status: AttendanceStatus) => {
    if (!activeStudent) return
    const current = byStudentId[activeStudent.id]
    persist(activeStudent, {
      status,
      flags: current?.flags ?? [],
      arrivalTime: current?.arrivalTime ?? '',
      departureTime: current?.departureTime ?? '',
      notes: current?.notes ?? '',
      parentVisibleNote: current?.parentVisibleNote ?? '',
    })
  }

  const handleFlagToggle = (flag: BehavioralFlag) => {
    if (!activeStudent) return
    const current = byStudentId[activeStudent.id]
    const flags = current?.flags ?? []
    const next = flags.includes(flag) ? flags.filter((f) => f !== flag) : [...flags, flag]
    persist(activeStudent, {
      status: current?.status ?? 'present',
      flags: next,
      arrivalTime: current?.arrivalTime ?? '',
      departureTime: current?.departureTime ?? '',
      notes: current?.notes ?? '',
      parentVisibleNote: current?.parentVisibleNote ?? '',
    })
  }

  const handleNotesBlur = (field: 'notes' | 'parentVisibleNote', value: string) => {
    if (!activeStudent) return
    const current = byStudentId[activeStudent.id]
    if ((current?.[field] ?? '') === value) return
    persist(activeStudent, {
      status: current?.status ?? 'present',
      flags: current?.flags ?? [],
      arrivalTime: current?.arrivalTime ?? '',
      departureTime: current?.departureTime ?? '',
      notes: field === 'notes' ? value : (current?.notes ?? ''),
      parentVisibleNote: field === 'parentVisibleNote' ? value : (current?.parentVisibleNote ?? ''),
    })
  }

  const handleTimeBlur = (field: 'arrivalTime' | 'departureTime', value: string) => {
    if (!activeStudent) return
    const current = byStudentId[activeStudent.id]
    if ((current?.[field] ?? '') === value) return
    persist(activeStudent, {
      status: current?.status ?? 'present',
      flags: current?.flags ?? [],
      arrivalTime: field === 'arrivalTime' ? value : (current?.arrivalTime ?? ''),
      departureTime: field === 'departureTime' ? value : (current?.departureTime ?? ''),
      notes: current?.notes ?? '',
      parentVisibleNote: current?.parentVisibleNote ?? '',
    })
  }

  const presentCount = students.filter((s) => byStudentId[s.id]?.status === 'present').length
  const absentCount = students.filter((s) => byStudentId[s.id]?.status === 'absent').length
  const flaggedCount = students.filter((s) => byStudentId[s.id]?.flags?.length).length
  const captured = students.filter((s) => byStudentId[s.id]).length

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <Link href="/admin/curriculum/today" className="text-xs text-text-muted hover:text-forest">
            ← Today's plan
          </Link>
          <h1 className="font-display font-bold text-forest text-2xl mt-2">Attendance</h1>
        </div>
      </div>

      {/* Date + summary */}
      <div className="bg-white rounded-2xl border border-border p-4 mb-5 flex flex-wrap gap-3 items-center sticky top-16 z-30">
        <input
          type="date"
          value={date}
          onChange={(e) => {
            setDate(e.target.value)
            const sp = new URLSearchParams(params.toString())
            sp.set('date', e.target.value)
            router.replace(`/admin/attendance?${sp.toString()}`)
          }}
          className="form-input h-11 text-sm"
        />
        <div className="text-xs text-text-muted">
          <p className="font-display font-bold text-base text-forest">{formatLong(date)}</p>
          <p>{captured} of {students.length} captured · {presentCount} present · {absentCount} absent · {flaggedCount} flagged</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Roster */}
        <aside className="md:col-span-1 space-y-2">
          {loading ? (
            [1,2,3].map((i) => <div key={i} className="h-16 bg-white rounded-xl border border-border animate-pulse" />)
          ) : students.length === 0 ? (
            <div className="bg-white rounded-2xl border border-border p-6 text-center">
              <p className="text-sm text-text-muted">No enrolled students.</p>
              <Link href="/admin/students" className="text-forest text-sm font-semibold underline mt-2 inline-block">
                Manage roster
              </Link>
            </div>
          ) : (
            students.map((student) => {
              const record = byStudentId[student.id]
              const active = student.id === activeStudentId
              return (
                <button
                  key={student.id}
                  onClick={() => setActiveStudentId(student.id)}
                  className={`w-full text-left bg-white rounded-2xl border-2 p-4 flex items-center gap-3 transition-all ${
                    active ? 'border-forest shadow-sm' : 'border-border hover:border-forest-light'
                  }`}
                >
                  <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center shrink-0 text-forest font-display font-bold">
                    {student.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-text truncate">{student.name}</p>
                    <p className="text-xs text-text-muted truncate">Grade {student.grade}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {record ? <StatusPill status={record.status} /> : <span className="text-xs text-text-muted">—</span>}
                    {record?.flags?.length ? (
                      <span className="text-[10px] text-text-muted">{record.flags.length} flag{record.flags.length === 1 ? '' : 's'}</span>
                    ) : null}
                  </div>
                </button>
              )
            })
          )}
        </aside>

        {/* Detail */}
        <section className="md:col-span-2">
          {!activeStudent ? (
            <div className="bg-white rounded-2xl border border-border p-8 text-center">
              <p className="text-sm text-text-muted">Select a student from the roster to capture attendance.</p>
            </div>
          ) : (
            <div className="space-y-5">
              <div className="bg-white rounded-2xl border border-border p-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-full bg-sage flex items-center justify-center shrink-0 text-forest font-display font-bold text-xl">
                    {activeStudent.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-display font-bold text-forest text-xl truncate">{activeStudent.name}</p>
                    <p className="text-xs text-text-muted truncate">
                      Grade {activeStudent.grade} · Parent: {activeStudent.parentName}
                    </p>
                  </div>
                  {savingStudentId === activeStudent.id && (
                    <span className="text-xs text-forest-light font-body animate-pulse">Saving…</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-display font-bold text-text text-sm mb-3 uppercase tracking-wider">Status</h3>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((opt) => {
                    const active = activeRecord?.status === opt.value
                    return (
                      <button
                        key={opt.value}
                        onClick={() => handleStatus(opt.value)}
                        className={`h-14 rounded-2xl border-2 px-3 text-base font-body font-semibold transition-all ${
                          active ? 'bg-forest text-white border-forest' : 'bg-white text-text border-border hover:border-forest'
                        }`}
                      >
                        <span className="text-xl mr-2">{opt.emoji}</span>
                        {opt.label}
                      </button>
                    )
                  })}
                </div>

                {/* Times for partial-day statuses */}
                {(activeRecord?.status === 'late-arrival' || activeRecord?.status === 'early-dismissal') && (
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <label className="flex flex-col gap-1 text-xs font-semibold text-text-muted">
                      Arrival
                      <input
                        type="time"
                        defaultValue={activeRecord?.arrivalTime ?? ''}
                        onBlur={(e) => handleTimeBlur('arrivalTime', e.target.value)}
                        className="form-input h-11 text-sm"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-xs font-semibold text-text-muted">
                      Departure
                      <input
                        type="time"
                        defaultValue={activeRecord?.departureTime ?? ''}
                        onBlur={(e) => handleTimeBlur('departureTime', e.target.value)}
                        className="form-input h-11 text-sm"
                      />
                    </label>
                  </div>
                )}
              </div>

              {/* Flags */}
              <div className="bg-white rounded-2xl border border-border p-5">
                <h3 className="font-display font-bold text-text text-sm mb-1 uppercase tracking-wider">Flags</h3>
                <p className="text-xs text-text-muted mb-3">Tap to toggle. Multiple allowed.</p>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(FLAG_LABELS) as BehavioralFlag[]).map((flag) => {
                    const meta = FLAG_LABELS[flag]
                    const active = !!activeRecord?.flags?.includes(flag)
                    const cls = FLAG_TONE_CLASSES[meta.tone]
                    return (
                      <button
                        key={flag}
                        onClick={() => handleFlagToggle(flag)}
                        className={`h-14 rounded-2xl border-2 px-3 text-sm font-body font-semibold transition-all ${active ? cls.selected : cls.idle}`}
                      >
                        <span className="text-lg mr-2">{meta.emoji}</span>
                        {meta.label}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Parent-visible note */}
              <div className="bg-amber-light/40 rounded-2xl border border-amber/30 p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-text text-sm uppercase tracking-wider">Parent-visible note</h3>
                  <span className="text-[10px] uppercase tracking-wider text-amber font-semibold">Shared</span>
                </div>
                <p className="text-xs text-text-muted mb-3">Parents will see this in their portal. Keep it brief and constructive.</p>
                <textarea
                  defaultValue={activeRecord?.parentVisibleNote ?? ''}
                  onBlur={(e) => handleNotesBlur('parentVisibleNote', e.target.value)}
                  placeholder='e.g. "Strong morning literacy block. Asked for a fidget — helped."'
                  rows={3}
                  className="form-input w-full text-sm"
                />
              </div>

              {/* Instructor private note */}
              <div className="bg-cream-deep rounded-2xl border border-border p-5">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-display font-bold text-text text-sm uppercase tracking-wider">Instructor note</h3>
                  <span className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">Private</span>
                </div>
                <p className="text-xs text-text-muted mb-3">For your records only. Not shown to parents.</p>
                <textarea
                  defaultValue={activeRecord?.notes ?? ''}
                  onBlur={(e) => handleNotesBlur('notes', e.target.value)}
                  placeholder="Observations, IEP-goal progress, regrouping notes…"
                  rows={4}
                  className="form-input w-full text-sm"
                />
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

function StatusPill({ status }: { status: AttendanceStatus }) {
  const map: Record<AttendanceStatus, { label: string; cls: string }> = {
    present:         { label: '✓',  cls: 'bg-green-100 text-green-700' },
    absent:          { label: '✕',  cls: 'bg-red-100 text-red-700' },
    'late-arrival':  { label: '⏰',  cls: 'bg-amber-100 text-amber-700' },
    'early-dismissal':{ label: '🚪', cls: 'bg-amber-100 text-amber-700' },
  }
  const m = map[status]
  return <span className={`text-xs font-body font-semibold w-7 h-7 rounded-full inline-flex items-center justify-center ${m.cls}`}>{m.label}</span>
}
