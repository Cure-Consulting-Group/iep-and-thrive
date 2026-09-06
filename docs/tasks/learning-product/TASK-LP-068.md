# TASK-LP-068 — Test native persistence, identity, and sync using real stores

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-10](../../audits/2026-09-05/product-direction/epics.md#epic-lp-10) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS + QA |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F04](../../audits/2026-09-05/product-direction/findings.md#f04), [F05](../../audits/2026-09-05/product-direction/findings.md#f05), [F38](../../audits/2026-09-05/product-direction/findings.md#f38), [F43](../../audits/2026-09-05/product-direction/findings.md#f43) |
| Dependencies | [TASK-LP-017](TASK-LP-017.md), [TASK-LP-018](TASK-LP-018.md), [TASK-LP-019](TASK-LP-019.md), [TASK-LP-020](TASK-LP-020.md), [TASK-LP-073](TASK-LP-073.md) |

## Problem and intended outcome

The 95-test native baseline covers reducers and geometry but relies heavily on dependency doubles. It does not prove that production SwiftData/Firestore lifecycle and identity isolation work.

## Implementation scope

1. Add real temporary on-disk ModelContainer tests and emulator-backed Firebase integration tests for the live data adapters.
2. Exercise cold start, two children/two accounts, account switching, migration, offline queue/replay, denied writes, duplicates, and schema upgrades.
3. Assert effect cancellation and late-response rejection in root orchestration, including repeated launch and interrupted sign-in.
4. Keep tests deterministic with controlled clocks/IDs and explicit cleanup; add a small native UI suite for the critical child/adult flow.

## Acceptance criteria

- **Given** the app restarts after offline practice, **when** the integration test reloads the store, **then** progress persists for the correct learner and synchronizes exactly once.

- **Given** sign-out occurs mid-sync, **when** effects finish, **then** no old data becomes visible or writes to the new account.

## Validation and evidence

Native test report distinguishing reducer, geometry, persistence, emulator, UI, and real-device coverage; retain failure logs without child PII.

## Rollout, migration, and recovery

Use dedicated test Firebase config and temporary local stores. Existing tests remain useful but cannot serve as the sole release evidence.

## Source evidence

- [ios/IEPAndThriveTests/RootFeatureTests.swift:1](../../../ios/IEPAndThriveTests/RootFeatureTests.swift#L1)
- [ios/IEPAndThrive/Core/Data/DatabaseClient.swift:54](../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift#L54)
- [ios/IEPAndThrive/Core/Data/FirestoreClient.swift:126](../../../ios/IEPAndThrive/Core/Data/FirestoreClient.swift#L126)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
