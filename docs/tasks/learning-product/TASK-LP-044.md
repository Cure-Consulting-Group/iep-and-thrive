# TASK-LP-044 — Make booking email and calendar delivery durable and idempotent

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-06](../../audits/2026-09-05/product-direction/epics.md#epic-lp-06) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + operations |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F11](../../audits/2026-09-05/product-direction/findings.md#f11), [F21](../../audits/2026-09-05/product-direction/findings.md#f21) |
| Dependencies | [TASK-LP-042](TASK-LP-042.md), [TASK-LP-043](TASK-LP-043.md), [TASK-LP-063](TASK-LP-063.md) |

## Problem and intended outcome

Booking triggers trust record recipients and can repeat side effects on retried deliveries. Calendar creation catches errors and returns null; the client/server schemas use different event-ID names.

## Implementation scope

1. Create one server-owned outbox task per booking transition and delivery channel; resolve recipient from trusted account data.
2. Use deterministic calendar event identity or safe reconciliation, record external IDs consistently, and retry failed create/update/cancel operations with bounded backoff.
3. Keep booking state independent from email/calendar completion but show delivery status and operational alerts; support replay without duplicate invitations.
4. Ensure test/staging recipients and calendars are isolated and apply the documented service timezone everywhere.

## Acceptance criteria

- **Given** a create trigger is delivered twice, **when** email/calendar tasks execute, **then** the user receives no duplicate logical confirmation and no duplicate event.

- **Given** calendar creation fails after reservation, **when** the parent views the booking, **then** the booking is retained with an actionable delivery status and a retry path.

## Validation and evidence

Mocked provider failure tests, trigger replay, cancellation-before-create completion, recipient tampering, retry exhaustion, and authorized staging delivery to a designated test recipient.

## Rollout, migration, and recovery

Backfill outbox state carefully for existing bookings; do not resend all historical confirmations. Provider sends require an approved test recipient at execution time.

## Source evidence

- [functions/src/booking-emails.ts:35](../../../functions/src/booking-emails.ts#L35)
- [functions/src/calendar-sync.ts:95](../../../functions/src/calendar-sync.ts#L95)
- [lib/booking-service.ts:49](../../../lib/booking-service.ts#L49)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
