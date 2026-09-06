# TASK-LP-063 — Repair lifecycle email consent, delivery state, and retry semantics

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-09](../../audits/2026-09-05/product-direction/epics.md#epic-lp-09) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + operations + privacy |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F21](../../audits/2026-09-05/product-direction/findings.md#f21) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md), [TASK-LP-058](TASK-LP-058.md) |

## Problem and intended outcome

Guide drip calls default to transactional sends and advance emailsSent even when sendEmail returns false. The shared preference check proceeds on lookup failure; several schedulers scan/send without a common durable delivery ledger.

## Implementation scope

1. Classify every template as necessary service, lifecycle, or marketing; define recipient identity/lead consent and unsubscribe semantics for both users and guide leads.
2. Fail safely when nonessential consent/preferences cannot be checked; honor suppression and test-recipient isolation consistently.
3. Implement a delivery ledger/outbox with idempotent template+recipient+program+phase keys, retry state, provider message IDs, and delivered/failed/skipped distinctions.
4. Correct guide capture/drip success copy, phase advancement, recurring job bounds, and operator replay; distinguish optional marketing opt-out from essential service notices.

## Acceptance criteria

- **Given** email delivery fails, **when** the job records its result, **then** the message is not marked sent or advanced beyond recovery.

- **Given** a lead unsubscribes or preference lookup fails, **when** marketing is scheduled, **then** the send is suppressed according to the approved policy.

## Validation and evidence

Mocked provider success/failure, duplicate schedulers, suppression/read failure, lead unsubscribe, missing secrets, test-recipient behavior, and staging delivery to an explicitly authorized recipient.

## Rollout, migration, and recovery

Pause obsolete campaigns until configuration and consent are reconciled. Do not replay all skipped historical marketing on deployment.

## Source evidence

- [functions/src/summer-guide-drip.ts:72](../../../functions/src/summer-guide-drip.ts#L72)
- [functions/src/email-service.ts:126](../../../functions/src/email-service.ts#L126)
- [functions/src/unsubscribe.ts:36](../../../functions/src/unsubscribe.ts#L36)
- [functions/src/summer-guide-capture.ts:82](../../../functions/src/summer-guide-capture.ts#L82)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
