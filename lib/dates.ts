// Single source of truth for the Summer 2026 enrollment deadline.
// Per ticket A3, every countdown surface (hero CTA cluster, enrollment form
// header, future emails / drips) derives its numbers from these helpers
// so the cutover from "open" to "waitlist" stays consistent across the site.
//
// Keep this file framework-agnostic: it is imported by client components,
// server components, Cloud Functions, and Playwright tests.

export const ENROLLMENT_DEADLINE = new Date(2026, 4, 30) // May 30, 2026 (local time)
export const ENROLLMENT_DEADLINE_LABEL = "May 30, 2026"

const ONE_DAY_MS = 1000 * 60 * 60 * 24

/**
 * Days until the enrollment deadline, computed in calendar-day units (so
 * timezone clock skew does not subtract a day). Returns 0 on the deadline date
 * itself and negative numbers once it has passed.
 */
export function daysUntilDeadline(now: Date = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const ms = ENROLLMENT_DEADLINE.getTime() - today.getTime()
  return Math.ceil(ms / ONE_DAY_MS)
}

export type CountdownState =
  | { status: "open"; days: number; label: string; deadlineLabel: string }
  | { status: "closed"; days: number; label: string; deadlineLabel: string }

/**
 * Returns the rendered copy + state for the deadline countdown UI. Centralized
 * here so hero / enrollment-form / email surfaces never drift in wording.
 */
export function getEnrollmentCountdown(now: Date = new Date()): CountdownState {
  const days = daysUntilDeadline(now)
  const deadlineLabel = ENROLLMENT_DEADLINE_LABEL
  if (days > 0) {
    const noun = days === 1 ? "day" : "days"
    return {
      status: "open",
      days,
      deadlineLabel,
      label: `Enrollment closes in ${days} ${noun} · ${deadlineLabel}`,
    }
  }
  return {
    status: "closed",
    days,
    deadlineLabel,
    label: `Waitlist only · enrollment closed ${deadlineLabel}`,
  }
}
