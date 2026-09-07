# TASK-MVP-042 — Add engine golden-file regression tests

| Field | Value |
| --- | --- |
| Epic | EPIC-M10 — Release |
| Priority / release gate | P0 / Stage 3 gate |
| Status | Proposed — review required |
| Proposed owner | Domain test engineer + educator |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-026, TASK-MVP-027, TASK-MVP-029, TASK-MVP-030 |
| Design | None |

## Problem and intended outcome

Placement, blending, word building, and pacing encode pedagogy that can silently change during UI or
content work. Golden fixtures make the expected state transitions and schedules reviewable before
the release archive.

## Implementation scope

1. Define versioned golden files for representative valid, incorrect, retry, placement, mastery,
   spaced-review, skip, and exit scenarios.
2. Serialize only stable Domain outputs and approved aggregate events; exclude timestamps that are
   not injected and any learner identity.
3. Fail tests on unexpected output changes and require an educator-reviewed fixture update for an
   intentional pedagogy change.

## Acceptance criteria

- **Given** unchanged engine inputs and policy versions, **when** golden tests run, **then** output
  matches the checked-in fixture byte-for-byte or by the documented canonical comparison.
- **Given** an engine behavior changes unexpectedly, **when** tests run, **then** CI fails and names
  the changed fixture and field.
- **Given** an intentional policy change, **when** the golden file is updated, **then** the diff has
  educator review and a versioned rationale.

## Validation and evidence

Run Domain unit suite, canonicalization checks, coverage, and CI failure injection. Attach fixture
index and educator approvals.

## Rollout, migration, and recovery

Never update goldens merely to make CI green. Revert the behavior or approve a versioned fixture
change; old fixtures remain available for migration and comparison.

## Source evidence

- [ADR-000 D9](../../architecture/ADR-000-mvp-architecture-decisions.md#d9--clean-architecture-boundaries-enforced-by-the-module-graph)
- [ADR-000 D5](../../architecture/ADR-000-mvp-architecture-decisions.md#d5--placement-is-inferred-never-assessed)

## Definition of done

Code review is approved; new test code has at least 80% coverage where applicable; fixture inputs
are validated; no secrets are hardcoded; CI fails on drift; and educator review is attached.
