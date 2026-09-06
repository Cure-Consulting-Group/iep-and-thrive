# TASK-LP-030 — Implement independent checks and educator verification

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Learning engineer + backend + web + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F36](../../audits/2026-09-05/product-direction/findings.md#f36) |
| Dependencies | [TASK-LP-025](TASK-LP-025.md), [TASK-LP-027](TASK-LP-027.md), [TASK-LP-046](TASK-LP-046.md) |

## Problem and intended outcome

The current app and report templates do not establish transfer to fresh reading tasks. Add an independent-check workflow with provenance and restrained interpretation.

## Implementation scope

1. Assign fresh content under a defined administration protocol; record support conditions, task version, response, assessor, and missing/aborted states.
2. Create a staff review screen to score with a versioned rubric, attach rationale, resolve uncertain responses, and record corrections.
3. Separate descriptive within-learner change from causal effectiveness claims; disallow incomparable instrument/condition aggregation.
4. Protect raw assessment items and learner responses according to role and retention policy; make accessible adult reports available.

## Acceptance criteria

- **Given** a task was practiced or received answer-revealing help, **when** independent scoring is requested, **then** the record is flagged as ineligible or assisted.

- **Given** two reviewers disagree, **when** a score is finalized, **then** the resolution and original ratings are retained.

## Validation and evidence

Rubric calibration on synthetic responses, inter-rater workflow rehearsal, permission tests, missing data/zero baseline handling, and version-comparability checks. No normative claims from informal items.

## Rollout, migration, and recovery

Release with limited reviewed instruments; preserve historical practice as a separate stream and do not retroactively verify it.

## Source evidence

- [lib/assessment-service.ts:69](../../../lib/assessment-service.ts#L69)
- [components/admin/AssessmentBatteryView.tsx:1](../../../components/admin/AssessmentBatteryView.tsx#L1)
- [docs/audits/2026-09-05/build-audit.md:115](../../../docs/audits/2026-09-05/build-audit.md#L115)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
