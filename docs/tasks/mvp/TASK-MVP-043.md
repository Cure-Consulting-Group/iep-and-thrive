# TASK-MVP-043 — Verify local migration round-trip and export recovery

| Field | Value |
| --- | --- |
| Epic | EPIC-M10 — Release |
| Priority / release gate | P0 / Stage 3 gate |
| Status | Proposed — review required |
| Proposed owner | iOS data engineer + test engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-032, TASK-MVP-041 |
| Design | None |

## Problem and intended outcome

Local history has no server copy by design. A schema migration or interrupted write must not erase
months of skill evidence; the release needs a repeatable round-trip and export recovery proof.

## Implementation scope

1. Seed a synthetic SwiftData store with every supported record version, including interrupted and
   quarantined records, then run the current migration.
2. Export before migration, import into a clean store, compare stable IDs and values, and exercise
   checkpoint resume after a forced interruption.
3. Verify the migrated store can be read by pacing, measurement counters, and the no-network path;
   never use real family data or credentials.

## Acceptance criteria

- **Given** a seeded prior-version store, **when** migration completes, **then** all supported skill
  evidence and aggregate counters round-trip with stable IDs and schema versions.
- **Given** migration is interrupted at each checkpoint, **when** it resumes, **then** it is
  idempotent, quarantines only the declared invalid record, and never duplicates evidence.
- **Given** a migration cannot complete, **when** the export recovery path is used, **then** a clean
  store restores the supported records and the app remains offline-capable.

## Validation and evidence

Run migration matrix, interruption injection, export/import comparison, and release-candidate
offline session tests. Attach checksums, record counts, and quarantine reports.

## Rollout, migration, and recovery

Migration uses expand-migrate-contract with an export escape hatch. Block release on any data loss,
duplicate, or unrecoverable quarantine; never use destructive reset as recovery.

## Source evidence

- [DatabaseClient.swift](../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift)
- [ADR-000 D10](../../architecture/ADR-000-mvp-architecture-decisions.md#d10--swiftdata-for-local-persistence-with-an-explicit-schema-version)

## Definition of done

Code review is approved; new migration code has at least 80% coverage; records and exports are
validated; no secrets are hardcoded; no destructive migration exists; and round-trip evidence is
attached.
