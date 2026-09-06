# TASK-LP-019 — Replace anonymous migration with a proven identity-linking flow

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS + backend + security |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F05](../../audits/2026-09-05/product-direction/findings.md#f05) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-015](TASK-LP-015.md), [TASK-LP-017](TASK-LP-017.md) |

## Problem and intended outcome

Current sign-in replaces anonymous authentication before trying to read the old UID. Permission failures are converted into empty arrays, and migration can report success with nothing copied.

## Implementation scope

1. Design separate linking for a new adult account and transfer to an existing account; prove control of both identities or transfer only validated, attributed local records.
2. Record durable migration state, source/target identity, item counts, retries, conflicts, and completion receipt without client authority to read another family.
3. Preserve visible retry state and treat permission/decode failures as errors; avoid overwriting an existing child profile with an anonymous learner.
4. Retire old anonymous records according to consent/retention after verified transfer, with an auditable cleanup policy.

## Acceptance criteria

- **Given** a parent signs into an existing account, **when** anonymous data is transferred, **then** only proven source records reach the explicitly selected child.

- **Given** a migration read/write fails, **when** the operation ends, **then** it remains retryable and is never marked successfully empty.

## Validation and evidence

Firebase emulator + native tests for email/Apple/Google linking, credential-already-in-use, two identities, transfer interruption, duplicate replay, and attempts to migrate someone else’s UID.

## Rollout, migration, and recovery

No rules relaxation for old-UID reads. Disable unsafe migration until the replacement is verified; keep recoverable local records under their original identity.

## Source evidence

- [ios/IEPAndThrive/Core/Auth/AuthClient.swift:24](../../../ios/IEPAndThrive/Core/Auth/AuthClient.swift#L24)
- [ios/IEPAndThrive/Core/Data/FirestoreClient.swift:36](../../../ios/IEPAndThrive/Core/Data/FirestoreClient.swift#L36)
- [ios/IEPAndThrive/Features/Root/RootFeature.swift:167](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L167)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
