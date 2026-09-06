# TASK-LP-028 — Implement the native passage-based reading quest

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P1 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | iOS + design |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F02](../../audits/2026-09-05/product-direction/findings.md#f02), [F34](../../audits/2026-09-05/product-direction/findings.md#f34) |
| Dependencies | [TASK-LP-025](TASK-LP-025.md), [TASK-LP-027](TASK-LP-027.md) |

## Problem and intended outcome

The native literacy renderer only offers tracing. Implement the approved reading interaction with a bounded task sequence and recoverable state.

## Implementation scope

1. Add typed TCA state/actions for passage presentation, prompt, response, review, help, save, pause, and exit; keep content separate from renderer logic.
2. Support accessible evidence selection and a child explanation mode approved by the educator; for the first prototype use structured responses and adult-observed explanation rather than unvalidated speech scoring.
3. Persist in-progress state under the scoped learner and use the shared event contract for outcomes.
4. Provide offline content, loading/error recovery, no-content fallback, session boundaries, and a clear return to the journey.

## Acceptance criteria

- **Given** an approved quest is assigned, **when** the child opens it, **then** the passage, prompt, help, and response align with the same content version.

- **Given** the app is interrupted before submission, **when** the child resumes, **then** the saved response returns without duplicate outcome or reward.

## Validation and evidence

TestStore action/effect tests, UI happy path plus interruption/error cases, VoiceOver and switch-friendly response controls, and educator walkthrough using the approved content.

## Rollout, migration, and recovery

Use an internal feature switch until G2 prerequisites are complete. Do not expose child data collection through a public prototype.

## Source evidence

- [ios/IEPAndThrive/Features/Root/RootFeature.swift:329](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L329)
- [ios/IEPAndThrive/Features/Literacy/LiteracyView.swift:45](../../../ios/IEPAndThrive/Features/Literacy/LiteracyView.swift#L45)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
