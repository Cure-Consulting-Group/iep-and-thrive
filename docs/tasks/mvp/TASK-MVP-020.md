# TASK-MVP-020 — Author closed-syllable level definitions

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

Closed syllables are the core bridge from individual graphemes to decodable words and are needed
for content depth. Author the batch with explicit syllable skill references and real word practice.

## Implementation scope

1. Author closed-syllable levels across the agreed short-vowel patterns, with word lists, skills,
   sequence positions, engines, and audio IDs.
2. Include the educator's progression from single-syllable examples to the approved next complexity
   without introducing activities outside the approved decoding scope.
3. Validate every entry and complete educator review before enabling it in the journey.

## Acceptance criteria

- **Given** the closed-syllable batch, **when** validation runs, **then** each entry has a known
  skill, supported engine, reachable order, pronounceable words, and audio IDs.
- **Given** the educator checks the progression, **when** examples are reviewed, **then** the
  sequence and target patterns match the approved scope and no row is silently omitted.
- **Given** a child practices a closed-syllable level, **when** the item completes, **then** the
  local evidence names the closed-syllable skill rather than only the level ID.

## Validation and evidence

Attach educator sign-off, validator report, word inventory, and one local evidence fixture.

## Rollout, migration, and recovery

Content-only. Keep a prior validated corpus if a batch fails and do not expose partially reviewed
levels.

## Source evidence

- [product brief](../../research/2026-09-06-product-brief.md#7-content--the-binding-constraint)
- [ADR-000 D4](../../architecture/ADR-000-mvp-architecture-decisions.md#d4--skills-are-a-first-class-taxonomy-separate-from-levels)

## Definition of done

Educator approval, passing validator/CI output, complete engine/audio references, and a documented
batch count are present.
