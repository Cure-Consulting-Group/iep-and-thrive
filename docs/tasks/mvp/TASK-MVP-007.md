# TASK-MVP-007 — Remove non-engine-backed literacy entries

| Field | Value |
| --- | --- |
| Epic | EPIC-M2 — A truthful app |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS curriculum engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001 |
| Design | design-studio — truthful journey states, 2 screens |

## Problem and intended outcome

Six literacy literals currently name predict, monitor, retell, main idea, details, and topic
activities that have no engine. A child can reach them and be asked to trace a label, so the
journey must contain only levels with a real supported engine.

## Implementation scope

1. Remove the six entries from the current bundle and any title/description mapping that makes them
   appear valid.
2. Ensure journey ordering, unlock state, and level preview skip removed IDs without crashing or
   leaving an unreachable node.
3. Add a regression fixture that enumerates all shipped levels and asserts each has a registered
   engine; future content enforcement belongs to 011–013.

## Acceptance criteria

- **Given** the bundled curriculum loads, **when** the level list is enumerated, **then** none of
  the six removed IDs or their labels appears in the child journey.
- **Given** a stored progress index points after a removed entry, **when** the app relaunches,
  **then** it resolves to the next valid engine-backed level without losing local evidence.
- **Given** a level has no registered engine, **when** the regression fixture runs, **then** the test
  fails before release.

## Validation and evidence

Run curriculum, JourneyFeature, and migration-path tests. Inspect a full journey snapshot and attach
the level inventory showing only engine-backed entries.

## Rollout, migration, and recovery

Treat removed IDs as retired, not deleted from historical local evidence. Map an old index by stable
ID to the next valid level; never rewrite a child's completed evidence as if the retired item ran.

## Source evidence

- [CurriculumClient.swift](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift)
- [JourneyFeature.swift](../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift)

## Definition of done

Code review is approved; new code has at least 80% coverage; the engine registry and inputs are
validated; no secrets are hardcoded; and design QA confirms the journey has no phantom state.
