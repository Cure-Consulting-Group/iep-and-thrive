# TASK-LP-020 — Implement durable attempt and reward synchronization with acknowledgments

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS + backend |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F04](../../audits/2026-09-05/product-direction/findings.md#f04), [F43](../../audits/2026-09-05/product-direction/findings.md#f43) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-017](TASK-LP-017.md), [TASK-LP-025](TASK-LP-025.md) |

## Problem and intended outcome

Local writes and Firestore writes are separate effects; failures are logged but not represented by a durable retry workflow. Firestore caching does not reconcile SwiftData, confirm server acceptance, or prevent cross-account queued writes.

## Implementation scope

1. Persist the attempt, reward decision, and outbox entry atomically in the scoped local store with stable idempotency keys.
2. Implement bounded retry/backoff, acknowledgments, dead-letter visibility, and explicit handling for authorization, schema, and consent failures.
3. Define conflict semantics for append-only attempts and derived progress; do not resolve educational evidence by last-write-wins overwrites.
4. Bind replay to source account/learner and consent; surface adult sync status and protect queues on sign-out or deletion.

## Acceptance criteria

- **Given** the network drops after a local attempt, **when** the app restarts and reconnects, **then** the attempt arrives once with one associated reward.

- **Given** the active account changes, **when** old queued work replays, **then** it cannot be written under the new account.

## Validation and evidence

Failure injection at each local/remote boundary, offline restart, duplicate acknowledgment, denied writes, malformed legacy data, queue-size bounds, and deletion during replay.

## Rollout, migration, and recovery

Ship readers and idempotent endpoints before producers. Preserve recoverable queues across upgrades; report rejected attempts without fabricating success.

## Source evidence

- [ios/IEPAndThrive/Features/Journey/JourneyFeature.swift:84](../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift#L84)
- [ios/IEPAndThrive/Core/Data/FirestoreClient.swift:54](../../../ios/IEPAndThrive/Core/Data/FirestoreClient.swift#L54)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
