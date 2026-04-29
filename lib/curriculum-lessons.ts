// Server-side curriculum lesson loader.
// Reads markdown files from /curriculum/week-N/{day}.md at build time and
// returns structured sections. Used by /admin/curriculum/today to serve the
// 30-day lesson plan as static content.
//
// Strategy: server-side fs reads (no new dependencies). Custom lightweight
// markdown-to-tokens parser handles only what the curriculum files use:
// H3-H5, paragraphs, bullet/numbered lists, tables, bold, italic, code.
// Renderer lives in components/admin/MarkdownView.tsx (client).
//
// IMPORTANT: types and pure helpers are re-exported from
// './curriculum-lessons-types' so client components can import without pulling
// `fs` into the browser bundle.
//
// Date mapping: 30 curriculum lesson files map sequentially to 30 program days.
// Program window: Tue Jul 7 2026 -> Sat Aug 15 2026 (29 weekdays + Saturday
// showcase). Curriculum filenames (monday..friday) are ordered lesson slots,
// not real weekday names — Week 1 begins on a Tuesday and the labels lag real
// weekdays by 1 day for weeks 1-5. Day 30 (week-6/friday.md) is the Saturday
// showcase event for families.

import fs from 'fs'
import path from 'path'
import {
  DayKey,
  Lesson,
  LessonSection,
  PROGRAM_END,
  PROGRAM_START,
  SHOWCASE_DAY,
} from './curriculum-lessons-types'

export type { DayKey, Lesson, LessonSection } from './curriculum-lessons-types'
export {
  PROGRAM_END,
  PROGRAM_START,
  SHOWCASE_DAY,
  classifySection,
  programWindowState,
} from './curriculum-lessons-types'
export type { SectionRole } from './curriculum-lessons-types'

const DAY_KEYS: DayKey[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']

function buildSchoolDays(): { date: string; weekdayLabel: string }[] {
  const days: { date: string; weekdayLabel: string }[] = []
  const start = new Date(PROGRAM_START + 'T00:00:00')
  const end = new Date(PROGRAM_END + 'T00:00:00')
  const labels = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dow = d.getDay()
    const iso = d.toISOString().slice(0, 10)
    if (dow >= 1 && dow <= 5) {
      days.push({ date: iso, weekdayLabel: labels[dow] })
    } else if (iso === SHOWCASE_DAY) {
      days.push({ date: iso, weekdayLabel: labels[dow] })
    }
  }
  return days
}

interface DateMapping {
  weekNumber: number
  dayKey: DayKey
  dayLabel: string
  realWeekdayLabel: string
  date: string
  programDayNumber: number
}

function buildSchedule(): DateMapping[] {
  const schoolDays = buildSchoolDays()
  const mappings: DateMapping[] = []
  let i = 0
  for (let w = 1; w <= 6; w++) {
    for (const dayKey of DAY_KEYS) {
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
}

export const PROGRAM_SCHEDULE: DateMapping[] = buildSchedule()

const CURRICULUM_DIR = path.join(process.cwd(), 'curriculum')

function parseSections(markdown: string): LessonSection[] {
  const lines = markdown.split('\n')
  const sections: LessonSection[] = []
  let current: LessonSection | null = null
  let seenFirstH3 = false

  for (const line of lines) {
    const h3Match = /^###\s+(.+?)\s*$/.exec(line)

    if (h3Match) {
      if (current) sections.push(current)
      current = { heading: h3Match[1].trim(), level: 3, content: '' }
      seenFirstH3 = true
    } else if (seenFirstH3 && current) {
      current.content += line + '\n'
    }
  }
  if (current) sections.push(current)

  return sections.map((s) => ({ ...s, content: s.content.trim() }))
}

function extractMeta(markdown: string): { title: string; subtitle: string; miniTheme: string; keyAssessments: string } {
  const titleMatch = /^#\s+(.+?)$/m.exec(markdown)
  const subtitleMatch = /^##\s+(.+?)$/m.exec(markdown)
  const miniThemeMatch = /\*\*Mini-Theme\*\*:\s*(.+?)$/m.exec(markdown)
  const assessmentsMatch = /\*\*Key (?:Assessments? Today|Focus Today|Skills Today)\*\*:\s*(.+?)$/m.exec(markdown)

  return {
    title: titleMatch?.[1]?.trim() ?? '',
    subtitle: subtitleMatch?.[1]?.trim().replace(/^"|"$/g, '') ?? '',
    miniTheme: miniThemeMatch?.[1]?.trim() ?? '',
    keyAssessments: assessmentsMatch?.[1]?.trim() ?? '',
  }
}

export function loadLesson(weekNumber: number, dayKey: DayKey): Lesson | null {
  const filePath = path.join(CURRICULUM_DIR, `week-${weekNumber}`, `${dayKey}.md`)
  if (!fs.existsSync(filePath)) return null

  const raw = fs.readFileSync(filePath, 'utf8')
  const meta = extractMeta(raw)
  const sections = parseSections(raw)
  const mapping = PROGRAM_SCHEDULE.find((m) => m.weekNumber === weekNumber && m.dayKey === dayKey)
  if (!mapping) return null

  return {
    weekNumber,
    dayKey,
    dayLabel: mapping.dayLabel,
    realWeekdayLabel: mapping.realWeekdayLabel,
    date: mapping.date,
    programDayNumber: mapping.programDayNumber,
    rawMarkdown: raw,
    sections,
    ...meta,
  }
}

export function loadAllLessons(): Lesson[] {
  const lessons: Lesson[] = []
  for (const mapping of PROGRAM_SCHEDULE) {
    const lesson = loadLesson(mapping.weekNumber, mapping.dayKey)
    if (lesson) lessons.push(lesson)
  }
  return lessons
}

export function findLessonForDate(dateISO: string, lessons: Lesson[]): Lesson | null {
  return lessons.find((l) => l.date === dateISO) ?? null
}

export function loadMaterialsForWeek(weekNumber: number): { fileName: string; content: string }[] {
  const dir = path.join(CURRICULUM_DIR, `week-${weekNumber}`, 'materials')
  if (!fs.existsSync(dir)) return []
  const entries = fs.readdirSync(dir, { withFileTypes: true })
  const result: { fileName: string; content: string }[] = []
  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const content = fs.readFileSync(path.join(dir, entry.name), 'utf8')
      result.push({ fileName: entry.name, content })
    }
  }
  return result.sort((a, b) => a.fileName.localeCompare(b.fileName))
}
