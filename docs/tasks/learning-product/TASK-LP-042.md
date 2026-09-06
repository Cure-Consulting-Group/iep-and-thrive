# TASK-LP-042 — Move booking reservation and entitlement consumption into a server transaction

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-06](../../audits/2026-09-05/product-direction/epics.md#epic-lp-06) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + web |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F11](../../audits/2026-09-05/product-direction/findings.md#f11) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-050](TASK-LP-050.md), [TASK-LP-067](TASK-LP-067.md) |

## Problem and intended outcome

Normal parent booking cannot update admin-only slots, while direct booking documents can be forged without a reservation. Protect both operational correctness and server-triggered side effects.

## Implementation scope

1. Implement an authenticated reservation operation accepting slotId, authorized learner, offer/entitlement reference, and idempotency key; derive identity, times, recipient, and status server-side.
2. Atomically verify availability, eligibility, cycle/credit, ownership, and slot constraints; create reservation and usage ledger exactly once.
3. Deny arbitrary client booking creates/updates; staff actions use equivalent validated operations with audit attribution.
4. Return typed unavailable/exhausted/ineligible/conflict/retry errors and update the web booking flow.

## Acceptance criteria

- **Given** two parents reserve the same slot simultaneously, **when** the transactions commit, **then** exactly one reservation succeeds and only its entitlement is consumed.

- **Given** a client forges recipient, owner, or slot times, **when** it submits a booking, **then** those fields are rejected or ignored in favor of trusted server data.

## Validation and evidence

Emulator concurrency tests, last-credit races, repeated idempotency keys, direct-write denial, server-clock validation, and frontend recovery after an uncertain response.

## Rollout, migration, and recovery

Release server operations before closing old writers. Audit orphaned/forged bookings and negative counters in an authorized reconciliation step; never open slot writes to parents.

## Source evidence

- [lib/booking-service.ts:142](../../../lib/booking-service.ts#L142)
- [lib/subscription-service.ts:13](../../../lib/subscription-service.ts#L13)
- [firestore.rules:61](../../../firestore.rules#L61)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
