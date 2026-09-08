# TASK-MVP-003 — Add numeric parental gate and enter Kids Category

| Field | Value |
| --- | --- |
| Epic | EPIC-M1 — Lawful posture |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS release engineer + counsel |
| Estimate | 3 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001, TASK-MVP-002 |
| Design | design-studio — numeric gate and Kids Category entry states, 3 screens |

## Problem and intended outcome

The app needs a clear adult checkpoint for the recruited measurement flow and an explicit Kids
Category submission posture. The checkpoint must not become an account, identity, or learner-data
collection surface.

## Implementation scope

1. Implement a local numeric challenge with bounded attempts, no network call, and no stored answer
   or raw response.
2. Require the gate before cohort enrollment or release-only adult actions; keep ordinary free
   learning available on the default path.
3. Record the Kids Category decision, privacy manifest review, age rating, and submission metadata
   in the release evidence package.
4. Use the design-studio handoff for the visible states and add accessibility labels and focus
   order without changing the instructional engine.

## Acceptance criteria

- **Given** a child reaches a gated adult action, **when** an incorrect answer is entered, **then**
  the action remains locked, attempts are bounded, and no response is persisted or uploaded.
- **Given** the correct numeric answer is entered, **when** the gate succeeds, **then** only the
  requested adult action becomes available and the answer is discarded immediately.
- **Given** the release metadata is reviewed, **when** the Kids Category checklist is run, **then**
  the documented category, age rating, privacy manifest, and no-third-party-telemetry evidence agree.

## Validation and evidence

Run reducer tests for correct, incorrect, retry-limit, cancel, and relaunch paths. Perform VoiceOver
and keyboard/focus checks. Attach the completed Kids Category checklist and privacy manifest review.

## Rollout, migration, and recovery

No data migration. If the gate blocks ordinary learning, disable only the gated adult action and
retain the local learning path while the reducer is corrected.

## Source evidence

- [OnboardingFeature.swift](../../../ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift)
- [ADR-000 D6](../../architecture/ADR-000-mvp-architecture-decisions.md#d6--the-only-free-tier-network-path-is-consented-cohort-measurement)

## Definition of done

Code review is approved; new code has at least 80% coverage; input bounds are validated; no secrets
are hardcoded; the gate has no network dependency; and the release evidence is signed off.
