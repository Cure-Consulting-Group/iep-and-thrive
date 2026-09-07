# TASK-MVP-030 — Implement mastery and spaced-review pacing

| Field | Value |
| --- | --- |
| Epic | EPIC-M7 — Adaptive core |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Domain engineer + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-014, TASK-MVP-028, TASK-MVP-029 |
| Design | None |

## Problem and intended outcome

The journey currently advances by level index and sparks rather than skill mastery. Pacing must use
correctness and review intervals to decide the next item while allowing a child to continue after a
miss.

## Implementation scope

1. Define pure mastery states and transitions from typed engine results, including emerging,
   practicing, and mastered without claiming diagnostic status.
2. Define deterministic spaced-review scheduling with bounded new-item introduction, retry handling,
   and a clean exit result at any point.
3. Expose the next-item decision to the session adapter and persistence contract; do not put timing
   or pedagogy rules in SwiftUI.

## Acceptance criteria

- **Given** a correct response on a skill, **when** pacing evaluates it, **then** mastery evidence
  advances according to the approved threshold and the next review date is deterministic.
- **Given** an incorrect response, **when** pacing evaluates it, **then** the skill remains available
  for practice or later review without an imposed lecture or data loss.
- **Given** a session exits before completion, **when** pacing commits state, **then** no new mastery
  is awarded and the next launch has a valid resumable decision.

## Validation and evidence

Run fixtures across new, repeated, correct, incorrect, skipped, and interrupted sessions. Verify
coverage and compare schedules with the educator-approved table.

## Rollout, migration, and recovery

Version the pacing policy with local evidence. If thresholds change, apply them only to future
decisions and retain prior mastery transitions.

## Source evidence

- [ADR-000 D4](../../architecture/ADR-000-mvp-architecture-decisions.md#d4--skills-are-a-first-class-taxonomy-separate-from-levels)
- [ADR-000 D5](../../architecture/ADR-000-mvp-architecture-decisions.md#d5--placement-is-inferred-never-assessed)

## Definition of done

Code review is approved; new Domain code has at least 80% coverage; results and dates are validated;
no secrets are hardcoded; and schedule fixtures are educator-reviewed.
