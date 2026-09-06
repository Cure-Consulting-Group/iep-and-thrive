# TASK-LP-007 — Separate all instructor-private notes from parent-readable records

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-02](../../audits/2026-09-05/product-direction/epics.md#epic-lp-02) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + web + privacy |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F09](../../audits/2026-09-05/product-direction/findings.md#f09) |
| Dependencies | [TASK-LP-076](TASK-LP-076.md) |

## Problem and intended outcome

Attendance documents expose instructor-private notes to the owning parent, and probe records use the same misleading UI-only privacy pattern. Field hiding cannot protect a whole-document read.

## Implementation scope

1. Classify attendance notes, probe notes, assessment/subtest notes, internal email metadata, and report notes into private or intentionally shared fields.
2. Store private fields in separately authorized staff documents; restrict reads/writes to approved staff access and keep parent-safe projections explicit.
3. Update attendance/probe/assessment forms and notifications/report builders to use the correct channel. Include concurrent-edit behavior and clear labels.
4. Provide an idempotent migration: copy private fields, verify counts/hashes, remove legacy copies, and log sanitized results. Protect legacy documents during the migration window rather than leaving them readable.

## Acceptance criteria

- **Given** a parent owns a student, **when** the parent reads all permitted documents or queries, **then** no private field is returned.

- **Given** migration retries after interruption, **when** the same records are processed, **then** notes are preserved once and no legacy private copy remains accessible.

## Validation and evidence

Emulator tests for owner, other family, unassigned staff, assigned staff, and admin; synthetic legacy/new records; migration interruption and email/report leakage checks.

## Rollout, migration, and recovery

Use the migration framework with a restricted-read transition. Rollback restores staff access or delays parent views; it must never restore exposed private fields.

## Source evidence

- [lib/attendance-service.ts:9](../../../lib/attendance-service.ts#L9)
- [lib/probe-service.ts:17](../../../lib/probe-service.ts#L17)
- [firestore.rules:121](../../../firestore.rules#L121)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
