# TASK-MVP-032 — Persist skill evidence with versioned local records

| Field | Value |
| --- | --- |
| Epic | EPIC-M7 — Adaptive core |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | iOS data engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-014, TASK-MVP-028, TASK-MVP-030 |
| Design | None |

## Problem and intended outcome

SwiftData currently stores broad lesson/progress records without a versioned skill-evidence contract.
The child needs months of local history that survives relaunch and can later support the consented
aggregate measurement path.

## Implementation scope

1. Add versioned local records for skill ID, level ID, result, timestamp, pacing policy version, and
   session completion state; stamp every persisted record with the schema version.
2. Keep SwiftData in Data, expose typed Domain values to engines, and make writes idempotent by stable
   event ID.
3. Add an expand-migrate-contract path and an export-to-file escape hatch before the next schema
   ships; do not add a remote sync path.

## Acceptance criteria

- **Given** a completed or interrupted session, **when** it is saved and the app relaunches, **then**
  skill evidence resolves with its original IDs and schema version.
- **Given** the same event is saved twice, **when** persistence commits, **then** only one stable
  evidence record exists.
- **Given** a migration encounters an unknown field or record, **when** it runs, **then** the record
  is quarantined and export remains available without destructive deletion.

## Validation and evidence

Run SwiftData unit tests, duplicate-write tests, interruption/relaunch tests, migration fixtures,
and export/import checks. Attach schema inventory and quarantine evidence.

## Rollout, migration, and recovery

Use expand-migrate-contract with a checkpoint and no destructive local migration. Restore from the
export escape hatch if migration cannot complete; never silently discard skill evidence.

## Source evidence

- [DatabaseClient.swift](../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift)
- [Models.swift](../../../ios/IEPAndThrive/Core/Data/Models.swift)
- [ADR-000 D10](../../architecture/ADR-000-mvp-architecture-decisions.md#d10--swiftdata-for-local-persistence-with-an-explicit-schema-version)

## Definition of done

Code review is approved; new Data code has at least 80% coverage; IDs and versions are validated;
no secrets are hardcoded; migration is non-destructive; and recovery evidence is attached.
