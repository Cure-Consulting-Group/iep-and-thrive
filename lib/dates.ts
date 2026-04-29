export const ENROLLMENT_DEADLINE = new Date(2026, 4, 30)

export function daysUntilDeadline(now: Date = new Date()): number {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const ms = ENROLLMENT_DEADLINE.getTime() - today.getTime()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}
