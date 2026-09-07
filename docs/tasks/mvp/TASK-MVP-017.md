# TASK-MVP-017 — Author blend level definitions

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

Blends require the child to combine adjacent sounds and to build words, not merely identify a
grapheme. Author the beginning and ending blend sequence against the educator's scope.

## Implementation scope

1. Author beginning and ending blend levels with skills, word lists, engine IDs, sequence order,
   difficulty progression, and audio references.
2. Include enough varied examples for repeated practice without adding unsupported curriculum areas.
3. Run validator and educator review with the blending and word-building engine contracts.

## Acceptance criteria

- **Given** each blend definition, **when** the corpus validator runs, **then** its items map to the
  declared engine and every phoneme/word has a bundled audio ID.
- **Given** an educator checks the batch, **when** examples are read against the scope and sequence,
  **then** sound order, position, and progression are approved.
- **Given** a child starts a blend level, **when** the engine session begins, **then** it presents a
  blend task rather than a label-tracing fallback.

## Validation and evidence

Attach educator approval, validator output, word inventory, and one session trace for each engine
type used.

## Rollout, migration, and recovery

Bundle only after validation. Quarantine failed entries and keep the prior corpus available for a
release candidate; do not relax pronunciation or engine rules.

## Source evidence

- [product brief](../../research/2026-09-06-product-brief.md#7-content--the-binding-constraint)
- [CurriculumClient.swift](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift)

## Definition of done

Educator approval, passing validator/CI output, complete skills/engines/audio, and a documented
batch count against the scope are present.
