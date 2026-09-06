# TASK-LP-023 — Separate attempts, assistance, completion, skips, and Sparks

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P0 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | iOS + learning engineer + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F02](../../audits/2026-09-05/product-direction/findings.md#f02), [F03](../../audits/2026-09-05/product-direction/findings.md#f03) |
| Dependencies | [TASK-LP-025](TASK-LP-025.md) |

## Problem and intended outcome

Tapping Done on a blank literacy tray advances the journey and records score 10. That score is the same constant as the reward, so the records do not establish skill success.

## Implementation scope

1. Replace mission-complete as the sole outcome with attempted, skipped, completed-with-help, independent-success, and interrupted outcomes appropriate to the activity.
2. Require the activity validator before independent-success; retain a supportive exit that cannot manufacture success.
3. Store observed response, validator result, assistance, and reward decision separately; make repeated callbacks idempotent.
4. Relabel legacy score/completion displays as historical practice telemetry and exclude them from mastery calculations.

## Acceptance criteria

- **Given** the literacy tray is blank, **when** Done or exit is tapped, **then** the learner can leave without independent-success or mastery being recorded.

- **Given** an activity is completed with help, **when** a reward is issued, **then** the record retains the assistance and the reward is not presented as assessment accuracy.

## Validation and evidence

TestStore regressions for blank, partial, valid, assisted, skipped, repeated completion, and interrupted saves; inspect persisted event payloads and adult UI labels.

## Rollout, migration, and recovery

Introduce versioned outcomes and a compatibility reader. Do not backfill independent success from old score constants.

## Source evidence

- [ios/IEPAndThrive/Features/Root/RootFeature.swift:258](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L258)
- [ios/IEPAndThrive/Features/Journey/JourneyFeature.swift:78](../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift#L78)
- [ios/IEPAndThrive/Features/Literacy/SandTrayView.swift:121](../../../ios/IEPAndThrive/Features/Literacy/SandTrayView.swift#L121)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
