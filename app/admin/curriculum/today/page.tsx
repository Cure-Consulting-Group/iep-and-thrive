'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { PROGRAM_DATES, PROGRAM_SCHEDULE } from '@/lib/curriculum-lessons-types'

function todayISO(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export default function TodayRedirect() {
  const router = useRouter()

  useEffect(() => {
    const t = todayISO()
    let target: string
    if (PROGRAM_DATES.includes(t)) {
      target = t
    } else if (t < PROGRAM_DATES[0]) {
      target = PROGRAM_DATES[0]
    } else {
      target = PROGRAM_DATES[PROGRAM_DATES.length - 1]
    }
    router.replace(`/admin/curriculum/lesson/${target}`)
  }, [router])

  return (
    <div className="max-w-3xl mx-auto py-16 text-center">
      <p className="text-sm text-text-muted font-body">Loading today's plan…</p>
      <p className="text-xs text-text-muted/60 mt-2">
        Program dates: {PROGRAM_SCHEDULE[0].date} – {PROGRAM_SCHEDULE[PROGRAM_SCHEDULE.length - 1].date}
      </p>
    </div>
  )
}
