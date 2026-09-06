# TASK-LP-073 — Correct SwiftData actor isolation and data-adapter failure contracts

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS data engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F43](../../audits/2026-09-05/product-direction/findings.md#f43) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md) |

## Problem and intended outcome

DatabaseContainer returns a main-actor ModelContext to async closures that then fetch/insert/save outside an explicitly isolated operation. SDK decode failures and optional reads also conflate missing records with malformed or denied data.

## Implementation scope

1. Choose a MainActor repository or ModelActor-based persistence boundary; perform context operations within that isolation and exchange immutable Sendable DTOs across actors.
2. Define typed not-found, unavailable, unauthorized, decode, and persistence errors in local/remote clients with recoverable user-state mapping.
3. Avoid passing live SwiftData model instances across Sendable effects; control container lifetime, startup, and teardown.
4. Enable appropriate concurrency checking and validate production adapters under concurrent reads/writes rather than only no-op test dependencies.

## Acceptance criteria

- **Given** multiple effects read and write local records, **when** the repository executes, **then** all ModelContext operations remain on their owning actor.

- **Given** a remote document is malformed or denied, **when** it is fetched, **then** the error is distinguishable from a legitimate missing profile.

## Validation and evidence

Strict concurrency diagnostics, real-store concurrent access tests, sanitizer/device investigation where appropriate, and typed error assertions with synthetic malformed Firestore records.

## Rollout, migration, and recovery

Refactor the persistence boundary before adding identity migration. Keep schema unchanged in the actor-only change where possible to simplify rollback.

## Source evidence

- [ios/IEPAndThrive/Core/Data/DatabaseClient.swift:19](../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift#L19)
- [ios/IEPAndThrive/Core/Data/DatabaseClient.swift:83](../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift#L83)
- [ios/IEPAndThrive/Core/Data/FirestoreClient.swift:69](../../../ios/IEPAndThrive/Core/Data/FirestoreClient.swift#L69)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
