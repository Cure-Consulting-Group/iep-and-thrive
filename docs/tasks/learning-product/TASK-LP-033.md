# TASK-LP-033 — Build a minimal practitioner assignment and review workflow

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P1 / G4: institutional use |
| Status | Proposed — review required |
| Proposed owner | Web + backend + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F34](../../audits/2026-09-05/product-direction/findings.md#f34), [F35](../../audits/2026-09-05/product-direction/findings.md#f35) |
| Dependencies | [TASK-LP-022](TASK-LP-022.md), [TASK-LP-026](TASK-LP-026.md), [TASK-LP-031](TASK-LP-031.md), [TASK-LP-032](TASK-LP-032.md) |

## Problem and intended outcome

Existing staff pages are cohort curriculum and assessment tools for one operator. Independent practitioners need a constrained workflow for assigned learners without platform-admin access.

## Implementation scope

1. Provide assigned-learner roster, select approved reading content, set expected practice, inspect evidence, and leave a parent-visible next-step note.
2. Separate private observation, shared feedback, and verified assessment permissions; avoid exposing family billing/intake to practitioners.
3. Support assignment expiry, learner withdrawal, bulk operations with explicit preview, and clear empty/error states.
4. Keep the initial workflow small; defer district SIS integrations, complex timetable management, and large organization billing until demand is demonstrated.

## Acceptance criteria

- **Given** a practitioner has two assigned learners, **when** they create an assignment, **then** only authorized learners and published compatible content can be selected.

- **Given** a family revokes sharing, **when** the practitioner opens a saved link, **then** the record is inaccessible without leaking cached details.

## Validation and evidence

Role-based integration tests, revoked-invitation scenarios, assignment lifecycle E2E, and observed practitioner task-completion time.

## Rollout, migration, and recovery

Enable for reviewed pilot grants only. Do not turn existing global admin pages into customer-facing staff access by relabeling navigation.

## Source evidence

- [app/admin/curriculum/page.tsx:1](../../../app/admin/curriculum/page.tsx#L1)
- [app/admin/students/page.tsx:1](../../../app/admin/students/page.tsx#L1)
- [firestore.rules:11](../../../firestore.rules#L11)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
