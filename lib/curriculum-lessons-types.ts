// Client-safe types and pure functions for curriculum lessons.
// File-system access lives in curriculum-lessons.ts (server only).

export type DayKey = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday'

export interface LessonSection {
  heading: string
  level: number
  content: string
}

export interface Lesson {
  weekNumber: number
  dayKey: DayKey
  dayLabel: string
  realWeekdayLabel: string
  date: string
  programDayNumber: number
  title: string
  subtitle: string
  miniTheme: string
  keyAssessments: string
  rawMarkdown: string
  sections: LessonSection[]
}

export const PROGRAM_START = '2026-07-07'
export const PROGRAM_END = '2026-08-15'
export const SHOWCASE_DAY = '2026-08-15'

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
