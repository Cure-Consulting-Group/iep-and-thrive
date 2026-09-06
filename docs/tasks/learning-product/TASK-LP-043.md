# TASK-LP-043 — Implement idempotent cancellation, rescheduling, and timezone policy

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-06](../../audits/2026-09-05/product-direction/epics.md#epic-lp-06) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + web + operations |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F11](../../audits/2026-09-05/product-direction/findings.md#f11) |
| Dependencies | [TASK-LP-042](TASK-LP-042.md) |

## Problem and intended outcome

Cancellation trusts supplied slot/parent/time fields, does not first establish an uncanceled booking, and may decrement the wrong billing cycle repeatedly. Time strings use the client’s local interpretation.

## Implementation scope

1. Define authoritative America/New_York slot timestamps and store UTC instants plus display timezone; specify daylight-saving and boundary behavior.
2. Validate booking ownership/status/slot association and use server time for cancellation/refund policy; credit the original eligible cycle or explicit credit ledger.
3. Make cancellation and rescheduling idempotent and transactional, with stale-request and staff override rules.
4. Update parent/admin UI with concrete consequence preview, cancellation receipt, and recoverable conflicts; align published policies.

## Acceptance criteria

- **Given** a cancellation is repeated, **when** the same booking is processed, **then** at most one refund or credit is issued.

- **Given** a booking belongs to a previous billing cycle or crosses a DST boundary, **when** cancellation runs, **then** the documented server-time policy is applied without mutating an unrelated cycle.

## Validation and evidence

Boundary tests at 24 hours, DST transitions, timezone-different clients, already-canceled/completed/no-show bookings, forged IDs, and concurrent reschedules.

## Rollout, migration, and recovery

Keep an immutable adjustment ledger and reconcile legacy counters; do not reverse credits by deleting audit history.

## Source evidence

- [lib/subscription-service.ts:146](../../../lib/subscription-service.ts#L146)
- [lib/booking-service.ts:177](../../../lib/booking-service.ts#L177)
- [scripts/tutoring-slot-template.json:1](../../../scripts/tutoring-slot-template.json#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
