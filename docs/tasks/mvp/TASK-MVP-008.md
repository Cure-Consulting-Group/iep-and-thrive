# TASK-MVP-008 — Launch directly into the first learning item

| Field | Value |
| --- | --- |
| Epic | EPIC-M2 — A truthful app |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS feature engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-006, TASK-MVP-007 |
| Design | design-studio — first-session launch flow, 3 screens |

## Problem and intended outcome

The first-run surface says “Welcome, Parent!” and collects a name, age, and focus before a child
can learn. The experiment needs a child-safe launch that opens the first valid learning item with no
adult setup or identity prompt.

## Implementation scope

1. Remove the parent-oriented onboarding state and its persistence dependency from the default
   launch path; retain only the minimum local state needed to start a session.
2. Resolve the first valid corpus item, create its session state, and navigate directly to it after
   a cold launch and after a clean relaunch with no local profile.
3. Use the design handoff for visible states, accessibility labels, and the safe exit route; do not
   add identity, network, or adult-data collection.

## Acceptance criteria

- **Given** a fresh install with no local profile, **when** the child launches the app, **then** the
  first valid learning item is reachable without entering a name, age, or focus.
- **Given** a child exits before completing the first item, **when** they relaunch, **then** the app
  resumes at a valid item and does not show the removed parent setup.
- **Given** the corpus begins with an invalid entry, **when** launch resolves the first item, **then**
  it skips invalid data and uses the first validator-approved item.

## Validation and evidence

Run RootFeature and launch UI tests on fresh, relaunch, interrupted, and offline paths. Attach a
screen recording of first launch and the accessibility check result.

## Rollout, migration, and recovery

Do not delete existing local skill evidence. If a legacy profile exists, ignore only the obsolete
onboarding presentation and route the child into the next valid item.

## Source evidence

- [OnboardingView.swift](../../../ios/IEPAndThrive/Features/Onboarding/OnboardingView.swift)
- [RootView in IEPAndThriveApp.swift](../../../ios/IEPAndThrive/IEPAndThriveApp.swift)

## Definition of done

Code review is approved; new code has at least 80% coverage; launch inputs are validated; no secrets
are hardcoded; the design handoff receives QA; and no adult identity surface is introduced.
