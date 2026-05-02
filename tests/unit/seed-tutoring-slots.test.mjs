// Pure-function tests for scripts/seed-tutoring-slots.mjs planSlots()
//
// Run with: `node tests/unit/seed-tutoring-slots.test.mjs`
//
// Strategy: planSlots is a pure function exported from the seeder and never
// touches Firestore. Importing the module inside Node will not call main()
// because main() guards on `import.meta.url === argv[1]`. Tests verify:
//   - cohort blackout (Jul 7–Aug 14) is honoured
//   - empty days produce no slots
//   - end-time arithmetic wraps within a day correctly
//   - day-of-week maps correctly relative to the start date
//   - slot duration default = 60min

import { test } from 'node:test'
import assert from 'node:assert/strict'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const repoRoot = path.resolve(import.meta.dirname, '..', '..')
const seederUrl = pathToFileURL(
  path.join(repoRoot, 'scripts', 'seed-tutoring-slots.mjs')
).href
const { planSlots } = await import(seederUrl)

// Helpers
function utcDate(iso) {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

const SAMPLE_TEMPLATE = {
  monday: ['16:00', '17:00'],
  tuesday: [],
  wednesday: ['16:00'],
  thursday: [],
  friday: ['15:00'],
  saturday: ['10:00', '11:00'],
  sunday: [],
}

test('planSlots: 1 week from Monday produces expected slot count', () => {
  // 2026-05-11 is a Monday. Week = Mon..Sun (Mon, Tue, Wed, Thu, Fri, Sat, Sun)
  // From SAMPLE_TEMPLATE: 2 + 0 + 1 + 0 + 1 + 2 + 0 = 6 slots
  const { slots } = planSlots({
    startDate: utcDate('2026-05-11'),
    weeks: 1,
    template: SAMPLE_TEMPLATE,
  })
  assert.equal(slots.length, 6)
  // First slot: Monday 16:00
  assert.equal(slots[0].date, '2026-05-11')
  assert.equal(slots[0].startTime, '16:00')
  assert.equal(slots[0].endTime, '17:00')
  assert.equal(slots[0].type, 'tutoring')
  assert.equal(slots[0].isAvailable, true)
  assert.equal(slots[0].bookedBy, null)
  assert.equal(slots[0].duration, 60)
})

test('planSlots: cohort blackout July 7–Aug 14 is skipped', () => {
  // Span entire blackout: start 2026-06-29 (Mon) for 8 weeks → 2026-08-23 (Sun)
  // Days inside blackout: Tue Jul 7 → Fri Aug 14 (39 days)
  const { slots, skippedCohort } = planSlots({
    startDate: utcDate('2026-06-29'),
    weeks: 8,
    template: SAMPLE_TEMPLATE,
  })
  // No slot should fall in the blackout window
  for (const s of slots) {
    assert.ok(
      s.date < '2026-07-07' || s.date > '2026-08-14',
      `slot ${s.date} ${s.startTime} is inside cohort blackout`
    )
  }
  // skippedCohort should record at least the active days (Mon/Wed/Fri/Sat)
  // inside the blackout window
  assert.ok(skippedCohort.length > 0, 'expected skippedCohort to be non-empty')
  // Spot-check: 2026-07-08 (Wed) should be in skippedCohort
  const julEighth = skippedCohort.find((x) => x.date === '2026-07-08')
  assert.ok(julEighth, '2026-07-08 (Wed) should be in skippedCohort')
})

test('planSlots: boundary dates 2026-07-07 (skipped) and 2026-07-06 (kept)', () => {
  const { slots } = planSlots({
    startDate: utcDate('2026-07-06'),
    weeks: 2,
    template: SAMPLE_TEMPLATE,
  })
  // 2026-07-06 is Monday — NOT in blackout (blackout starts 7/7)
  const monSlots = slots.filter((s) => s.date === '2026-07-06')
  assert.equal(monSlots.length, 2, 'Monday 2026-07-06 should have 2 slots')
  // 2026-07-07 IS in blackout
  const tueSlots = slots.filter((s) => s.date === '2026-07-07')
  assert.equal(tueSlots.length, 0, 'Tuesday 2026-07-07 should have 0 slots (blackout)')
  // 2026-07-13 (Mon) is in blackout
  const julThirteenth = slots.filter((s) => s.date === '2026-07-13')
  assert.equal(julThirteenth.length, 0, '2026-07-13 should have 0 slots (blackout)')
})

test('planSlots: boundary date 2026-08-15 (Sat, day after blackout) is kept', () => {
  const { slots } = planSlots({
    startDate: utcDate('2026-08-10'),
    weeks: 1,
    template: SAMPLE_TEMPLATE,
  })
  // 2026-08-14 (Fri) — last blackout day → 0 slots
  assert.equal(slots.filter((s) => s.date === '2026-08-14').length, 0)
  // 2026-08-15 (Sat) — first day after blackout → 2 slots
  assert.equal(slots.filter((s) => s.date === '2026-08-15').length, 2)
})

test('planSlots: empty template produces zero slots', () => {
  const empty = {
    monday: [], tuesday: [], wednesday: [], thursday: [],
    friday: [], saturday: [], sunday: [],
  }
  const { slots } = planSlots({
    startDate: utcDate('2026-05-11'),
    weeks: 4,
    template: empty,
  })
  assert.equal(slots.length, 0)
})

test('planSlots: end time computed correctly with custom duration', () => {
  const { slots } = planSlots({
    startDate: utcDate('2026-05-11'), // Monday
    weeks: 1,
    template: { ...SAMPLE_TEMPLATE, monday: ['10:30'] },
    durationMinutes: 45,
  })
  const mondaySlot = slots.find((s) => s.date === '2026-05-11')
  assert.equal(mondaySlot.startTime, '10:30')
  assert.equal(mondaySlot.endTime, '11:15')
  assert.equal(mondaySlot.duration, 45)
})

test('planSlots: day-of-week mapping aligns to start date weekday', () => {
  // Start on Wed 2026-05-13 — Wed should be first day of slot generation
  const { slots } = planSlots({
    startDate: utcDate('2026-05-13'),
    weeks: 1,
    template: SAMPLE_TEMPLATE,
  })
  // First slot is from Wed 2026-05-13 (template[wednesday] = ['16:00'])
  assert.equal(slots[0].date, '2026-05-13')
  assert.equal(slots[0].startTime, '16:00')
})

test('planSlots: slots within a day are emitted in template-input order', () => {
  // planSlots itself does not re-sort — it iterates the template array
  // verbatim. (The CLI path runs validateTemplate first, which DOES sort,
  // but that's a separate guarantee tested via the dry-run smoke test.)
  const { slots } = planSlots({
    startDate: utcDate('2026-05-11'),
    weeks: 1,
    template: { ...SAMPLE_TEMPLATE, monday: ['18:00', '16:00', '17:00'] },
  })
  const mondaySlots = slots.filter((s) => s.date === '2026-05-11')
  assert.deepEqual(
    mondaySlots.map((s) => s.startTime),
    ['18:00', '16:00', '17:00']
  )
})
