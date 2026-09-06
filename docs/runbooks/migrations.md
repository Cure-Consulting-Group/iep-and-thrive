# Runbook — schema migrations

Covers **TASK-LP-076**. Tooling: `scripts/migrate.mjs`, adapter in
`scripts/migration-store.mjs`, migrations in `scripts/migrations/`.

## Expand, migrate, contract — never all at once

Every schema change is three deploys, not one. Collapsing them is what breaks
older native clients that are still in the field and cannot be force-updated.

1. **Expand.** Write the new field alongside the old. Both clients read either.
   Nothing is removed. This deploy is safe to roll back freely.
2. **Migrate.** Backfill with `migrate.mjs`. Readers still tolerate both shapes.
3. **Contract.** Only after the minimum supported client version reads the new
   shape, remove the old field. This is the deploy that cannot be rolled back
   without a restore, so it goes last and separately.

An iOS release lingers on devices for weeks. Contract before that tail has
drained and those users get decode failures, not a graceful degrade.

## Running one

```bash
node scripts/migrate.mjs list
node scripts/migrate.mjs plan  <name> --project iep-and-thrive-staging
node scripts/migrate.mjs apply <name> --project iep-and-thrive-staging --confirm
```

`plan` writes nothing. `apply` additionally requires `--confirm`. Neither
assumes a project — the runner refuses without `--project`, because defaulting
to production is the defect this repo has now fixed in three separate scripts.

Rehearse on a synthetic project first. Always.

## What the runner guarantees

| Property | How |
| --- | --- |
| Resumable | Checkpoint written after each batch commits, never before |
| Idempotent | `_schemaVersion` gate; a record at the target version is skipped |
| Bounded | Fixed batch size; no unbounded scan of a live collection |
| Quarantining | Unrecognized or invalid records are copied aside and left untouched |
| Non-destructive | Source fields preserved; removal is the separate contract step |

The checkpoint is written **after** the batch commits. Writing it first would
skip a batch that never applied — silent data loss, and the specific failure
this design exists to prevent. `tests/unit/migrate.test.mjs` covers the
interrupt-and-resume path directly.

## Quarantine

A record whose `_schemaVersion` is unexpected, or that fails the migration's
`validate`, is copied to `_migrationQuarantine` with the reason and left
unmodified.

**Review quarantined records by hand.** TASK-LP-014 is explicit that a legacy
record which cannot be attributed safely is reviewed rather than assigned
heuristically — most of these will be historical email-only payment records, and
guessing an owner from an unverified email address is exactly the attribution
this system must not make.

## Writing a migration

`scripts/migrations/<name>.mjs`, default-exporting:

```js
export default {
  name: 'add-household-id',
  collection: 'users',
  sourceVersion: 1,
  targetVersion: 2,
  validate: (d) => (typeof d.email === 'string' ? { ok: true } : { ok: false, reason: 'missing email' }),
  transform: (d) => ({ householdId: deriveHousehold(d) }),   // returns ONLY new fields
}
```

`transform` returns the fields to add. The runner merges them and stamps
`_schemaVersion`; it never replaces the document. Keep `transform` pure — it is
called during `plan`, when nothing may be written.

## Rollback

Reversible changes roll back by deploying the previous client and leaving the
data alone; the expand step guarantees the old fields are still there.

**A privacy-sensitive transformation does not roll back symmetrically.** If a
migration tightened access, split a record to separate instructor-private notes
from parent-readable ones, or applied a deletion, rolling it back must not
restore the looser state. Reverse those forward — with a new migration — rather
than by reverting. Deletion and consent state survive every recovery path, and
that is a requirement, not a preference.
