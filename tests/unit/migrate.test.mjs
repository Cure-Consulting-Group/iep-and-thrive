import { test } from 'node:test'
import assert from 'node:assert/strict'
import { classifyRecord, runMigration, summarize } from '../../scripts/migrate.mjs'

const MIGRATION = {
  name: 'example-add-household',
  collection: 'users',
  sourceVersion: 1,
  targetVersion: 2,
  validate: (d) => (typeof d.email === 'string' ? { ok: true } : { ok: false, reason: 'missing email' }),
  transform: (d) => ({ householdId: `hh_${d.email.split('@')[0]}` }),
}

/** In-memory store that can be told to fail partway, to model an interruption. */
function fakeStore(docs, { failAfterBatches = Infinity } = {}) {
  const state = new Map(docs.map((d) => [d.id, structuredClone(d.data)]))
  const checkpoints = new Map()
  const quarantined = []
  let committedBatches = 0
  return {
    state, checkpoints, quarantined,
    get commits() { return committedBatches },
    async readCheckpoint(name) { return checkpoints.get(name) ?? null },
    async writeCheckpoint(name, cursor) { checkpoints.set(name, cursor) },
    async readBatch(_collection, cursor, size) {
      const ids = [...state.keys()].sort()
      const start = cursor ? ids.indexOf(cursor) + 1 : 0
      return ids.slice(start, start + size).map((id) => ({ id, data: structuredClone(state.get(id)) }))
    },
    async quarantine(_name, items) { quarantined.push(...items) },
    async commit(_collection, writes) {
      if (committedBatches >= failAfterBatches) throw new Error('simulated interruption')
      committedBatches += 1
      for (const w of writes) state.set(w.id, w.data)
    },
  }
}

const docs = (n) =>
  Array.from({ length: n }, (_, i) => ({
    id: `u${String(i).padStart(3, '0')}`,
    data: { email: `user${i}@example.com`, _schemaVersion: 1 },
  }))

test('classify: a record already at the target version is skipped', () => {
  const c = classifyRecord(MIGRATION, 'u1', { email: 'a@b.c', _schemaVersion: 2 })
  assert.equal(c.action, 'skip')
})

test('classify: an unexpected schema version is quarantined, never guessed', () => {
  const c = classifyRecord(MIGRATION, 'u1', { email: 'a@b.c', _schemaVersion: 7 })
  assert.equal(c.action, 'quarantine')
  assert.match(c.reason, /unexpected _schemaVersion/)
})

test('classify: a record failing validation is quarantined', () => {
  const c = classifyRecord(MIGRATION, 'u1', { _schemaVersion: 1 })
  assert.equal(c.action, 'quarantine')
  assert.match(c.reason, /missing email/)
})

test('classify: a throwing transform quarantines rather than crashing the run', () => {
  const boom = { ...MIGRATION, transform: () => { throw new Error('bad shape') } }
  const c = classifyRecord(boom, 'u1', { email: 'a@b.c', _schemaVersion: 1 })
  assert.equal(c.action, 'quarantine')
  assert.match(c.reason, /transform threw/)
})

test('classify: source fields are preserved, not replaced', () => {
  const c = classifyRecord(MIGRATION, 'u1', { email: 'a@b.c', legacyField: 'keep me', _schemaVersion: 1 })
  assert.equal(c.action, 'write')
  assert.equal(c.data.legacyField, 'keep me', 'expand/migrate/contract needs the old shape intact for rollback')
  assert.equal(c.data.householdId, 'hh_a')
  assert.equal(c.data._schemaVersion, 2)
})

test('plan mode writes nothing', async () => {
  const store = fakeStore(docs(10))
  const before = structuredClone([...store.state.entries()])
  const totals = await runMigration(MIGRATION, store, { apply: false, batchSize: 4 })
  assert.equal(totals.write, 10)
  assert.deepEqual([...store.state.entries()], before)
  assert.equal(store.checkpoints.size, 0)
})

test('apply migrates every record and checkpoints', async () => {
  const store = fakeStore(docs(10))
  const totals = await runMigration(MIGRATION, store, { apply: true, batchSize: 4 })
  assert.equal(totals.write, 10)
  assert.equal(totals.quarantine, 0)
  for (const [, d] of store.state) assert.equal(d._schemaVersion, 2)
  assert.equal(store.checkpoints.get(MIGRATION.name), 'u009')
})

test('an interrupted run resumes without duplicating or losing records', async () => {
  // First attempt dies after two committed batches.
  const all = docs(10)
  const store = fakeStore(all, { failAfterBatches: 2 })
  await assert.rejects(() => runMigration(MIGRATION, store, { apply: true, batchSize: 3 }))

  const migratedFirst = [...store.state.values()].filter((d) => d._schemaVersion === 2).length
  assert.ok(migratedFirst > 0 && migratedFirst < 10, 'expected a partial migration')
  const checkpoint = store.checkpoints.get(MIGRATION.name)
  assert.ok(checkpoint, 'a checkpoint must survive the interruption')

  // Resume against the same state, no longer failing.
  const resumed = fakeStore([...store.state.entries()].map(([id, data]) => ({ id, data })))
  resumed.checkpoints.set(MIGRATION.name, checkpoint)
  await runMigration(MIGRATION, resumed, { apply: true, batchSize: 3 })

  assert.equal(resumed.state.size, 10, 'no records lost')
  for (const [id, d] of resumed.state) {
    assert.equal(d._schemaVersion, 2, `${id} did not reach the target version`)
    assert.equal(d.householdId, `hh_${d.email.split('@')[0]}`, `${id} transformed incorrectly`)
  }
})

test('re-running a completed migration is a no-op', async () => {
  const store = fakeStore(docs(6))
  await runMigration(MIGRATION, store, { apply: true, batchSize: 2 })
  const snapshot = structuredClone([...store.state.entries()])

  const again = fakeStore([...store.state.entries()].map(([id, data]) => ({ id, data })))
  const totals = await runMigration(MIGRATION, again, { apply: true, batchSize: 2 })
  assert.equal(totals.write, 0)
  assert.equal(totals.skip, 6)
  assert.deepEqual([...again.state.entries()], snapshot)
})

test('quarantined records are recorded and do not stop the run', async () => {
  const mixed = [
    { id: 'u001', data: { email: 'a@b.c', _schemaVersion: 1 } },
    { id: 'u002', data: { _schemaVersion: 1 } },              // no email
    { id: 'u003', data: { email: 'c@d.e', _schemaVersion: 9 } }, // unknown version
    { id: 'u004', data: { email: 'e@f.g', _schemaVersion: 1 } },
  ]
  const store = fakeStore(mixed)
  const totals = await runMigration(MIGRATION, store, { apply: true, batchSize: 10 })
  assert.equal(totals.write, 2)
  assert.equal(totals.quarantine, 2)
  assert.equal(store.quarantined.length, 2)
  assert.deepEqual(store.quarantined.map((q) => q.id).sort(), ['u002', 'u003'])
  // Untouched, so a human can decide.
  assert.equal(store.state.get('u002')._schemaVersion, 1)
  assert.equal(store.state.get('u003')._schemaVersion, 9)
})

test('summarize counts each action', () => {
  assert.deepEqual(
    summarize([{ action: 'write' }, { action: 'write' }, { action: 'skip' }, { action: 'quarantine' }]),
    { write: 2, skip: 1, quarantine: 1 },
  )
})
