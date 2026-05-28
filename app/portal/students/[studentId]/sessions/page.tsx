'use client'

import { useCallback, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { useAuth } from '@/lib/auth-context'
import type { Student } from '@/lib/student-service'
import {
  getLessonsForStudent,
  getSparksForStudent,
  type LessonProgressRecord,
  type SparksRecordEntry,
} from '@/lib/ios-progress'

/**
 * Single timeline item merging both lesson + spark records by date.
 * Discriminated union so the renderer can format each kind distinctly
 * without a type guard at every callsite.
 */
type ActivityItem =
  | { kind: 'lesson'; at: Date; record: LessonProgressRecord }
  | { kind: 'spark'; at: Date; record: SparksRecordEntry }

function formatTimestamp(d: Date): string {
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function StudentSessionsPage() {
  const { user } = useAuth()
  const params = useParams<{ studentId: string }>()
  const studentId = params?.studentId

  const [student, setStudent] = useState<Student | null>(null)
  const [lessons, setLessons] = useState<LessonProgressRecord[]>([])
  const [sparks, setSparks] = useState<SparksRecordEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!user || !studentId) return
    setLoading(true)
    setError(null)
    try {
      // Fetch student doc + both subcollections in parallel.
      const [studentSnap, lessonsData, sparksData] = await Promise.all([
        getDoc(doc(db, 'users', user.uid, 'students', studentId)),
        getLessonsForStudent(user.uid, studentId),
        getSparksForStudent(user.uid, studentId),
      ])
      if (studentSnap.exists()) {
        setStudent({ id: studentSnap.id, ...studentSnap.data() } as Student)
      }
      setLessons(lessonsData)
      setSparks(sparksData)
    } catch (err) {
      console.error('[sessions] load failed:', err)
      setError('Could not load iPad activity. Try refreshing the page.')
    } finally {
      setLoading(false)
    }
  }, [user, studentId])

  useEffect(() => {
    load()
  }, [load])

  // Merge lessons + sparks into one descending timeline.
  const timeline: ActivityItem[] = [
    ...lessons.map<ActivityItem>((l) => ({
      kind: 'lesson',
      at: l.lastAttemptAt,
      record: l,
    })),
    ...sparks.map<ActivityItem>((s) => ({
      kind: 'spark',
      at: s.earnedAt,
      record: s,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime())

  const completedCount = lessons.filter((l) => l.isCompleted).length
  const totalSparks = sparks.reduce((acc, s) => acc + s.amount, 0)

  return (
    <main className="min-h-screen bg-cream">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10">
        <Link
          href="/portal"
          className="inline-flex items-center text-sm font-body font-medium text-forest-light hover:text-forest mb-6"
        >
          ← Back to portal
        </Link>

        <header className="mb-8">
          <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-forest-light">
            iPad activity
          </p>
          <h1 className="font-display text-3xl font-semibold text-text mt-1">
            {student?.name ?? 'Loading…'}
          </h1>
        </header>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl bg-cream-deep p-5">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-text-muted">
              Lessons completed
            </p>
            <p className="font-display text-3xl font-semibold text-forest mt-2">
              {loading ? '…' : completedCount}
            </p>
          </div>
          <div className="rounded-xl bg-amber-light p-5">
            <p className="text-[11px] font-body font-semibold uppercase tracking-[0.1em] text-text-muted">
              Sparks earned
            </p>
            <p className="font-display text-3xl font-semibold text-amber mt-2">
              {loading ? '…' : totalSparks}
            </p>
          </div>
        </div>

        {/* Activity timeline */}
        <section>
          <h2 className="font-display text-sm font-semibold text-text-muted uppercase mb-3">
            Recent activity
          </h2>

          {error ? (
            <div className="rounded-xl bg-amber-light p-4 text-sm font-body text-amber">
              {error}
            </div>
          ) : loading ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="h-16 bg-gray-100 rounded-xl animate-pulse"
                />
              ))}
            </div>
          ) : timeline.length === 0 ? (
            <div className="rounded-xl bg-white border border-border p-6 text-center">
              <p className="text-sm font-body text-text-muted">
                No sessions yet. {student?.name ?? 'Your child'} will start
                earning sparks once they begin missions on their iPad.
              </p>
            </div>
          ) : (
            <ul className="space-y-2">
              {timeline.map((item) => (
                <li
                  key={`${item.kind}-${item.record.id}`}
                  className="rounded-xl bg-white border border-border p-4 flex items-start gap-3"
                >
                  {item.kind === 'lesson' ? (
                    <>
                      <span className="shrink-0 text-xs font-body font-semibold bg-sage/30 text-forest px-2.5 py-1 rounded-full">
                        {item.record.category === 'literacy' ? 'Lit' : 'Math'}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-body font-semibold text-text">
                          Level {item.record.levelIndex + 1}
                          {item.record.isCompleted ? ' completed' : ' attempted'}
                        </p>
                        <p className="text-xs font-body text-text-muted mt-0.5">
                          {formatTimestamp(item.at)}
                          {item.record.score > 0 && (
                            <> · {item.record.score} points</>
                          )}
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="shrink-0 text-xs font-body font-semibold bg-amber-light text-amber px-2.5 py-1 rounded-full">
                        +{item.record.amount}
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="font-body font-semibold text-text">
                          {item.record.amount} sparks earned
                        </p>
                        <p className="text-xs font-body text-text-muted mt-0.5">
                          {formatTimestamp(item.at)} · {item.record.reason}
                        </p>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  )
}
