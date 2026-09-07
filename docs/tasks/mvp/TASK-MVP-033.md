# TASK-MVP-033 — Record aggregate on-device measurement counters

| Field | Value |
| --- | --- |
| Epic | EPIC-M8 — Measurement |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Measurement engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-032 |
| Design | None |

## Problem and intended outcome

The retention question needs sessions started, skills reached, and days since first open, but the
free path must not transmit or create a third-party identifier. Record only the approved aggregate
counters locally until explicit cohort enrollment.

## Implementation scope

1. Define a versioned local counter model for first open, session start, session completion, skills
   reached, and days since first open; exclude names, raw responses, audio, strokes, and diagnostics.
2. Make increments idempotent for relaunch and duplicate reducer actions; derive elapsed days from a
   local first-open timestamp without uploading it by default.
3. Expose a read-only export shape to the later cohort client and keep all transport disabled until
   034 succeeds.

## Acceptance criteria

- **Given** an unenrolled device, **when** sessions start and complete across relaunches, **then**
  counters update locally and zero network requests occur.
- **Given** the same session action is delivered twice, **when** counters commit, **then** the
  aggregate count increases once.
- **Given** a counter payload is prepared before consent, **when** it is inspected, **then** it
  contains only the approved aggregate fields and no device or learner identifier.

## Validation and evidence

Run local counter, idempotency, relaunch, payload allowlist, and no-network tests. Attach the schema
and sample redacted payload.

## Rollout, migration, and recovery

Counters are local and versioned. If a malformed counter is found, quarantine it and continue
learning without attempting an upload.

## Source evidence

- [ADR-000 D6](../../architecture/ADR-000-mvp-architecture-decisions.md#d6--the-only-free-tier-network-path-is-consented-cohort-measurement)
- [DatabaseClient.swift](../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift)

## Definition of done

Code review is approved; new code has at least 80% coverage; payload fields and counters are
validated; no secrets are hardcoded; and no transport exists before the consent boundary.
