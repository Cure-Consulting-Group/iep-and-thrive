# TASK-MVP-029 — Implement inferred, easy-biased placement

| Field | Value |
| --- | --- |
| Epic | EPIC-M7 — Adaptive core |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Domain engineer + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-015, TASK-MVP-026, TASK-MVP-027, TASK-MVP-028 |
| Design | None |

## Problem and intended outcome

The first session must teach immediately and infer placement from performance rather than administer
an assessment. Starting too easy is safer than starting too hard, and the engine must advance
quickly when evidence is clear.

## Implementation scope

1. Define a pure placement policy over early item results, skill prerequisites, and confidence;
   include a conservative lower-bound bias and a fast-advance rule for clear success.
2. Exclude names, ages, adult input, and any remote signal from placement inputs.
3. Emit a selected starting level and explainable decision trace for local tests, not learner-facing
   claims; add fixtures for struggling, mixed, and clearly advanced performance.

## Acceptance criteria

- **Given** no prior evidence, **when** the first session starts, **then** placement chooses the
  configured easy-biased starting item without showing an assessment.
- **Given** early failures, **when** placement updates, **then** it moves no harder than the safe
  policy allows and does not force a remedial lecture.
- **Given** clear success on early items, **when** placement updates, **then** it can advance within
  the configured bound rather than trapping the child in repeated easy items.

## Validation and evidence

Run deterministic Domain fixtures, property tests for monotonic safety, and a session-level test.
Measure week-two continuation as the product metric named in the measurement plan, not placement
accuracy.

## Rollout, migration, and recovery

Store only the selected level and approved skill evidence through 032. If a policy bug is found,
use the prior safe lower-bound policy for existing devices and preserve the decision trace.

## Source evidence

- [ADR-000 D5](../../architecture/ADR-000-mvp-architecture-decisions.md#d5--placement-is-inferred-never-assessed)
- [JourneyFeature.swift](../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift)

## Definition of done

Code review is approved; new Domain code has at least 80% coverage; inputs are validated; no secrets
are hardcoded; and no adult or diagnostic data enters placement.
