# TASK-LP-046 — Version educator assessments and preserve longitudinal history

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-06](../../audits/2026-09-05/product-direction/epics.md#epic-lp-06) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Backend + web + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F09](../../audits/2026-09-05/product-direction/findings.md#f09), [F10](../../audits/2026-09-05/product-direction/findings.md#f10), [F36](../../audits/2026-09-05/product-direction/findings.md#f36) |
| Dependencies | [TASK-LP-007](TASK-LP-007.md), [TASK-LP-014](TASK-LP-014.md), [TASK-LP-025](TASK-LP-025.md) |

## Problem and intended outcome

Assessment IDs are only pre/post plus studentId, and weekly probe IDs reuse week/type/studentId. New cohorts can overwrite prior evidence; instrument names and numbers alone do not establish comparable results.

## Implementation scope

1. Include learner, administration, program/cohort, instrument/version/form, rubric, assessor, conditions, and time in the evidence model.
2. Store immutable administrations and auditable corrections; validate numeric bounds and distinguish raw, standard, percentile, informal, and missing values.
3. Prevent invalid cross-instrument or differently accommodated comparisons; keep licensed instrument content outside redistribution unless authorized.
4. Update capture/comparison UI and separate private observations from shared results.

## Acceptance criteria

- **Given** a learner receives a second pre-assessment in a new program, **when** it is saved, **then** the first administration remains intact.

- **Given** different instruments or forms are selected, **when** a comparison is rendered, **then** the UI identifies non-comparability instead of presenting a misleading gain.

## Validation and evidence

History collision tests, invalid score/missing-value fixtures, permission tests, audit correction tests, and educator review of comparison rules.

## Rollout, migration, and recovery

Migrate legacy records with explicit unknown administration context; do not invent missing baseline dates or instrument versions.

## Source evidence

- [lib/assessment-service.ts:54](../../../lib/assessment-service.ts#L54)
- [lib/probe-service.ts:59](../../../lib/probe-service.ts#L59)
- [components/admin/AssessmentBatteryView.tsx:1](../../../components/admin/AssessmentBatteryView.tsx#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
