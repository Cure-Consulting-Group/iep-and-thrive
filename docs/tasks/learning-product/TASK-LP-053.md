# TASK-LP-053 — Add payment reconciliation, refund handling, and finance/support views

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-07](../../audits/2026-09-05/product-direction/epics.md#epic-lp-07) |
| Priority / release gate | P1 / G3: paid digital release |
| Status | Proposed — review required |
| Proposed owner | Backend + operations + business owner |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F19](../../audits/2026-09-05/product-direction/findings.md#f19), [F20](../../audits/2026-09-05/product-direction/findings.md#f20), [F32](../../audits/2026-09-05/product-direction/findings.md#f32) |
| Dependencies | [TASK-LP-048](TASK-LP-048.md), [TASK-LP-049](TASK-LP-049.md), [TASK-LP-050](TASK-LP-050.md), [TASK-LP-051](TASK-LP-051.md) |

## Problem and intended outcome

Paid state relies on event handlers without a tested reconciliation workflow. Support needs a trustworthy view of payments, subscriptions, credits, refunds, and unresolved associations.

## Implementation scope

1. Implement a scheduled/manual reconciliation plan comparing internal billing state with provider identifiers and current authoritative status.
2. Define refund/dispute/chargeback/failed-payment effects for each offer without conflating tutoring usage and digital access.
3. Provide restricted operator views for unresolved events, customer mismatch, credit adjustments, and refund outcomes with immutable audit entries.
4. Expose clear parent billing receipts/support references without including private instructional records in payment metadata.

## Acceptance criteria

- **Given** an event was missed, **when** reconciliation runs, **then** a preview identifies the discrepancy and an idempotent repair can resolve it.

- **Given** a refund occurs, **when** the offer policy is applied, **then** access or credits change once and the parent receives an accurate receipt.

## Validation and evidence

Test-mode payment lifecycle matrix, discrepancy fixtures, replay/duplicate repair tests, role restrictions, and finance-led reconciliation review.

## Rollout, migration, and recovery

Dry-run reports precede automated corrections. Require separate operational authorization for real refunds or account adjustments.

## Source evidence

- [functions/src/stripe-webhook.ts:920](../../../functions/src/stripe-webhook.ts#L920)
- [functions/src/customer-portal.ts:1](../../../functions/src/customer-portal.ts#L1)
- [app/admin/subscribers/page.tsx:1](../../../app/admin/subscribers/page.tsx#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
