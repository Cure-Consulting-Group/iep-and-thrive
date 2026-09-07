# TASK-MVP-006 — Remove the automatic three-mission access interruption

| Field | Value |
| --- | --- |
| Epic | EPIC-M2 — A truthful app |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS feature engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001 |
| Design | design-studio — uninterrupted free-path session flow, 3 screens |

## Problem and intended outcome

The root reducer still presents a StoreKit-driven access interruption after the child completes
three missions. The free decoding experiment must let the child continue through every bundled
level so week-eight behavior is not confounded by an artificial stop.

## Implementation scope

1. Remove the threshold state, trigger, presentation route, commerce actions, and related dependency
   wiring from the free-path root flow.
2. Preserve mission completion, local skill evidence, and the next-item transition without a new
   gate or prompt.
3. Remove obsolete tests and add reducer tests proving completion at mission counts 3 and 4 behaves
   like any other completion; consume the approved flow handoff for any remaining visible state.

## Acceptance criteria

- **Given** a free local session has completed three missions, **when** the third completion action
  finishes, **then** the next learning item remains available and no access interruption is shown.
- **Given** a child completes missions four through ten offline, **when** each completion is saved,
  **then** the journey advances and local evidence is retained without commerce dependencies.
- **Given** the app is relaunched after mission three, **when** the journey loads, **then** it does
  not reconstruct the removed threshold state.

## Validation and evidence

Run RootFeature and JourneyFeature reducer tests, then execute a ten-mission offline UI flow. Capture
the absence of the removed sheet and the local evidence count.

## Rollout, migration, and recovery

No migration; ignore any stale threshold value if found in local state. If the new flow blocks a
mission, preserve the prior local record, disable only the new transition, and fix the reducer.

## Source evidence

- [RootFeature.swift](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift)
- [RootFeature.swift](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift)

## Definition of done

Code review is approved; new code has at least 80% coverage; no visual decisions are made in
engineering code beyond the design handoff; no secrets are hardcoded; and the free path has no
StoreKit or commerce dependency.
