# TASK-MVP-002 — Integrate Declared Age Range API with immediate signal deletion

| Field | Value |
| --- | --- |
| Epic | EPIC-M1 — Lawful posture |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS platform engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001 |
| Design | design-studio — age-range entry and deletion states, 2 screens |

## Problem and intended outcome

The shipping app has no declared-age-range integration even though the MVP is child-directed. Use
Apple's age signal only for the required decision and delete it immediately so it cannot become a
stored learner profile field.

## Implementation scope

1. Add an adapter in `Data` for Apple's Declared Age Range API with availability handling for every
   supported iOS version.
2. Validate the returned range, map it to the minimum release decision, and keep the raw signal in
   memory only for the duration of the decision.
3. Delete temporary values on success, cancellation, timeout, and error; do not write them to
   SwiftData, logs, diagnostics, or the cohort counters.
4. Cover the child-facing state transitions using the approved design-studio handoff.

## Acceptance criteria

- **Given** the API returns a supported declared range, **when** the launch decision completes,
  **then** the app applies the configured rule and stores no raw range or derived age value.
- **Given** the API is unavailable, cancelled, or returns malformed data, **when** launch continues,
  **then** the app follows the documented safe fallback and records no signal in persistence or
  diagnostics.
- **Given** the app is terminated after the decision, **when** it relaunches, **then** no prior
  declared-age value can be read from local storage.

## Validation and evidence

Test supported and unavailable API paths with dependency injection. Inspect SwiftData, UserDefaults,
logs, and measurement payloads after each path. Attach the API availability matrix and design QA
result.

## Rollout, migration, and recovery

No migration is required because the signal must never be persisted. If the API contract changes,
fail closed to the documented safe fallback and update the adapter tests before changing the
release target.

## Source evidence

- [Info.plist](../../../ios/IEPAndThrive/Resources/Info.plist)
- [ADR-000 D1](../../architecture/ADR-000-mvp-architecture-decisions.md#d1--the-free-tier-makes-zero-network-requests)

## Definition of done

Code review is approved; new code has at least 80% coverage; all external values are validated; no
secrets are hardcoded; the adapter is in Data, UI state consumes it through a dependency, and
deletion evidence covers success and failure paths.
