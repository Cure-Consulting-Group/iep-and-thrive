# TASK-LP-050 — Make checkout identity, supported SKUs, and duplicate prevention authoritative

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-07](../../audits/2026-09-05/product-direction/epics.md#epic-lp-07) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + payments |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F07](../../audits/2026-09-05/product-direction/findings.md#f07), [F18](../../audits/2026-09-05/product-direction/findings.md#f18), [F20](../../audits/2026-09-05/product-direction/findings.md#f20) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-067](TASK-LP-067.md) |

## Problem and intended outcome

Subscription checkout reuses a mutable historical customer mapping and may create a new customer after lookup failure. Repeated requests are not tied to a stable checkout attempt; cohort payments correlate by email instead of an enrollment reference.

## Implementation scope

1. Create a server-owned offer catalog for cohort deposit/balance, tutoring subscriptions, and approved one-time services; reject unsupported products and client prices.
2. Bind checkout to verified account/enrollment/offer and a stable idempotency key; validate existing customer ownership and subscription eligibility.
3. Treat customer lookup failure as retryable instead of permission to create duplicate billing identities; define concurrent checkout handling.
4. Write completion references needed for fulfillment and reconcile historical random user documents securely.

## Acceptance criteria

- **Given** the same checkout is retried or double-clicked, **when** the backend receives it, **then** one logical session/customer association is used.

- **Given** customer lookup is unavailable or mismatched, **when** checkout starts, **then** the server fails safely without attaching another family’s customer.

## Validation and evidence

Stripe test-mode contract tests, stale/tampered customer references, duplicate active plans, unsupported SKU, guest enrollment claiming, and concurrent checkout tests.

## Rollout, migration, and recovery

Validate legacy customer mappings before trusting them; preserve existing subscriptions and create a review queue for ambiguous identities.

## Source evidence

- [functions/src/subscription-checkout.ts:124](../../../functions/src/subscription-checkout.ts#L124)
- [functions/src/stripe-checkout.ts:92](../../../functions/src/stripe-checkout.ts#L92)
- [functions/src/customer-portal.ts:13](../../../functions/src/customer-portal.ts#L13)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
