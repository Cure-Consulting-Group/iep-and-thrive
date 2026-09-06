# TASK-LP-029 — Implement explicit help, accommodations, and educational feedback

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Educator + iOS + learning engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F02](../../audits/2026-09-05/product-direction/findings.md#f02), [F03](../../audits/2026-09-05/product-direction/findings.md#f03), [F30](../../audits/2026-09-05/product-direction/findings.md#f30) |
| Dependencies | [TASK-LP-027](TASK-LP-027.md), [TASK-LP-028](TASK-LP-028.md) |

## Problem and intended outcome

A supportive product needs to distinguish access accommodations from instruction that changes the task. Current completion records do not capture help or why a child struggled.

## Implementation scope

1. Implement a reviewed help ladder: repeat instructions, vocabulary/context support, evidence cue, modeled example, and adult help where appropriate.
2. Record which supports were used and when; agree which supports preserve independent assessment conditions for the specific skill.
3. Give explanatory, nonpunitive feedback tied to observed responses; avoid generic success for incorrect answers or diagnostic labels.
4. Allow pause/skip and sensory preferences without loss framing; send adults actionable context rather than unsupported mastery summaries.

## Acceptance criteria

- **Given** a child requests instructional help, **when** a support is shown, **then** the help is recorded and the outcome is no longer mislabeled independent.

- **Given** an accessibility accommodation is used, **when** the result is interpreted, **then** the approved rubric applies the correct accommodation policy.

## Validation and evidence

Golden response/help scenarios reviewed by the educator, telemetry payload tests, no-answer leakage checks, and usability observation with the approved pilot protocol.

## Rollout, migration, and recovery

Version help content and rubric policies; preserve previous interpretation for older attempts.

## Source evidence

- [ios/IEPAndThrive/Features/Literacy/LiteracyFeature.swift:1](../../../ios/IEPAndThrive/Features/Literacy/LiteracyFeature.swift#L1)
- [ios/IEPAndThrive/Features/Math/MathFeature.swift:1](../../../ios/IEPAndThrive/Features/Math/MathFeature.swift#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
