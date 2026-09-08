# TASK-MVP-027 — Implement the pure WordBuildingEngine

| Field | Value |
| --- | --- |
| Epic | EPIC-M6 — Teaching engines |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Domain engineer + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-011, TASK-MVP-014 |
| Design | None |

## Problem and intended outcome

Word building needs Elkonin-box semantics: one box per sound unit, a validated word target, and a
response that can be evaluated without view code. This is the second teaching interaction required
to make the curriculum truthful.

## Implementation scope

1. Define pure Domain types for sound boxes, target word, tile/response state, result, and typed
   invalid-input errors.
2. Implement placement, replacement, removal, and evaluation rules for the approved word patterns;
   keep grapheme-to-phoneme mapping explicit and validated.
3. Add educator-approved fixtures for correct, incomplete, extra, reordered, and invalid responses.

## Acceptance criteria

- **Given** a valid target word and one response per sound box, **when** evaluation runs, **then**
  the result identifies correct order and the associated skill deterministically.
- **Given** an extra tile, missing box, or unmapped grapheme, **when** evaluation runs, **then** it
  returns a typed failure, preserves recoverable state, and does not award mastery.
- **Given** the Domain target, **when** imports are inspected, **then** no UI, persistence, audio,
  Firebase, or network framework is referenced.

## Validation and evidence

Run fixture, property, invalid-input, and coverage tests; attach educator review and module-graph
evidence.

## Rollout, migration, and recovery

Expose the engine through a test adapter before session wiring. Preserve fixture history when an
educator changes a sound mapping.

## Source evidence

- [LiteracyFeature.swift](../../../ios/IEPAndThrive/Features/Literacy/LiteracyFeature.swift)
- [ADR-000 D9](../../architecture/ADR-000-mvp-architecture-decisions.md#d9--clean-architecture-boundaries-enforced-by-the-module-graph)

## Definition of done

Code review is approved; new Domain code has at least 80% coverage; inputs are validated; no secrets
are hardcoded; and the engine remains independent of Presentation and Data.
