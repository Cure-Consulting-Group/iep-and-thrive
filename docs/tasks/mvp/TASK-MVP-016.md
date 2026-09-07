# TASK-MVP-016 — Author digraph level definitions

| Field | Value |
| --- | --- |
| Epic | EPIC-M4 — Curriculum authoring |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Educator / curriculum author |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-011, TASK-MVP-014, TASK-MVP-026 |
| Design | None |

## Problem and intended outcome

The authored scope requires a sustained decoding sequence beyond the initial entries. Add the
digraph batch as validated data so each encounter teaches a real two-letter one-sound skill through
the available engines.

## Implementation scope

1. Author the educator-approved digraph set, examples, sequence position, skill IDs, engine IDs,
   difficulty notes, and audio IDs in the JSON corpus.
2. Produce enough entries to cover the digraph rows in the 98-row scope and sequence without
   introducing activities or unsupported engine behavior outside the approved decoding scope.
3. Run validator and educator review; resolve every missing audio or pronunciation issue before
   marking the batch complete.

## Acceptance criteria

- **Given** the digraph batch is loaded, **when** the validator runs, **then** every entry has a
  known skill, supported engine, reachable position, pronounceable item, and audio ID.
- **Given** an educator reviews the batch, **when** sequence and examples are compared with the
  source scope, **then** each planned digraph row is represented exactly once or has a recorded
  rationale.
- **Given** a child reaches a digraph entry, **when** the session starts, **then** it invokes a
  real engine and never falls back to tracing the level label.

## Validation and evidence

Attach the educator review, corpus diff, validator output, and sample engine-session evidence.

## Rollout, migration, and recovery

Content-only bundle change. If a batch fails validation, quarantine those entries and ship the last
validated corpus; do not bypass the CI gate.

## Source evidence

- [product brief](../../research/2026-09-06-product-brief.md#7-content--the-binding-constraint)
- [ADR-000 D3](../../architecture/ADR-000-mvp-architecture-decisions.md#d3--content-is-data-validated-in-ci-never-code)

## Definition of done

Educator approval, complete metadata, passing validator/CI output, and no unsupported visual or
engineering behavior are required.
