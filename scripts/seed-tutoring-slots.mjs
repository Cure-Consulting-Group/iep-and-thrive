#!/usr/bin/env node

/**
 * H9 — Seed Tutoring Slots
 * ─────────────────────────
 * Writes availableSlots/ docs with type:'tutoring' for the next N weeks
 * based on a weekly template (Mon/Wed/Fri 4–6pm, Sat 10am–12pm, etc.).
 *
 * Usage:
 *   node scripts/seed-tutoring-slots.mjs --start 2026-05-12 --weeks 12
 *   node scripts/seed-tutoring-slots.mjs --weeks 4 --rebuild
 *   node scripts/seed-tutoring-slots.mjs --dry-run --weeks 1
 *
 * Args:
 *   --start YYYY-MM-DD  Anchor date for week 1 (default: next Monday).
 *                       Slots are generated for date >= start.
 *   --weeks N           Number of weeks to seed (default: 12).
 *   --rebuild           Delete existing tutoring slots inside the target
 *                       window before seeding (does NOT touch booked
 *                       slots or non-tutoring slot types).
 *   --dry-run           Print the slots that WOULD be written; no writes.
 *   --template PATH     Path to a JSON template file. Defaults to the
 *                       embedded DEFAULT_TEMPLATE below.
 *
 * Cohort blackout:
 *   Dates from 2026-07-07 through 2026-08-14 (inclusive) are skipped
 *   automatically — these are the cohort weeks. Add ad-hoc tutoring
 *   slots inside the window manually via /admin/slots.
 *
 * Idempotency:
 *   Without --rebuild, a slot with the same (date, startTime, type) is
 *   left alone — new slots are added beside it, but duplicates are not
 *   created. With --rebuild, every available (un-booked) tutoring slot
 *   in [start, start + N*7) is deleted before re-seeding.
 *
 * Authentication:
 *   Requires GOOGLE_APPLICATION_CREDENTIALS pointing to a service account
 *   JSON, OR `gcloud auth application-default login` to be run first.
 *
 * Project guard: aborts if GCLOUD_PROJECT/GOOGLE_CLOUD_PROJECT is set to
 * anything other than `iep-and-thrive`.
 */

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const PROJECT_ID = 'iep-and-thrive'

// ─── Config ────────────────────────────────────────────────────────────────

/** Cohort dates — tutoring slots are NOT seeded inside this inclusive range. */
const COHORT_BLACKOUT_START = '2026-07-07'
const COHORT_BLACKOUT_END = '2026-08-14'

/** Default per-slot duration in minutes. */
const DEFAULT_DURATION_MINUTES = 60

/** Default weekly template — used when --template is not passed. */
const DEFAULT_TEMPLATE = {
  monday:    ['16:00', '17:00', '18:00'],
  tuesday:   [],
  wednesday: ['16:00', '17:00'],
  thursday:  [],
  friday:    ['15:00', '16:00', '17:00'],
  saturday:  ['10:00', '11:00', '12:00'],
  sunday:    [],
}

const DAY_KEYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
]

// ─── Arg parsing ───────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {
    start: null,
    weeks: 12,
    rebuild: false,
    dryRun: false,
    template: null,
  }
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--start') out.start = argv[++i]
    else if (arg === '--weeks') out.weeks = Number(argv[++i])
    else if (arg === '--rebuild') out.rebuild = true
    else if (arg === '--dry-run') out.dryRun = true
    else if (arg === '--template') out.template = argv[++i]
    else if (arg === '--help' || arg === '-h') {
      printHelp()
      process.exit(0)
    } else if (arg.startsWith('--')) {
      console.error(`Unknown flag: ${arg}`)
      process.exit(2)
    }
  }
  if (!Number.isInteger(out.weeks) || out.weeks <= 0) {
    console.error('--weeks must be a positive integer')
    process.exit(2)
  }
  if (out.weeks > 52) {
    console.error('--weeks must be <= 52 (sanity cap)')
    process.exit(2)
  }
  return out
}

function printHelp() {
  console.log(`Seed tutoring slots into availableSlots/.

Usage:
  node scripts/seed-tutoring-slots.mjs [flags]

Flags:
  --start YYYY-MM-DD   Anchor date (default: next Monday)
  --weeks N            Weeks to seed (default: 12, max: 52)
  --rebuild            Delete existing tutoring slots in window first
  --dry-run            Print slots without writing to Firestore
  --template PATH      Path to JSON template (see DEFAULT_TEMPLATE)
  -h, --help           Show this help

Cohort blackout: ${COHORT_BLACKOUT_START} through ${COHORT_BLACKOUT_END} (inclusive)
`)
}

// ─── Date helpers (timezone-agnostic, always use UTC math) ─────────────────

function pad2(n) {
  return String(n).padStart(2, '0')
}

function toISODate(date) {
  return `${date.getUTCFullYear()}-${pad2(date.getUTCMonth() + 1)}-${pad2(date.getUTCDate())}`
}

function parseISODate(s) {
  // Treat as UTC midnight to avoid local-tz drift across DST.
  const [y, m, d] = s.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d))
}

function addDays(date, n) {
  const next = new Date(date.getTime())
  next.setUTCDate(next.getUTCDate() + n)
  return next
}

/** Default --start to the next Monday (today if today IS Monday). */
function defaultStartDate() {
  const now = new Date()
  const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  const dow = today.getUTCDay() // 0=Sun, 1=Mon, ..., 6=Sat
  const offset = dow === 1 ? 0 : (8 - dow) % 7
  return addDays(today, offset)
}

function isISODate(s) {
  return typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s)
}

function isHHMM(s) {
  return typeof s === 'string' && /^([01]\d|2[0-3]):[0-5]\d$/.test(s)
}

function addMinutesToHHMM(hhmm, minutes) {
  const [h, m] = hhmm.split(':').map(Number)
  const total = h * 60 + m + minutes
  const eh = Math.floor(total / 60) % 24
  const em = total % 60
  return `${pad2(eh)}:${pad2(em)}`
}

function inCohortBlackout(isoDate) {
  return isoDate >= COHORT_BLACKOUT_START && isoDate <= COHORT_BLACKOUT_END
}

// ─── Template loading & validation ─────────────────────────────────────────

function loadTemplate(templatePath) {
  if (!templatePath) return DEFAULT_TEMPLATE
  const __filename = fileURLToPath(import.meta.url)
  const __dirname = path.dirname(__filename)
  const resolved = path.isAbsolute(templatePath)
    ? templatePath
    : path.resolve(__dirname, '..', templatePath)
  let raw
  try {
    raw = readFileSync(resolved, 'utf8')
  } catch (err) {
    console.error(`Failed to read template at ${resolved}: ${err.message}`)
    process.exit(2)
  }
  let parsed
  try {
    parsed = JSON.parse(raw)
  } catch (err) {
    console.error(`Template at ${resolved} is not valid JSON: ${err.message}`)
    process.exit(2)
  }
  return validateTemplate(parsed)
}

function validateTemplate(template) {
  if (!template || typeof template !== 'object') {
    throw new Error('Template must be an object keyed by day name')
  }
  const out = {}
  for (const key of DAY_KEYS) {
    const times = template[key] ?? []
    if (!Array.isArray(times)) {
      throw new Error(`Template.${key} must be an array of HH:mm strings`)
    }
    for (const t of times) {
      if (!isHHMM(t)) {
        throw new Error(`Template.${key} contains invalid time "${t}" — expected HH:mm`)
      }
    }
    out[key] = [...times].sort()
  }
  return out
}

// ─── Plan generation (pure, used by --dry-run too) ─────────────────────────

/**
 * Given a start date, week count, and template, return an array of slots
 * to write. Cohort-blackout dates are filtered. Slots are returned in
 * chronological order.
 */
export function planSlots({ startDate, weeks, template, durationMinutes = DEFAULT_DURATION_MINUTES }) {
  const slots = []
  const skippedCohort = []
  const totalDays = weeks * 7
  for (let i = 0; i < totalDays; i++) {
    const day = addDays(startDate, i)
    const isoDate = toISODate(day)
    const dowKey = DAY_KEYS[day.getUTCDay()]
    const times = template[dowKey] || []
    if (times.length === 0) continue

    if (inCohortBlackout(isoDate)) {
      // Record once per blackout day (only if the template would have
      // produced slots, so the summary is meaningful)
      skippedCohort.push({ date: isoDate, count: times.length })
      continue
    }

    for (const startTime of times) {
      slots.push({
        date: isoDate,
        startTime,
        endTime: addMinutesToHHMM(startTime, durationMinutes),
        duration: durationMinutes,
        type: 'tutoring',
        isAvailable: true,
        bookedBy: null,
      })
    }
  }
  return { slots, skippedCohort }
}

// ─── Firestore I/O (only loaded when not --dry-run) ────────────────────────

async function loadAdminSdk() {
  const project = process.env.GCLOUD_PROJECT || process.env.GOOGLE_CLOUD_PROJECT || ''
  if (project && project !== PROJECT_ID) {
    console.error(`ABORT: GCLOUD_PROJECT="${project}", expected "${PROJECT_ID}"`)
    process.exit(1)
  }
  const { initializeApp, applicationDefault, getApps } = await import('firebase-admin/app')
  const { getFirestore, FieldValue } = await import('firebase-admin/firestore')
  if (!getApps().length) {
    initializeApp({ credential: applicationDefault(), projectId: PROJECT_ID })
  }
  const db = getFirestore()
  return { db, FieldValue }
}

/**
 * Read existing tutoring slots in [startDate, startDate + weeks*7) and
 * return a Set of "date|startTime" keys + a list of {id,date,startTime}
 * for the rebuild path.
 */
async function fetchExistingTutoringSlots(db, startDate, endDateExclusive) {
  const startISO = toISODate(startDate)
  const endISO = toISODate(endDateExclusive)
  const snap = await db
    .collection('availableSlots')
    .where('type', '==', 'tutoring')
    .where('date', '>=', startISO)
    .where('date', '<', endISO)
    .get()

  const seen = new Map() // key -> {id, isAvailable, bookedBy}
  for (const d of snap.docs) {
    const data = d.data()
    const key = `${data.date}|${data.startTime}`
    seen.set(key, { id: d.id, isAvailable: data.isAvailable !== false, bookedBy: data.bookedBy ?? null })
  }
  return seen
}

async function deleteSlots(db, ids) {
  // Firestore writeBatch caps at 500 ops.
  for (let i = 0; i < ids.length; i += 400) {
    const batch = db.batch()
    for (const id of ids.slice(i, i + 400)) {
      batch.delete(db.collection('availableSlots').doc(id))
    }
    await batch.commit()
  }
}

async function writeSlots(db, FieldValue, slots) {
  for (let i = 0; i < slots.length; i += 400) {
    const batch = db.batch()
    for (const s of slots.slice(i, i + 400)) {
      const ref = db.collection('availableSlots').doc()
      batch.set(ref, { ...s, createdAt: FieldValue.serverTimestamp() })
    }
    await batch.commit()
  }
}

// ─── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const args = parseArgs(process.argv.slice(2))

  const startDate = args.start ? parseISODate(args.start) : defaultStartDate()
  if (args.start && !isISODate(args.start)) {
    console.error('--start must be in YYYY-MM-DD format')
    process.exit(2)
  }
  const endDateExclusive = addDays(startDate, args.weeks * 7)
  const template = loadTemplate(args.template)

  console.log('')
  console.log(`Seed tutoring slots → project: ${PROJECT_ID}`)
  console.log('═'.repeat(60))
  console.log(`Window:    ${toISODate(startDate)} → ${toISODate(addDays(endDateExclusive, -1))}  (${args.weeks} week(s))`)
  console.log(`Cohort blackout: ${COHORT_BLACKOUT_START} → ${COHORT_BLACKOUT_END} (auto-skipped)`)
  console.log(`Mode:      ${args.dryRun ? 'DRY-RUN (no writes)' : args.rebuild ? 'REBUILD (delete + recreate)' : 'IDEMPOTENT (skip dupes)'}`)
  console.log('─'.repeat(60))

  const { slots: planned, skippedCohort } = planSlots({
    startDate,
    weeks: args.weeks,
    template,
  })

  if (args.dryRun) {
    console.log(`Planned: ${planned.length} slots\n`)
    let lastDate = ''
    for (const s of planned) {
      if (s.date !== lastDate) {
        const d = parseISODate(s.date)
        const dow = DAY_KEYS[d.getUTCDay()]
        console.log(`  ${s.date} (${dow})`)
        lastDate = s.date
      }
      console.log(`    ${s.startTime} – ${s.endTime}  (${s.duration} min, ${s.type})`)
    }
    if (skippedCohort.length) {
      const totalSkipped = skippedCohort.reduce((sum, x) => sum + x.count, 0)
      console.log(`\nSkipped (cohort blackout): ${totalSkipped} slot(s) across ${skippedCohort.length} day(s)`)
    }
    console.log('\nNo writes performed (--dry-run).')
    return
  }

  const { db, FieldValue } = await loadAdminSdk()

  let deleted = 0
  let skippedExisting = 0
  let preservedBooked = 0

  const existing = await fetchExistingTutoringSlots(db, startDate, endDateExclusive)

  if (args.rebuild) {
    // Delete everything we planned to write (including any currently-empty
    // tutoring slots), but preserve booked slots so we never destroy a
    // confirmed booking record.
    const idsToDelete = []
    for (const [, info] of existing) {
      if (info.bookedBy || info.isAvailable === false) {
        preservedBooked += 1
        continue
      }
      idsToDelete.push(info.id)
    }
    if (idsToDelete.length) {
      await deleteSlots(db, idsToDelete)
      deleted = idsToDelete.length
    }
    // Refresh: anything left in `existing` after deletion is the booked
    // set we preserved. We must still skip those keys to avoid creating
    // a duplicate slot at the same time.
    for (const [, info] of existing) {
      if (info.bookedBy || info.isAvailable === false) {
        continue // preserved booking — leave it alone
      }
      // (deleted ones are no longer relevant)
    }
  }

  // Filter planned against what's now in the collection.
  // After --rebuild we still have to skip booked-preserved slots.
  const toWrite = []
  for (const s of planned) {
    const key = `${s.date}|${s.startTime}`
    const ex = existing.get(key)
    if (!ex) {
      toWrite.push(s)
      continue
    }
    if (args.rebuild) {
      // Was the existing slot deleted? If preserved (booked), skip writing
      // a new available slot at the same time (would clash).
      if (ex.bookedBy || ex.isAvailable === false) {
        skippedExisting += 1
        continue
      }
      // Was deleted → safe to write
      toWrite.push(s)
    } else {
      // Idempotent: leave existing alone, never overwrite.
      skippedExisting += 1
    }
  }

  if (toWrite.length) {
    await writeSlots(db, FieldValue, toWrite)
  }

  const skippedCohortTotal = skippedCohort.reduce((sum, x) => sum + x.count, 0)

  console.log(`Created:                  ${toWrite.length}`)
  console.log(`Skipped (already exist):  ${skippedExisting}`)
  console.log(`Skipped (cohort window):  ${skippedCohortTotal}  (${skippedCohort.length} day(s))`)
  if (args.rebuild) {
    console.log(`Deleted (rebuild):        ${deleted}`)
    console.log(`Preserved (booked):       ${preservedBooked}`)
  }
  console.log('═'.repeat(60))
  console.log('Done.')
}

// Allow `import { planSlots }` from a test without firing main().
const isDirectInvocation = (() => {
  try {
    const entry = process.argv[1] && path.resolve(process.argv[1])
    const here = fileURLToPath(import.meta.url)
    return entry === here
  } catch {
    return true
  }
})()

if (isDirectInvocation) {
  main().catch((err) => {
    console.error('Seed failed:', err)
    process.exit(1)
  })
}
