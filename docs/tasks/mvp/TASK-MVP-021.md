# TASK-MVP-021 — Author open-syllable level definitions

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

Open syllables complete the MVP's named decoding floor and extend the sequence beyond the first
weeks. Author the final curriculum batch with stable skills and real engine-backed practice.

## Implementation scope

1. Author open-syllable levels, examples, skills, engine IDs, sequence positions, and phoneme/word
   audio IDs against the approved scope and sequence.
2. Ensure the full M4 set totals roughly 90 new definitions and brings the validated corpus to about
   120 reachable levels when combined with the migrated seed.
3. Complete educator review and the final corpus validation report.

## Acceptance criteria

- **Given** the complete curriculum corpus, **when** validation runs, **then** the M4 batches and
  migrated seed are reachable, engine-backed, skill-linked, pronounceable, and audio-complete.
- **Given** the educator reviews the open-syllable batch, **when** it is compared with the scope,
  **then** order, examples, and intended skill progression are approved.
- **Given** the app loads the final corpus, **when** a child reaches an open-syllable level, **then**
  the session invokes its declared engine and records its skill.

## Validation and evidence

Attach the educator approval, complete inventory with counts by batch, validator output, and a sample
session/evidence trace.

## Rollout, migration, and recovery

Content-only. If the final corpus is incomplete, release the last validated corpus only when the
Stage 2 gate explicitly records the shortfall and its effect on the retention experiment.

## Source evidence

- [product brief](../../research/2026-09-06-product-brief.md#7-content--the-binding-constraint)
- [growth timeline](../../research/2026-09-06-growth-timeline.md#phase-1--depth--the-only-thing-that-matters-until-it-is-done)

## Definition of done

Educator approval, roughly 90 new definitions, about 120 reachable validated levels, and passing
validator/CI evidence are recorded; no engineering ticket is hidden in this content task.
