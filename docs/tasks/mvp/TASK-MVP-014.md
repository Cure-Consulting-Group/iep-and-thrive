# TASK-MVP-014 — Define the first-class skill taxonomy

| Field | Value |
| --- | --- |
| Epic | EPIC-M3 — Content platform |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | Educator + content platform engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-011 |
| Design | None |

## Problem and intended outcome

Progress must describe skills, not level numbers, even though the visible record is deferred. The
taxonomy gives every authored encounter stable skill IDs for mastery, pacing, measurement, and a
future evidence view.

## Implementation scope

1. Author the MVP taxonomy for phonemes/graphemes, digraphs, blends, vowel teams, r-controlled
   vowels, closed syllables, open syllables, blending, and word building.
2. Define stable IDs, names, parent/child relationships where needed, and a versioning policy; do
   not include unsupported diagnostic claims or capabilities outside the approved decoding scope.
3. Add schema references and validator checks so every level has at least one known skill and no
   orphan skill is shipped without an explicit taxonomy decision.

## Acceptance criteria

- **Given** an MVP level definition, **when** its skill references are resolved, **then** every ID
  maps to one reviewed taxonomy entry with a stable meaning.
- **Given** a level references an unknown or retired skill, **when** validation runs, **then** it
  fails with the level ID and skill ID.
- **Given** a skill meaning changes, **when** the taxonomy version increments, **then** existing
  evidence can still resolve the prior version without relabeling history.

## Validation and evidence

Educator review the taxonomy against the 98-row scope and sequence. Run schema and validator tests,
including unknown, duplicate, retired, and orphan IDs; attach the reviewed taxonomy diff.

## Rollout, migration, and recovery

Add taxonomy version metadata before corpus migration. Retain retired definitions for historical
resolution; do not delete IDs used by local evidence.

## Source evidence

- [ADR-000 D4](../../architecture/ADR-000-mvp-architecture-decisions.md#d4--skills-are-a-first-class-taxonomy-separate-from-levels)
- [product brief](../../research/2026-09-06-product-brief.md#7-content--the-binding-constraint)

## Definition of done

The educator-approved taxonomy is versioned, schema-linked, validator-covered, and has at least 80%
coverage for new validation code; no secrets are hardcoded and no unsupported skill claim appears.
