# TASK-LP-076 — Create a repeatable schema migration and compatibility framework

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Data + infrastructure + client leads |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F10](../../audits/2026-09-05/product-direction/findings.md#f10), [F28](../../audits/2026-09-05/product-direction/findings.md#f28), [F43](../../audits/2026-09-05/product-direction/findings.md#f43) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

The required privacy, identity, and historical-record fixes affect multiple stores and clients. Ad hoc scripts could lose records, leak legacy fields, or break older native releases.

## Implementation scope

1. Define per-migration source/target versions, authorized scope, dry-run manifest, immutable mapping, checkpoint, validation counts/hashes, and operator recovery instructions.
2. Implement resumable idempotent migration tooling with bounded batches, explicit environment selection, malformed-record quarantine, and source preservation until verified.
3. Plan expand/migrate/contract deployment ordering, old-client reads/writes, minimum supported versions, and server rejection of unsafe legacy operations.
4. Classify reversible schema changes versus privacy-sensitive transformations whose rollback must retain stricter access; retain deletion/consent state across all recovery paths.

## Acceptance criteria

- **Given** a migration is interrupted mid-batch, **when** it resumes, **then** each record reaches the intended state without duplicates or loss.

- **Given** a legacy client writes an unsafe schema, **when** compatibility handling runs, **then** the server rejects it clearly rather than reopening an exposure.

## Validation and evidence

Synthetic dry-run/apply/resume/re-run/rollback tests, counts and mapping consistency, denied cross-family access, orphan records, and deletion-manifest preservation.

## Rollout, migration, and recovery

No production migration during audit/review. Every execution needs a concrete reviewed manifest and backups/recovery appropriate to its data; do not require a broad redesign to apply a narrowly scoped emergency privacy fix.

## Source evidence

- [ios/IEPAndThrive/Core/Data/Models.swift:1](../../../ios/IEPAndThrive/Core/Data/Models.swift#L1)
- [firestore.rules:1](../../../firestore.rules#L1)
- [docs/runbooks/firestore-restore.md:1](../../../docs/runbooks/firestore-restore.md#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
