# TASK-LP-008 — Make student identity and enrollment authority server-controlled

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-02](../../audits/2026-09-05/product-direction/epics.md#epic-lp-02) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + data |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F10](../../audits/2026-09-05/product-direction/findings.md#f10) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-076](TASK-LP-076.md) |

## Problem and intended outcome

Parents can currently mutate every student field, including enrollment state and denormalized identity. Flat downstream records also assume student IDs are globally unique, although native accounts reuse default.

## Implementation scope

1. Define parent-editable student fields versus server enrollment, ownership, organization, assessment, and audit fields. Enforce create/update/delete contracts with rules and controlled server operations.
2. Derive IDs and parent IDs from trusted paths; never spread document data over those identity values in client projections.
3. Adopt a canonical learner key for cross-family queries and flat record IDs; migrate legacy default and overlapping IDs with explicit mapping.
4. Validate trigger inputs and enrollment-driven lifecycle eligibility against trusted records rather than parent-written status.

## Acceptance criteria

- **Given** a parent edits a student, **when** protected ownership or enrollment fields are included, **then** the request is rejected.

- **Given** two families both have a default student, **when** attendance, assessment, or notification records are created, **then** their identifiers and queries cannot collide.

## Validation and evidence

Positive profile-edit tests, denial cases, DTO identity injection, duplicate local IDs across families, migration counts, and lifecycle eligibility tests.

## Rollout, migration, and recovery

Preserve parent-owned profile changes while migrating protected fields; deploy readers before enforcing a new shape, with a restrictive legacy adapter.

## Source evidence

- [firestore.rules:35](../../../firestore.rules#L35)
- [lib/student-service.ts:58](../../../lib/student-service.ts#L58)
- [ios/IEPAndThrive/Core/Data/FirestoreDTOs.swift:14](../../../ios/IEPAndThrive/Core/Data/FirestoreDTOs.swift#L14)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
