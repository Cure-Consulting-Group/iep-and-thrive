# TASK-MVP-026 — Implement the pure BlendingEngine

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

The current literacy path is tracing-only. A pure blending engine must present ordered phoneme units,
accept a child response, and produce a deterministic result without importing UI, persistence, or
network code.

## Implementation scope

1. Define Domain value types for phoneme sequence, prompt, response, result, error, and retry state.
2. Implement ordered blending evaluation with validated inputs, tolerant interaction state, and
   explicit success/failure output for pacing and measurement consumers.
3. Add educator-approved fixtures for beginning/ending blends and malformed/empty inputs.

## Acceptance criteria

- **Given** a valid phoneme sequence and matching response, **when** evaluation runs, **then** the
  result is correct, deterministic, and includes the declared skill ID.
- **Given** an incomplete, reordered, or malformed response, **when** evaluation runs, **then** it
  returns a typed non-crashing failure and does not award mastery.
- **Given** the Domain target, **when** its imports are inspected, **then** it has no SwiftUI,
  SwiftData, AVFoundation, Firebase, or Composable Architecture dependency.

## Validation and evidence

Run golden fixtures, property tests for ordering and empty input, and coverage reporting. Attach
educator review of fixtures and the module-graph result.

## Rollout, migration, and recovery

Add the engine behind a test adapter before 028 wires it to sessions. If a fixture changes, preserve
the prior expected result and document the pedagogy decision.

## Source evidence

- [LiteracyFeature.swift](../../../ios/IEPAndThrive/Features/Literacy/LiteracyFeature.swift)
- [ADR-000 D9](../../architecture/ADR-000-mvp-architecture-decisions.md#d9--clean-architecture-boundaries-enforced-by-the-module-graph)

## Definition of done

Code review is approved; new Domain code has at least 80% coverage; inputs are validated; no secrets
are hardcoded; and the module graph proves the engine is pure.
