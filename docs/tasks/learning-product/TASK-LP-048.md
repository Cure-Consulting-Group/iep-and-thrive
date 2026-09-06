# TASK-LP-048 — Repair webhook claim, retry, replay, and processing state

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-07](../../audits/2026-09-05/product-direction/epics.md#epic-lp-07) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + payments |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F19](../../audits/2026-09-05/product-direction/findings.md#f19) |
| Dependencies | [TASK-LP-067](TASK-LP-067.md) |

## Problem and intended outcome

Webhook IDs are claimed before processing and the final error handler returns 200. A transient failure can permanently suppress a payment update because retries are treated as completed duplicates.

## Implementation scope

1. Implement processing/succeeded/failed states with lease/attempt metadata and atomic acquisition; acknowledge only durable accepted processing or completed idempotent work.
2. Return retryable failures appropriately and keep handler business operations independently idempotent.
3. Add a restricted replay/reconciliation command with preview, event selection, safe error redaction, and duplicate side-effect protection.
4. Separate billing mutation from email dispatch through durable tasks; include stuck-processing and terminal-failure alerts.

## Acceptance criteria

- **Given** processing fails after an event is claimed, **when** Stripe retries, **then** the event resumes safely instead of being skipped as succeeded.

- **Given** two deliveries arrive concurrently, **when** the claim runs, **then** one logical billing transition and one outbox effect occur.

## Validation and evidence

Use real handler fixtures with mocked Stripe and Firestore emulator; inject failure at claim, state write, receipt creation, and email enqueue. Test duplicate, lease expiry, and manual replay.

## Rollout, migration, and recovery

Preserve existing event IDs as legacy status unknown; reconcile against authoritative Stripe state before replaying. Never delete the entire event log to force retries.

## Source evidence

- [functions/src/stripe-webhook.ts:154](../../../functions/src/stripe-webhook.ts#L154)
- [functions/src/stripe-webhook.ts:948](../../../functions/src/stripe-webhook.ts#L948)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
