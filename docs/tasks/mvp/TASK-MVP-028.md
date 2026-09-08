# TASK-MVP-028 — Connect literacy sessions to teaching engines

| Field | Value |
| --- | --- |
| Epic | EPIC-M6 — Teaching engines |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | iOS feature engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-015, TASK-MVP-025, TASK-MVP-026, TASK-MVP-027 |
| Design | design-studio — literacy engine state map, 4 screens |

## Problem and intended outcome

The current LiteracyFeature sends every literacy target through tracing. Connect validated corpus
engine IDs to the correct Domain engine, audio asset, completion event, and local evidence state.

## Implementation scope

1. Add a Presentation adapter that maps corpus engine IDs to BlendingEngine, WordBuildingEngine, or
   the existing tracer without placing pedagogy in SwiftUI.
2. Render engine state through the approved state map, route user actions to Domain evaluation, and
   send only typed results to pacing and persistence.
3. Handle unknown engine IDs and missing assets as safe, testable errors before a child begins.

## Acceptance criteria

- **Given** a corpus entry with a supported engine ID, **when** a literacy session starts, **then**
  the matching engine state and recorded audio asset are selected.
- **Given** a corpus entry has an unknown engine or missing audio, **when** session setup runs,
  **then** it refuses the item with a typed error and does not present a false activity.
- **Given** a child submits a correct or incorrect engine response, **when** the reducer handles it,
  **then** it emits the typed result once and remains usable for retry or exit.

## Validation and evidence

Run reducer tests for every engine, missing asset, invalid input, completion, retry, and exit path;
run a device flow and design QA against the handoff.

## Rollout, migration, and recovery

Enable adapters only for validator-approved entries. If an adapter fails, quarantine the affected
level and preserve all local evidence already written.

## Source evidence

- [LiteracyFeature.swift](../../../ios/IEPAndThrive/Features/Literacy/LiteracyFeature.swift)
- [LevelDefinition in CurriculumClient.swift](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift)

## Definition of done

Code review is approved; new code has at least 80% coverage; engine and asset inputs are validated;
no secrets are hardcoded; Domain remains pure; and design QA signs off the state map.
