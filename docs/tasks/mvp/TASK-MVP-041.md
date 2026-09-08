# TASK-MVP-041 — Enforce the no-network free-path invariant

| Field | Value |
| --- | --- |
| Epic | EPIC-M10 — Release |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | iOS test engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001, TASK-MVP-033, TASK-MVP-035 |
| Design | None |

## Problem and intended outcome

ADR-000 D1 is a claim that can regress when a dependency or launch effect changes. Make zero
outbound requests during a complete unconsented session a hard release invariant while allowing the
narrow consented exception only after enrollment.

## Implementation scope

1. Add a deterministic network interception test covering cold launch, relaunch, first item, engine
   success/failure, audio, persistence, exit, and background/foreground transitions.
2. Fail the test on any request, DNS lookup, SDK bootstrap, or socket attempt for an unenrolled
   device; separately assert the enrolled path sends only the approved batch.
3. Run the invariant in CI and on the release candidate with diagnostics that identify the caller
   without including child data.

## Acceptance criteria

- **Given** a fresh unenrolled install with no network interface available, **when** a full session
  is completed and relaunched, **then** zero outbound requests are recorded and the session succeeds.
- **Given** an enrolled synthetic participant, **when** the weekly batch is due, **then** only the
  single consented endpoint is contacted with the allowlisted aggregate payload.
- **Given** any unexpected request, **when** the invariant test runs, **then** CI fails with the
  request owner and release archive creation is blocked.

## Validation and evidence

Run simulator/device proxy tests, CI workflow, SDK bootstrap inspection, and the enrolled synthetic
path. Attach request logs with payloads redacted.

## Rollout, migration, and recovery

This is a release blocker. If it fails, disable the offending dependency or consent path and retain
local counters; never weaken the assertion to ship.

## Source evidence

- [ADR-000 D1](../../architecture/ADR-000-mvp-architecture-decisions.md#d1--the-free-tier-makes-zero-network-requests)
- [ADR-000 D6](../../architecture/ADR-000-mvp-architecture-decisions.md#d6--the-only-free-tier-network-path-is-consented-cohort-measurement)

## Definition of done

Code review is approved; new test code has at least 80% coverage where applicable; interception
inputs are validated; no secrets are hardcoded; CI gates archives; and both default and synthetic
enrolled evidence are attached.
