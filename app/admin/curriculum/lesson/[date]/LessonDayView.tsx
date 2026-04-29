'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Lesson,
  LessonSection,
  PROGRAM_DATES,
  classifySection,
} from '@/lib/curriculum-lessons-types'
import { getAllStudents, Student } from '@/lib/student-service'
import {
  AttendanceRecord,
  getAttendanceForDate,
} from '@/lib/attendance-service'
import MarkdownView from '@/components/admin/MarkdownView'

interface LessonDayViewProps {
  lesson: Lesson
}

const SECTION_GROUPS: { id: 'morning' | 'math' | 'reading' | 'enrichment' | 'pickup' | 'materials' | 'notes' | 'schedule' | 'other'; label: string; emoji: string; color: string }[] = [
  { id: 'schedule',   label: 'Daily Schedule',         emoji: '🕘', color: 'bg-cream-deep' },
  { id: 'morning',    label: 'Morning Routine',        emoji: '☀️', color: 'bg-sage-pale/60' },
  { id: 'math',       label: 'Math Block',             emoji: '🔢', color: 'bg-white' },
  { id: 'reading',    label: 'Literacy / Reading & Writing', emoji: '📖', color: 'bg-white' },
  { id: 'enrichment', label: 'Enrichment',             emoji: '🌍', color: 'bg-sage-pale/40' },
  { id: 'pickup',     label: 'Parent Pickup / Notes',  emoji: '📣', color: 'bg-amber-light/40' },
  { id: 'materials',  label: 'Materials',              emoji: '📦', color: 'bg-cream-deep' },
  { id: 'notes',      label: 'Teacher Notes',          emoji: '📝', color: 'bg-white' },
  { id: 'other',      label: 'Other',                  emoji: '·',  color: 'bg-white' },
]

function formatLong(dateISO: string): string {
  const d = new Date(dateISO + 'T00:00:00')
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function statusBadge(record: AttendanceRecord | undefined): { label: string; cls: string } {
  if (!record) return { label: '—', cls: 'bg-gray-100 text-gray-500' }
  switch (record.status) {
    case 'present':         return { label: '✓ Present',  cls: 'bg-green-100 text-green-700' }
    case 'absent':          return { label: '✕ Absent',   cls: 'bg-red-100 text-red-700' }
    case 'late-arrival':    return { label: '⏰ Late',     cls: 'bg-amber-100 text-amber-700' }
    case 'early-dismissal': return { label: '🚪 Early',    cls: 'bg-amber-100 text-amber-700' }
  }
}

function lessonHref(date: string): string {
  return `/admin/curriculum/lesson/${date}`
}

export default function LessonDayView({ lesson }: LessonDayViewProps) {
  const router = useRouter()
  const [today, setToday] = useState<string>('')
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setToday(todayISO())
  }, [])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getAllStudents(), getAttendanceForDate(lesson.date)])
      .then(([stu, att]) => {
        if (cancelled) return
        const enrolled = stu.filter((s) => s.enrollmentStatus === 'deposited' || s.enrollmentStatus === 'enrolled')
        setStudents(enrolled)
        const map: Record<string, AttendanceRecord> = {}
        for (const r of att) map[r.studentId] = r
        setAttendance(map)
      })
      .catch((err) => console.error('Failed to load roster/attendance:', err))
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [lesson.date])

  const groupedSections = useMemo(() => {
    const map = new Map<string, LessonSection[]>()
    for (const s of lesson.sections) {
      const role = classifySection(s.heading)
      if (!map.has(role)) map.set(role, [])
      map.get(role)!.push(s)
    }
    return map
  }, [lesson])

  const currentIndex = PROGRAM_DATES.indexOf(lesson.date)
  const prevDate = currentIndex > 0 ? PROGRAM_DATES[currentIndex - 1] : null
  const nextDate = currentIndex >= 0 && currentIndex < PROGRAM_DATES.length - 1 ? PROGRAM_DATES[currentIndex + 1] : null
  const todayInProgram = today && PROGRAM_DATES.includes(today)
  const isViewingToday = today === lesson.date

  const onDateInputChange = (v: string) => {
    if (!v) return
    if (PROGRAM_DATES.includes(v)) {
      router.push(lessonHref(v))
      return
    }
    const targetTime = new Date(v).getTime()
    let nearest = PROGRAM_DATES[0]
    let nearestDelta = Math.abs(new Date(nearest).getTime() - targetTime)
    for (const d of PROGRAM_DATES) {
      const delta = Math.abs(new Date(d).getTime() - targetTime)
      if (delta < nearestDelta) { nearest = d; nearestDelta = delta }
    }
    router.push(lessonHref(nearest))
  }

  return (
    <div className="max-w-3xl mx-auto pb-20">
      <div className="mb-4">
        <Link href="/admin/curriculum" className="text-xs text-text-muted hover:text-forest transition-colors">
          ← All curriculum
        </Link>
      </div>

      <div className="bg-white rounded-2xl border border-border p-4 mb-6 sticky top-16 z-30">
        <div className="flex items-center justify-between gap-2">
          {prevDate ? (
            <Link
              href={lessonHref(prevDate)}
              className="h-12 px-3 rounded-xl border border-border text-text-muted hover:bg-sage-pale font-body text-sm flex items-center"
              aria-label="Previous day"
            >
              ← Prev
            </Link>
          ) : (
            <span className="h-12 px-3 rounded-xl border border-border text-text-muted opacity-30 font-body text-sm flex items-center cursor-not-allowed">
              ← Prev
            </span>
          )}
          <div className="flex-1 text-center min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-text-muted font-semibold">
              {isViewingToday ? 'Today' : formatLong(lesson.date).split(', ')[0]}
            </p>
            <p className="font-display font-bold text-base text-forest truncate">
              {formatLong(lesson.date)}
            </p>
            <p className="text-xs text-text-muted">
              Day {lesson.programDayNumber} of program · Week {lesson.weekNumber} {lesson.dayLabel}
            </p>
          </div>
          {nextDate ? (
            <Link
              href={lessonHref(nextDate)}
              className="h-12 px-3 rounded-xl border border-border text-text-muted hover:bg-sage-pale font-body text-sm flex items-center"
              aria-label="Next day"
            >
              Next →
            </Link>
          ) : (
            <span className="h-12 px-3 rounded-xl border border-border text-text-muted opacity-30 font-body text-sm flex items-center cursor-not-allowed">
              Next →
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-3">
          <input
            type="date"
            min={PROGRAM_DATES[0]}
            max={PROGRAM_DATES[PROGRAM_DATES.length - 1]}
            defaultValue={lesson.date}
            onChange={(e) => onDateInputChange(e.target.value)}
            className="form-input flex-1 h-11 text-sm"
          />
          {todayInProgram && !isViewingToday && (
            <Link
              href={lessonHref(today)}
              className="h-11 px-4 rounded-xl bg-forest text-white text-sm font-body font-semibold hover:bg-forest-mid flex items-center"
            >
              Today
            </Link>
          )}
        </div>
      </div>

      <div className="mb-6">
        <p className="text-xs uppercase tracking-wider text-forest-light font-semibold">
          Week {lesson.weekNumber} · {lesson.dayLabel}
        </p>
        <h1 className="font-display font-bold text-forest text-2xl md:text-3xl mt-1">
          {lesson.subtitle || lesson.title}
        </h1>
        {lesson.miniTheme && (
          <p className="font-body text-sm text-text-muted italic mt-1">{lesson.miniTheme}</p>
        )}
        {lesson.keyAssessments && (
          <div className="mt-3 bg-amber-light/60 rounded-xl px-4 py-2.5 text-sm">
            <span className="font-semibold text-text">Key today:</span>{' '}
            <span className="text-text-muted">{lesson.keyAssessments}</span>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {SECTION_GROUPS.map((group) => {
          const items = groupedSections.get(group.id)
          if (!items?.length) return null
          return (
            <div key={group.id} className={`${group.color} rounded-2xl border border-border overflow-hidden`}>
              <div className="w-full flex items-center gap-3 px-5 py-4 text-left">
                <span className="text-xl">{group.emoji}</span>
                <span className="font-display font-bold text-text text-base flex-1">
                  {group.label}
                </span>
                <span className="text-xs text-text-muted">
                  {items.length} {items.length === 1 ? 'block' : 'blocks'}
                </span>
              </div>
              <div className="px-5 pb-5 border-t border-border/40 pt-4 space-y-5">
                {items.map((s, idx) => (
                  <div key={`${group.id}-${idx}`}>
                    <h3 className="font-display font-bold text-forest text-lg mb-2">
                      {s.heading}
                    </h3>
                    <MarkdownView markdown={s.content} />
                  </div>
                ))}
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-forest text-xl">Cohort roster</h2>
          <span className="text-xs text-text-muted">
            {students.length} enrolled · max 6
          </span>
        </div>
        {loading ? (
          <div className="space-y-2">
            {[1,2,3].map((i) => (
              <div key={i} className="h-16 bg-white rounded-xl border border-border animate-pulse" />
            ))}
          </div>
        ) : students.length === 0 ? (
          <div className="bg-white rounded-2xl border border-border p-8 text-center">
            <p className="text-sm text-text-muted">
              No enrolled students yet. Move a student to <span className="font-semibold">Enrolled</span> in the{' '}
              <Link href="/admin/students" className="text-forest underline">Students</Link> page to see them here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {students.map((student) => {
              const record = attendance[student.id]
              const badge = statusBadge(record)
              return (
                <Link
                  key={student.id}
                  href={`/admin/attendance?date=${lesson.date}&studentId=${student.id}&parentId=${student.parentId}`}
                  className="bg-white rounded-2xl border border-border p-4 flex items-center gap-3 hover:border-forest hover:shadow-sm transition-all"
                >
                  <div className="w-12 h-12 rounded-full bg-sage flex items-center justify-center shrink-0 text-forest font-display font-bold">
                    {student.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-body font-semibold text-text truncate">{student.name}</p>
                    <p className="text-xs text-text-muted truncate">
                      Grade {student.grade} · {student.parentName}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    <span className={`text-[11px] font-body font-semibold px-2.5 py-1 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                    {record?.flags?.length ? (
                      <span className="text-[10px] text-text-muted">
                        {record.flags.length} flag{record.flags.length === 1 ? '' : 's'}
                      </span>
                    ) : null}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
        <p className="text-xs text-text-muted mt-3 text-center">
          Tap a student to mark attendance and capture flags.
        </p>
      </div>
    </div>
  )
}
