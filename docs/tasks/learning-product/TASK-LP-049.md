# TASK-LP-049 — Align Stripe invoice schemas and cycle accounting with event ordering

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-07](../../audits/2026-09-05/product-direction/epics.md#epic-lp-07) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + payments |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F20](../../audits/2026-09-05/product-direction/findings.md#f20) |
| Dependencies | [TASK-LP-048](TASK-LP-048.md), [TASK-LP-050](TASK-LP-050.md) |

## Problem and intended outcome

Invoice handlers read invoice.subscription via casts, while the installed SDK defines subscription under parent.subscription_details. The deployed webhook API version is unverified. Cycle resets also need protection against duplicate and out-of-order events.

## Implementation scope

1. Pin and document the intended webhook/API versions; use a typed adapter for supported historic and current event shapes rather than unknown casts.
2. Resolve subscription/customer/UID from authoritative references, reject ambiguous mappings, and reconcile missing data.
3. Track invoice/cycle identities and apply allowances once; preserve usage on unrelated subscription updates and reject stale cycle regressions.
4. Handle paid, failed, canceled, paused, plan-change/proration, refund, and retry transitions with explicit policies.

## Acceptance criteria

- **Given** a supported current-version invoice event arrives, **when** the handler decodes it, **then** it resolves the subscription and updates the correct cycle.

- **Given** old and new cycle events arrive out of order, **when** they are processed, **then** current usage and status do not regress or reset twice.

## Validation and evidence

Golden fixtures for both documented invoice shapes, expanded/string references, duplicate invoices, old cycles, initial versus renewal invoices, and missing UID. Record actual staging webhook version.

## Rollout, migration, and recovery

Dual-decode only explicitly supported versions; reconcile historical skipped invoices before changing customer access.

## Source evidence

- [functions/src/stripe-webhook.ts:653](../../../functions/src/stripe-webhook.ts#L653)
- [functions/package.json:22](../../../functions/package.json#L22)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
