# TASK-LP-025 — Specify versioned learning-event, rubric, and evidence contracts

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P1 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | Learning engineer + backend + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F02](../../audits/2026-09-05/product-direction/findings.md#f02), [F03](../../audits/2026-09-05/product-direction/findings.md#f03), [F36](../../audits/2026-09-05/product-direction/findings.md#f36) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md), [TASK-LP-014](TASK-LP-014.md) |

## Problem and intended outcome

Existing lesson records omit activity identity/version, response, help, rubric, assessment context, and assessor provenance. Define the contract before adding a reading quest or claiming mastery.

## Implementation scope

1. Define activityId/contentVersion/skillIds/rubricVersion, attemptId, learner key, response type, response, assistance, duration, context, timestamps, and provenance with size/privacy bounds.
2. Separate self-reported practice, server-validated activity results, and educator-verified independent assessments; specify exactly what each can support.
3. Define rewards as an independent ledger and progress as a reproducible projection; record corrections without erasing original observations.
4. Generate or share schema fixtures for Swift/TypeScript; document unknown-version, offline event, duplicate, clock-skew, and malformed input behavior.

## Acceptance criteria

- **Given** a client submits a reward as a learning score, **when** the event is validated, **then** it cannot enter the independent assessment record.

- **Given** a rubric changes, **when** an old attempt is rendered, **then** its original rubric/version and interpretation remain available.

## Validation and evidence

Contract fixtures, schema bounds, idempotency and provenance tampering tests, and educator review of what every field observes. No voice recording required for this contract.

## Rollout, migration, and recovery

Add new versioned collections/endpoints with read compatibility; preserve old records as unverified legacy practice.

## Source evidence

- [ios/IEPAndThrive/Core/Data/Models.swift:28](../../../ios/IEPAndThrive/Core/Data/Models.swift#L28)
- [lib/ios-progress.ts:63](../../../lib/ios-progress.ts#L63)
- [lib/assessment-service.ts:39](../../../lib/assessment-service.ts#L39)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
