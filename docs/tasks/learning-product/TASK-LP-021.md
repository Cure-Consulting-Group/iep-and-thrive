# TASK-LP-021 — Deliver account/learner export, deletion, consent withdrawal, and retention

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Backend + privacy + iOS + web |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F39](../../audits/2026-09-05/product-direction/findings.md#f39) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-015](TASK-LP-015.md), [TASK-LP-020](TASK-LP-020.md), [TASK-LP-059](TASK-LP-059.md) |

## Problem and intended outcome

The repository describes manual deletion but does not implement an in-app initiation flow or cross-system lifecycle. Deleting an Auth user alone leaves subcollections, files, diagnostics, and pending sync work.

## Implementation scope

1. Implement adult-verified requests for learner export, learner deletion, account deletion, and consent withdrawal with distinct scopes and status receipts.
2. Inventory Firestore subcollections, Storage files/tokens, local stores, outbox, email logs, analytics, backups, payment records, and provider tokens; document justified retention exceptions.
3. Execute idempotent deletion jobs and suppress future collection/replay; revoke Apple sign-in tokens where applicable and explain billing cancellation separately.
4. Add retention schedules and deletion manifests so restore procedures do not revive deleted learners; expose accessible web/iOS request status and support escalation.

## Acceptance criteria

- **Given** an adult requests deletion, **when** the job is retried after interruption, **then** all in-scope stores converge to the approved deleted state.

- **Given** a backup predates deletion, **when** it is restored, **then** the deletion manifest is reapplied before user access resumes.

## Validation and evidence

Synthetic end-to-end account and single-child deletion, export permission, sibling preservation, auth reauthentication, provider-token failure, active subscription, and backup restore tests. Privacy reviewer approves lifecycle exceptions.

## Rollout, migration, and recovery

Dry-run manifests first; retain minimal completion evidence under the approved policy. Recovery cannot silently restore consent or deleted child data.

## Source evidence

- [docs/legal/data-deletion-process.md:1](../../../docs/legal/data-deletion-process.md#L1)
- [ios/IEPAndThrive/Features/Settings/SettingsFeature.swift:5](../../../ios/IEPAndThrive/Features/Settings/SettingsFeature.swift#L5)
- [firestore.rules:46](../../../firestore.rules#L46)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
