# TASK-LP-031 — Replace linear unlocks with reviewed skill-based assignments

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Learning engineer + educator + iOS |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F02](../../audits/2026-09-05/product-direction/findings.md#f02), [F04](../../audits/2026-09-05/product-direction/findings.md#f04), [F33](../../audits/2026-09-05/product-direction/findings.md#f33) |
| Dependencies | [TASK-LP-018](TASK-LP-018.md), [TASK-LP-024](TASK-LP-024.md), [TASK-LP-025](TASK-LP-025.md), [TASK-LP-029](TASK-LP-029.md), [TASK-LP-030](TASK-LP-030.md) |

## Problem and intended outcome

Journey progression is one catalog index and onboarding focus does not drive a demonstrated instructional pathway. Advancement needs explicit rules without overstating adaptive intelligence.

## Implementation scope

1. Define transparent prerequisite, practice, revisit, and independent-check rules for the initial skill band; let the educator override assignments with recorded rationale.
2. Base progression on supported evidence types and task versions, not Sparks or completion count alone.
3. Handle no eligible task, repeated difficulty, missing data, retired content, and completed pathways with supportive next steps.
4. Expose a concise explanation to adults of why the next task was selected; keep the pilot rule-based and reviewed.

## Acceptance criteria

- **Given** a learner earns many Sparks without eligible success evidence, **when** the next assignment is computed, **then** mastery is not inferred.

- **Given** an educator overrides a task, **when** the learner resumes, **then** the override is applied with a visible audit trail and compatibility checks.

## Validation and evidence

Deterministic pathway fixtures across assistance/outcome combinations, boundary and no-content tests, replay reproducibility, and educator review. Report the system as rule-based assignment until adaptation is validated.

## Rollout, migration, and recovery

Run new recommendations in shadow mode against synthetic/pilot records before enabling automatic assignment. Preserve the previous safe assignment for rollback.

## Source evidence

- [ios/IEPAndThrive/Features/Journey/JourneyFeature.swift:8](../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift#L8)
- [ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift:9](../../../ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift#L9)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
