// Client-safe types and pure functions for curriculum lessons.
// File-system access lives in curriculum-lessons.ts (server only).

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export interface LessonSection {
  heading: string
  level: number
  content: string
}

export interface LessonMeta {
  weekNumber: number
  dayKey: DayKey
  dayLabel: string
  realWeekdayLabel: string
  date: string
  programDayNumber: number
  title: string
  subtitle: string
  miniTheme: string
}

export interface Lesson extends LessonMeta {
  keyAssessments: string
  sections: LessonSection[]
}

export const PROGRAM_START = '2026-07-07'
export const PROGRAM_END = '2026-08-15'
export const SHOWCASE_DAY = '2026-08-15'

export interface DateMapping {
  weekNumber: number
  dayKey: DayKey
  dayLabel: string
  realWeekdayLabel: string
  date: string
  programDayNumber: number
}

const DAY_KEYS_INTERNAL: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
const WEEKDAY_LABELS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function buildSchoolDaysClient(): { date: string; weekdayLabel: string }[] {
  const days: { date: string; weekdayLabel: string }[] = []
  const start = new Date(PROGRAM_START + 'T00:00:00')
  const end = new Date(PROGRAM_END + 'T00:00:00')
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    const iso = d.toISOString().slice(0, 10)
    if (dow >= 1 && dow <= 5) {
      days.push({ date: iso, weekdayLabel: WEEKDAY_LABELS[dow] })
    } else if (iso === SHOWCASE_DAY) {
      days.push({ date: iso, weekdayLabel: WEEKDAY_LABELS[dow] })
    }
  }
  return days
}

export const PROGRAM_SCHEDULE: DateMapping[] = (() => {
  const schoolDays = buildSchoolDaysClient()
  const mappings: DateMapping[] = []
  let i = 0
  for (let w = 1; w <= 6; w++) {
    for (const dayKey of DAY_KEYS_INTERNAL) {
      const slot = schoolDays[i]
      if (!slot) break
      mappings.push({
        weekNumber: w,
        dayKey,
        dayLabel: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
        realWeekdayLabel: slot.weekdayLabel,
        date: slot.date,
        programDayNumber: i + 1,
      })
      i++
    }
  }
  return mappings
})()

export const PROGRAM_DATES: string[] = PROGRAM_SCHEDULE.map((m) => m.date)

export function programWindowState(todayISO: string): { state: 'before' | 'during' | 'after'; daysUntilStart?: number } {
  if (todayISO < PROGRAM_START) {
    const today = new Date(todayISO + 'T00:00:00')
    const start = new Date(PROGRAM_START + 'T00:00:00')
    const days = Math.ceil((start.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    return { state: 'before', daysUntilStart: days }
  }
  if (todayISO > PROGRAM_END) return { state: 'after' }
  return { state: 'during' }
}

export type SectionRole =
  | 'morning'
  | 'math'
  | 'reading'
  | 'enrichment'
  | 'snack'
  | 'lunch'
  | 'pickup'
  | 'materials'
  | 'notes'
  | 'schedule'
  | 'other'

export function classifySection(heading: string): SectionRole {
  const h = heading.toLowerCase()
  if (/^daily schedule/.test(h)) return 'schedule'
  if (/morning warm/.test(h)) return 'morning'
  if (/^math/.test(h)) return 'math'
  if (/(reading|writing|literacy|og)/.test(h)) return 'reading'
  if (/enrichment|exploration/.test(h)) return 'enrichment'
  if (/snack/.test(h)) return 'snack'
  if (/lunch/.test(h)) return 'lunch'
  if (/pickup|parent|dismiss|debrief|home note/.test(h)) return 'pickup'
  if (/material/.test(h)) return 'materials'
  if (/(teacher note|reflection|prep|data collection)/.test(h)) return 'notes'
  return 'other'
}
