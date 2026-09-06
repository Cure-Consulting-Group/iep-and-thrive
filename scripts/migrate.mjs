#!/usr/bin/env node
/**
 * Firestore migration runner — TASK-LP-076.
 *
 * The privacy, identity and historical-record fixes still ahead all reshape
 * live data across multiple stores and two clients. Doing that with ad-hoc
 * scripts is how records get lost, legacy fields leak into new shapes, and
 * older native releases start failing on documents they can no longer decode.
 *
 * Properties this runner guarantees, because each one is a way ad-hoc scripts
 * go wrong:
 *
 *   Resumable      A checkpoint is written after every batch. An interrupted
 *                  run resumes from the last committed cursor rather than
 *                  restarting — restarting is what duplicates side effects.
 *   Idempotent     Every record carries `_schemaVersion`. A record already at
 *                  the target version is skipped, so re-running is safe and a
 *                  partially-applied batch converges.
 *   Bounded        Fixed batch size. An unbounded scan over a live collection
 *                  is a latency and cost incident.
 *   Quarantining   A record that does not match the source shape is copied to
 *                  a quarantine collection and skipped — never guessed at.
 *                  TASK-LP-014 requires exactly this: unattributable legacy
 *                  records are reviewed by a human, not assigned heuristically.
 *   Non-destructive  Source fields are preserved until a separate contract
 *                  step removes them. Expand, migrate, contract — never all at
 *                  once, because rollback needs the old shape to still exist.
 *   Explicit env   Refuses to run without an explicitly named project.
 *
 * Usage:
 *   node scripts/migrate.mjs list
 *   node scripts/migrate.mjs plan  <name> --project <id>
 *   node scripts/migrate.mjs apply <name> --project <id> --confirm
 *   node scripts/migrate.mjs status <name> --project <id>
 *
 * `plan` is the default posture: it reads, reports what would change, and
 * writes nothing. `apply` additionally requires --confirm.
 */

import { readdirSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = join(__dirname, 'migrations')
const PRODUCTION_PROJECT_ID = 'iep-and-thrive'

export const CHECKPOINT_COLLECTION = '_migrations'
export const QUARANTINE_COLLECTION = '_migrationQuarantine'
export const DEFAULT_BATCH_SIZE = 200

/* ────────────────────────── pure core (unit-testable) ────────────────────── */

/**
 * Decide what happens to one record. Pure: no I/O, so the decision table is
 * testable without an emulator, which is the part most worth testing.
 */
export function classifyRecord(migration, id, data) {
  const current = data?._schemaVersion ?? migration.sourceVersion
  if (current === migration.targetVersion) {
    return { action: 'skip', reason: 'already at target version' }
  }
  if (current !== migration.sourceVersion) {
    return {
      action: 'quarantine',
      reason: `unexpected _schemaVersion ${JSON.stringify(current)}; expected ${migration.sourceVersion}`,
    }
  }
  let validation
  try {
    validation = migration.validate ? migration.validate(data) : { ok: true }
  } catch (err) {
    return { action: 'quarantine', reason: `validate threw: ${err.message}` }
  }
  if (!validation.ok) {
    return { action: 'quarantine', reason: validation.reason || 'failed validation' }
  }
  let next
  try {
    next = migration.transform(structuredClone(data))
  } catch (err) {
    return { action: 'quarantine', reason: `transform threw: ${err.message}` }
  }
  if (!next || typeof next !== 'object') {
    return { action: 'quarantine', reason: 'transform returned a non-object' }
  }
  // Expand, don't replace. The contract step removes old fields later, once
  // every client has been reading the new shape long enough to be sure.
  return {
    action: 'write',
    data: { ...data, ...next, _schemaVersion: migration.targetVersion },
  }
}

/** Summarize a set of classifications for a plan or a run report. */
export function summarize(classifications) {
  const t = { write: 0, skip: 0, quarantine: 0 }
  for (const c of classifications) t[c.action] = (t[c.action] ?? 0) + 1
  return t
}

/* ─────────────────────────────── runner ──────────────────────────────────── */

export function loadMigrations(dir = MIGRATIONS_DIR) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).filter((f) => f.endsWith('.mjs')).sort()
}

function parseArgs(argv) {
  const [, , command, name, ...rest] = argv
  const opts = { command, name, project: null, confirm: false, batchSize: DEFAULT_BATCH_SIZE }
  for (let i = 0; i < rest.length; i++) {
    const a = rest[i]
    if (a === '--project') opts.project = rest[++i]
    else if (a === '--confirm') opts.confirm = true
    else if (a === '--batch-size') opts.batchSize = Number(rest[++i])
    else { console.error(`Unknown argument: ${a}`); process.exit(2) }
  }
  return opts
}

/**
 * Run one migration. `store` is injected so the decision logic can be tested
 * against a fake, and so this file never imports firebase-admin at module load.
 */
export async function runMigration(migration, store, opts) {
  const { apply = false, batchSize = DEFAULT_BATCH_SIZE, onBatch = () => {} } = opts
  let cursor = await store.readCheckpoint(migration.name)
  const totals = { write: 0, skip: 0, quarantine: 0, batches: 0 }

  for (;;) {
    const batch = await store.readBatch(migration.collection, cursor, batchSize)
    if (batch.length === 0) break

    const writes = []
    const quarantines = []
    for (const { id, data } of batch) {
      const c = classifyRecord(migration, id, data)
      totals[c.action] += 1
      if (c.action === 'write') writes.push({ id, data: c.data })
      else if (c.action === 'quarantine') quarantines.push({ id, data, reason: c.reason })
    }

    if (apply) {
      // Quarantine first. If the process dies between the two, we would rather
      // have recorded a suspect record twice than not at all.
      if (quarantines.length) await store.quarantine(migration.name, quarantines)
      if (writes.length) await store.commit(migration.collection, writes)
    }

    cursor = batch[batch.length - 1].id
    totals.batches += 1
    // Checkpoint AFTER the writes land. Checkpointing first would skip a batch
    // that never actually applied — silent data loss, the failure this exists
    // to prevent.
    if (apply) await store.writeCheckpoint(migration.name, cursor)
    onBatch({ cursor, totals: { ...totals } })
  }

  return totals
}

/* ─────────────────────────────── CLI ─────────────────────────────────────── */

async function main() {
  const opts = parseArgs(process.argv)
  const commands = ['list', 'plan', 'apply', 'status']
  if (!commands.includes(opts.command)) {
    console.error(`Usage: migrate.mjs <${commands.join('|')}> [name] --project <id> [--confirm]`)
    process.exit(2)
  }

  if (opts.command === 'list') {
    const found = loadMigrations()
    console.log(found.length ? found.map((f) => `  ${f}`).join('\n') : '  (no migrations defined yet)')
    return
  }

  if (!opts.name) { console.error('ABORT: migration name required.'); process.exit(2) }
  if (!opts.project) {
    console.error('ABORT: --project is required. This runner never assumes a target.')
    process.exit(1)
  }
  if (opts.command === 'apply' && !opts.confirm) {
    console.error('ABORT: apply requires --confirm. Run `plan` first and read the output.')
    process.exit(2)
  }
  if (opts.project === PRODUCTION_PROJECT_ID && opts.command === 'apply') {
    console.error(`NOTE: applying to PRODUCTION (${PRODUCTION_PROJECT_ID}).`)
    console.error('Rehearse on a synthetic project first — see docs/runbooks/migrations.md.')
  }

  const file = join(MIGRATIONS_DIR, opts.name.endsWith('.mjs') ? opts.name : `${opts.name}.mjs`)
  if (!existsSync(file)) { console.error(`ABORT: no migration at ${file}`); process.exit(1) }
  const migration = (await import(file)).default

  const { createFirestoreStore } = await import('./migration-store.mjs')
  const store = await createFirestoreStore(opts.project)

  console.log(`${opts.command === 'apply' ? 'APPLYING' : 'PLAN (no writes)'}: ${migration.name}`)
  console.log(`  collection: ${migration.collection}`)
  console.log(`  ${migration.sourceVersion} -> ${migration.targetVersion}`)
  console.log('─'.repeat(60))

  const totals = await runMigration(migration, store, {
    apply: opts.command === 'apply',
    batchSize: opts.batchSize,
    onBatch: ({ cursor, totals }) =>
      console.log(`  batch ${totals.batches}: +${totals.write} write, ${totals.skip} skip, ${totals.quarantine} quarantine (cursor ${cursor})`),
  })

  console.log('─'.repeat(60))
  console.log(`  write:      ${totals.write}`)
  console.log(`  skip:       ${totals.skip}`)
  console.log(`  quarantine: ${totals.quarantine}`)
  if (totals.quarantine > 0) {
    console.log(`\n  ${totals.quarantine} record(s) quarantined to ${QUARANTINE_COLLECTION}.`)
    console.log('  Review them by hand. Do not attribute them heuristically (TASK-LP-014).')
  }
  if (opts.command === 'plan') console.log('\nNothing was written. Re-run with `apply --confirm`.')
}

if (process.argv[1] && process.argv[1].endsWith('migrate.mjs')) {
  main().catch((err) => { console.error(`\nFAILED: ${err.message}`); process.exitCode = 1 })
}
