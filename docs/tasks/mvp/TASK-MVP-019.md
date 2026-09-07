# TASK-MVP-019 — Author r-controlled-vowel level definitions

| Field | Value |
| --- | --- |
| Epic | EPIC-M4 — Curriculum authoring |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Educator / curriculum author |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-011, TASK-MVP-014, TASK-MVP-026, TASK-MVP-027 |
| Design | None |

## Problem and intended outcome

R-controlled vowels are part of the educator's decoding floor but absent from the current corpus.
Author them as real skill encounters with word-building and blending support where specified.

## Implementation scope

1. Author the r-controlled-vowel batch with stable skills, examples, engine IDs, phoneme and word
   audio IDs, and sequence positions.
2. Include a deliberate progression and enough examples for repeated practice; document any scope
   row that is intentionally deferred to a later corpus version.
3. Run schema validation, pronunciation validation, and educator review.

## Acceptance criteria

- **Given** the batch is submitted, **when** validation runs, **then** all levels are reachable,
  engine-backed, skill-linked, pronounceable, and audio-complete.
- **Given** a reviewer checks the examples, **when** they compare them with the approved scope,
  **then** the target sound pattern is represented without unsupported claims.
- **Given** the child enters one of these levels, **when** a word response is submitted, **then** the
  declared skill event is emitted locally with the correct level ID.

## Validation and evidence

Attach educator review, corpus diff, validator output, and a local skill-event sample.

## Rollout, migration, and recovery

Content-only. Quarantine any failed definition and keep the prior validated bundle; no validator
rule may be bypassed to meet a date.

## Source evidence

- [product brief](../../research/2026-09-06-product-brief.md#7-content--the-binding-constraint)
- [ADR-000 D3](../../architecture/ADR-000-mvp-architecture-decisions.md#d3--content-is-data-validated-in-ci-never-code)

## Definition of done

Educator approval, complete data fields, passing validator/CI output, and an explicit count against
the scope are recorded.
