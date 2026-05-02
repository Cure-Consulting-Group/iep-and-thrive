'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import { getBookingsByParent, Booking } from '@/lib/booking-service'
import { getReportsByParent, ProgressReport } from '@/lib/report-service'
import { getStudentsByParent, Student } from '@/lib/student-service'
import {
  getWeeklyProgressForStudent,
  WeeklyStudentProgress,
} from '@/lib/portal-progress'
import { getUnreadCount } from '@/lib/notification-service'
import { getUserSubscription } from '@/lib/subscription-service'
import { sessionsRemaining, type SubscriptionState } from '@/lib/subscription'

const STATUS_COLORS: Record<string, string> = {
  inquiry: 'bg-gray-100 text-gray-700',
  discovery: 'bg-blue-100 text-blue-700',
  deposited: 'bg-amber-100 text-amber-700',
  enrolled: 'bg-green-100 text-green-700',
  completed: 'bg-forest text-white',
}

const PROGRAM_TRACK_LABELS: Record<string, string> = {
  reading: 'Reading & Language',
  math: 'Math & Numeracy',
  full: 'Full Academic',
}

function formatNoteDate(iso: string): string {
  // iso is YYYY-MM-DD; render in ET-agnostic local form ("Jul 9")
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return iso
  const dt = new Date(y, m - 1, d)
  return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

interface WeeklyProgressTileProps {
  student: Student
  progress: WeeklyStudentProgress | null
  loading: boolean
}

function WeeklyProgressTile({ student, progress, loading }: WeeklyProgressTileProps) {
  const trackLabel = PROGRAM_TRACK_LABELS[student.programTrack] || student.programTrack

  return (
    <div className="bg-white rounded-2xl border border-border p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="min-w-0">
          <h3 className="font-display text-lg font-bold text-forest truncate">
            {student.name}
          </h3>
          <p className="text-xs font-body text-text-muted mt-0.5">
            {trackLabel} · Grade {student.grade}
          </p>
        </div>
        {progress?.state.phase === 'active' && (
          <span className="shrink-0 text-xs font-body font-semibold bg-sage/30 text-forest px-2.5 py-1 rounded-full">
            Week {progress.state.weekNumber} of 6
          </span>
        )}
        {progress?.state.phase === 'pre' && (
          <span className="shrink-0 text-xs font-body font-semibold bg-amber-light text-amber px-2.5 py-1 rounded-full">
            Starts soon
          </span>
        )}
        {progress?.state.phase === 'post' && (
          <span className="shrink-0 text-xs font-body font-semibold bg-forest text-white px-2.5 py-1 rounded-full">
            Cohort complete
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-4 bg-gray-100 rounded w-2/3 animate-pulse" />
          <div className="h-12 bg-gray-100 rounded animate-pulse" />
        </div>
      ) : !progress ? null : progress.state.phase === 'pre' ? (
        <div className="rounded-xl bg-cream-deep p-4">
          <p className="text-sm font-body text-text">
            <span className="font-semibold text-forest">
              Program starts in {progress.state.daysUntilStart}{' '}
              {progress.state.daysUntilStart === 1 ? 'day' : 'days'}.
            </span>{' '}
            Your first weekly report arrives Friday.
          </p>
        </div>
      ) : progress.state.phase === 'post' ? (
        <div className="rounded-xl bg-cream-deep p-4">
          <p className="text-sm font-body text-text">
            Program complete — final report available below.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Attendance line */}
          <div className="flex items-center justify-between rounded-xl bg-sage/15 px-4 py-3">
            <div>
              <p className="text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                This week
              </p>
              <p className="font-body text-sm text-text mt-0.5">
                <span className="font-display font-bold text-forest text-base">
                  {progress.daysAttended} of {progress.daysExpected}
                </span>{' '}
                days attended
              </p>
            </div>
            <span className="text-2xl" aria-hidden="true">📅</span>
          </div>

          {/* Latest behavioral highlight */}
          {progress.latestNote ? (
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-body font-semibold text-text-muted uppercase tracking-wide mb-1">
                Latest highlight · {formatNoteDate(progress.latestNote.date)}
              </p>
              <p className="text-sm font-body text-text leading-relaxed">
                {progress.latestNote.parentVisibleNote}
              </p>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-border p-4">
              <p className="text-sm font-body text-text-muted">
                No new highlights this week — check back after Friday pickup.
              </p>
            </div>
          )}

          {/* Latest probe (D1: C4 collection) */}
          {progress.latestProbe && (
            <div className="rounded-xl border border-border p-4">
              <p className="text-xs font-body font-semibold text-text-muted uppercase tracking-wide mb-1">
                Latest probe · week {progress.latestProbe.week}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="font-display font-bold text-forest text-lg">
                  {progress.latestProbe.score}
                  {progress.latestProbe.unit ? (
                    <span className="text-sm font-body font-semibold text-text-muted ml-0.5">
                      {progress.latestProbe.unit}
                    </span>
                  ) : null}
                </span>
                <span className="text-sm font-body text-text">
                  {progress.latestProbe.type === 'phonics'
                    ? 'phonics accuracy'
                    : progress.latestProbe.type === 'orf'
                      ? 'oral reading fluency'
                      : progress.latestProbe.type}
                </span>
                {typeof progress.latestProbe.delta === 'number' && progress.latestProbe.delta !== 0 ? (
                  <span
                    className={
                      'text-xs font-body font-semibold px-1.5 py-0.5 rounded-full ' +
                      (progress.latestProbe.delta > 0
                        ? 'bg-sage/30 text-forest'
                        : 'bg-amber-light text-amber')
                    }
                  >
                    {progress.latestProbe.delta > 0 ? '▲' : '▼'} {Math.abs(progress.latestProbe.delta)}
                    {progress.latestProbe.unit || ''}
                  </span>
                ) : null}
              </div>
            </div>
          )}

          {/* Latest portfolio artifact (D1: C7 collection) */}
          {progress.latestArtifact && (
            <Link
              href="/portal/portfolio"
              className="flex items-center gap-3 rounded-xl border border-border p-3 hover:bg-forest/5 transition-colors"
            >
              <div
                className="shrink-0 w-14 h-14 rounded-lg bg-cream-deep bg-cover bg-center"
                style={{
                  backgroundImage: `url('${progress.latestArtifact.thumbUrl || progress.latestArtifact.photoUrl}')`,
                }}
                aria-hidden="true"
              />
              <div className="min-w-0 flex-1">
                <p className="text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Latest artifact · week {progress.latestArtifact.week}
                </p>
                <p className="font-body text-sm text-text mt-0.5 truncate">
                  {progress.latestArtifact.caption || 'View portfolio →'}
                </p>
              </div>
              <span className="text-text-muted" aria-hidden="true">→</span>
            </Link>
          )}

          {/* Latest report link */}
          {progress.latestReport && (
            <Link
              href="/portal/reports"
              className="flex items-center justify-between rounded-xl bg-forest/5 px-4 py-3 hover:bg-forest/10 transition-colors"
            >
              <div>
                <p className="text-xs font-body font-semibold text-text-muted uppercase tracking-wide">
                  Latest report
                </p>
                <p className="font-body text-sm font-semibold text-forest mt-0.5">
                  View week {progress.latestReport.weekNumber} report →
                </p>
              </div>
              <span className="text-xl" aria-hidden="true">📈</span>
            </Link>
          )}

          {/* Full attendance link — placeholder route, see report */}
          <Link
            href={`/portal/attendance?student=${student.id}`}
            className="block text-xs font-body font-semibold text-forest hover:text-forest-mid transition-colors"
          >
            View full attendance history →
          </Link>
        </div>
      )}
    </div>
  )
}

export default function PortalDashboard() {
  const { profile, user } = useAuth()
  const [students, setStudents] = useState<Student[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [reports, setReports] = useState<ProgressReport[]>([])
  const [progress, setProgress] = useState<Record<string, WeeklyStudentProgress>>({})
  const [loading, setLoading] = useState(true)
  const [progressLoading, setProgressLoading] = useState(true)
  const [unreadNotifications, setUnreadNotifications] = useState(0)
  const [photoReleaseSigned, setPhotoReleaseSigned] = useState<null | { signedAt: string; checked: boolean }>(null)
  const [subscription, setSubscription] = useState<SubscriptionState | null>(null)

  const load = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const results = await Promise.allSettled([
      getStudentsByParent(user.uid),
      getBookingsByParent(user.uid),
      getReportsByParent(user.uid),
      getUnreadCount(user.uid),
      getUserSubscription(user.uid),
    ])
    if (results[0].status === 'fulfilled') setStudents(results[0].value)
    else console.error('Failed to load students:', results[0].reason)
    if (results[1].status === 'fulfilled') setBookings(results[1].value)
    else console.error('Failed to load bookings:', results[1].reason)
    if (results[2].status === 'fulfilled') setReports(results[2].value)
    else console.error('Failed to load reports:', results[2].reason)
    if (results[3].status === 'fulfilled') setUnreadNotifications(results[3].value)
    else console.error('Failed to load notifications:', results[3].reason)
    if (results[4].status === 'fulfilled') setSubscription(results[4].value)
    else console.error('Failed to load subscription:', results[4].reason)
    setLoading(false)
  }, [user])

  useEffect(() => { load() }, [load])

  // Probe whether the parent has already signed the B6 photo/video release.
  // Cheap single doc read; surfaces a sticky banner until present.
  useEffect(() => {
    if (!user) return
    let cancelled = false
    ;(async () => {
      try {
        const ref = doc(db, 'users', user.uid, 'legalDocs', 'photoRelease')
        const snap = await getDoc(ref)
        if (cancelled) return
        if (snap.exists()) {
          const data = snap.data() as { signedAt?: string }
          setPhotoReleaseSigned({ signedAt: data.signedAt || '', checked: true })
        } else {
          setPhotoReleaseSigned({ signedAt: '', checked: true })
        }
      } catch (err) {
        console.warn('[portal] photo release probe fell back to null:', err)
        if (!cancelled) setPhotoReleaseSigned({ signedAt: '', checked: true })
      }
    })()
    return () => { cancelled = true }
  }, [user])

  // Load weekly progress per enrolled student once the student list is known.
  useEffect(() => {
    if (!user || students.length === 0) {
      setProgressLoading(false)
      return
    }
    const enrolled = students.filter(
      (s) => s.enrollmentStatus === 'deposited' || s.enrollmentStatus === 'enrolled'
    )
    if (enrolled.length === 0) {
      setProgressLoading(false)
      return
    }
    let cancelled = false
    setProgressLoading(true)
    Promise.all(
      enrolled.map((s) =>
        getWeeklyProgressForStudent(s.id)
          .then((p) => [s.id, p] as const)
          .catch((err) => {
            console.error(`Failed to load progress for ${s.id}:`, err)
            return [s.id, null] as const
          })
      )
    ).then((entries) => {
      if (cancelled) return
      const next: Record<string, WeeklyStudentProgress> = {}
      for (const [id, p] of entries) {
        if (p) next[id] = p
      }
      setProgress(next)
      setProgressLoading(false)
    })
    return () => { cancelled = true }
  }, [user, students])

  const [today, setToday] = useState('')
  useEffect(() => { setToday(new Date().toISOString().split('T')[0]) }, [])
  const upcomingBookings = bookings.filter((b) => b.date >= today && b.status === 'confirmed')
  const nextBooking = upcomingBookings[0]
  const unreadReports = reports.filter((r) => !r.viewedAt).length
  const enrolledStudents = students.filter(
    (s) => s.enrollmentStatus === 'deposited' || s.enrollmentStatus === 'enrolled'
  )

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

      {/* B6 - Photo/video release banner. Shows when an enrolled student has
          no signed release on file. Once signed, swap to a confirmation chip. */}
      {!loading && photoReleaseSigned?.checked && enrolledStudents.length > 0 && !photoReleaseSigned.signedAt && (
        <Link
          href="/portal/photo-release"
          className="mb-6 flex items-center gap-3 rounded-2xl bg-amber-light border border-amber/40 px-5 py-4 hover:bg-amber/20 transition-colors group sticky top-2 z-30"
        >
          <span className="shrink-0 w-9 h-9 rounded-full bg-amber/30 flex items-center justify-center text-lg" aria-hidden>
            📸
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-text">
              Sign your photo/video release
            </p>
            <p className="text-xs font-body text-text-muted mt-0.5">
              Required before any portfolio photos can be captured. About 2 minutes.
            </p>
          </div>
          <span className="text-text-muted group-hover:text-forest transition-colors" aria-hidden>
            →
          </span>
        </Link>
      )}
      {!loading && photoReleaseSigned?.checked && photoReleaseSigned.signedAt && (
        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-sage-pale border border-sage px-3 py-1.5">
          <span className="text-sm" aria-hidden>✓</span>
          <span className="text-xs font-body font-semibold text-forest">
            Photo release signed
            {photoReleaseSigned.signedAt
              ? ' on ' + new Date(photoReleaseSigned.signedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
              : ''}
          </span>
        </div>
      )}

      {!loading && unreadNotifications > 0 && (
        <Link
          href="/portal/notifications"
          className="mb-6 flex items-center gap-3 rounded-2xl bg-amber-light border border-amber/30 px-5 py-4 hover:bg-amber/20 transition-colors group"
        >
          <span className="shrink-0 w-9 h-9 rounded-full bg-amber/20 flex items-center justify-center text-lg" aria-hidden>
            📣
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-body font-semibold text-text">
              {unreadNotifications === 1
                ? '1 new update from your instructor'
                : `${unreadNotifications} new updates from your instructor`}
            </p>
            <p className="text-xs font-body text-text-muted mt-0.5">
              Tap to view and mark as read.
            </p>
          </div>
          <span className="text-text-muted group-hover:text-forest transition-colors" aria-hidden>
            →
          </span>
        </Link>
      )}

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

          {/* This Week's Progress — per enrolled student */}
          {enrolledStudents.length > 0 && (
            <div className="mb-8">
              <h2 className="font-display text-sm font-semibold text-text-muted uppercase mb-3">
                This Week&apos;s Progress
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {enrolledStudents.map((s) => (
                  <WeeklyProgressTile
                    key={s.id}
                    student={s}
                    progress={progress[s.id] || null}
                    loading={progressLoading && !progress[s.id]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Subscription tile — surfaces when an active tutoring sub exists */}
          {subscription && subscription.status === 'active' && (
            <Link
              href="/portal/subscription"
              data-testid="dashboard-subscription-tile"
              className="block bg-white rounded-2xl border border-sage p-5 mb-6 hover:bg-sage/5 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light">
                    Tutoring subscription
                  </p>
                  <p className="font-body font-semibold text-text mt-1">
                    {sessionsRemaining(subscription)} of{' '}
                    {subscription.sessionsAllowedPerCycle} sessions remaining
                  </p>
                  <p className="text-xs font-body text-text-muted">
                    {subscription.tier === 'weekly' ? 'Weekly' : 'Twice-Weekly'} plan ·
                    Manage subscription →
                  </p>
                </div>
                <span className="text-2xl shrink-0" aria-hidden="true">
                  💳
                </span>
              </div>
            </Link>
          )}

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
