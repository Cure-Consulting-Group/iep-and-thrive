# TASK-MVP-018 — Author vowel-team level definitions

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

The initial corpus has a few vowel teams but not the depth needed to carry a child toward week
eight. Add a reviewed vowel-team sequence using the same validated engine and audio contract.

## Implementation scope

1. Author vowel-team entries, examples, skills, engine IDs, sequence order, contrast pairs where
   pedagogically required, and audio IDs.
2. Match the existing 98-row scope and sequence and avoid unsupported claims about learner ability.
3. Validate and review the complete batch before it becomes reachable in the journey.

## Acceptance criteria

- **Given** the vowel-team batch, **when** validation runs, **then** every item has a known skill,
  supported engine, pronounceable mapping, and present audio asset.
- **Given** the educator reviews the scope mapping, **when** the batch is compared with the source,
  **then** order and examples are approved with no duplicate or skipped planned row.
- **Given** a child reaches a vowel-team level, **when** the session begins, **then** it uses the
  declared real engine and records the declared skill.

## Validation and evidence

Attach the educator sign-off, validator report, corpus diff, and audio manifest references.

## Rollout, migration, and recovery

Content-only bundle change. Revert to the last validated corpus if any entry cannot be pronounced or
played; retain the failed batch for correction.

## Source evidence

- [CurriculumClient.swift](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift)
- [ADR-000 D4](../../architecture/ADR-000-mvp-architecture-decisions.md#d4--skills-are-a-first-class-taxonomy-separate-from-levels)

## Definition of done

Educator approval, complete schema fields, passing validator/CI output, and an inventory count are
attached; no code change is required for authoring.
