# TASK-MVP-031 — Add skippable narration and clean session exit

| Field | Value |
| --- | --- |
| Epic | EPIC-M7 — Adaptive core |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | iOS feature engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-025, TASK-MVP-030 |
| Design | design-studio — skippable narration and clean-exit states, 3 screens |

## Problem and intended outcome

Unskippable narration and forced remedial instruction are known retention risks. The child must be
able to skip instructional audio, retry without a lecture, and leave a session at any moment with
truthful local state.

## Implementation scope

1. Add a reducer-level skip action that calls the retained audio player's `stop()` and advances to
   the next permitted interaction without awarding mastery.
2. Add a clean exit action that commits only completed evidence, cancels transient work, and returns
   to a valid journey state.
3. Make failure feedback optional and bounded by the pacing contract; consume the approved design
   handoff for visible states and accessibility behavior.

## Acceptance criteria

- **Given** narration is playing, **when** the child selects skip, **then** audio stops, no mastery
  is awarded, and the child can continue the current interaction.
- **Given** an item has an incorrect response, **when** the child chooses to continue or exit,
  **then** no remedial lecture is forced and only valid evidence is persisted.
- **Given** the child exits during any engine state, **when** the session returns to the journey,
  **then** transient audio/tasks are cancelled and relaunch has a valid next-item decision.

## Validation and evidence

Run reducer, audio interruption, persistence, and UI tests for every engine state. Perform design and
accessibility QA on skip, retry, and exit states.

## Rollout, migration, and recovery

No destructive migration. If cancellation leaves stale state, discard only the transient session
and reload the last committed local evidence.

## Source evidence

- [SpeechClient.swift](../../../ios/IEPAndThrive/Core/Audio/SpeechClient.swift)
- [LiteracyFeature.swift](../../../ios/IEPAndThrive/Features/Literacy/LiteracyFeature.swift)
- [ADR-000 D2](../../architecture/ADR-000-mvp-architecture-decisions.md#d2--phoneme-audio-is-recorded-never-synthesized)

## Definition of done

Code review is approved; new code has at least 80% coverage; actions and session inputs are
validated; no secrets are hardcoded; cancellation is deterministic; and design QA passes.
