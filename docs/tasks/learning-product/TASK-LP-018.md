# TASK-LP-018 — Restore progress and active learner before enabling the journey

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F04](../../audits/2026-09-05/product-direction/findings.md#f04), [F05](../../audits/2026-09-05/product-direction/findings.md#f05) |
| Dependencies | [TASK-LP-017](TASK-LP-017.md), [TASK-LP-019](TASK-LP-019.md), [TASK-LP-020](TASK-LP-020.md) |

## Problem and intended outcome

Journey starts at zero and only loads the catalog; selected student identity is in memory. Signing into an account can select a child without loading that child’s profile or history.

## Implementation scope

1. Persist the approved active identity and hydrate scoped local progress/rewards before interaction; reconcile cloud data with an explicit loading/offline/failed state.
2. Revalidate child access at cold start; provide an adult child switcher after onboarding, including no-child and removed-child cases.
3. Make root effects cancelable and generation-bound so late sign-in/student responses cannot alter the current account.
4. Separate first use, restored user, failed load, empty history, completed catalog, and revoked access; show recoverable adult errors.

## Acceptance criteria

- **Given** a learner completed prior activities, **when** the app cold-starts offline, **then** the correct scoped progress is restored before nodes become interactive.

- **Given** a previous account fetch finishes after switching, **when** the result arrives, **then** it is ignored and no writes use the new account with old learner state.

## Validation and evidence

Real persistence plus TestStore lifecycle tests: process restart, network outage, two devices, child deletion, sign-out during fetch, picker dismissal, and changed catalog versions.

## Rollout, migration, and recovery

Enable hydration behind a testable release switch; never reset history to zero as a silent fallback for a failed read.

## Source evidence

- [ios/IEPAndThrive/Features/Journey/JourneyFeature.swift:44](../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift#L44)
- [ios/IEPAndThrive/Features/Root/RootFeature.swift:45](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L45)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
