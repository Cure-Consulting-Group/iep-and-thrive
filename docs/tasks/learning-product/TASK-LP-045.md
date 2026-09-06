# TASK-LP-045 — Repair inquiry pipeline access and unify enrollment/payment transitions

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-06](../../audits/2026-09-05/product-direction/epics.md#epic-lp-06) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + web + operations |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F13](../../audits/2026-09-05/product-direction/findings.md#f13), [F20](../../audits/2026-09-05/product-direction/findings.md#f20) |
| Dependencies | [TASK-LP-012](TASK-LP-012.md), [TASK-LP-014](TASK-LP-014.md), [TASK-LP-050](TASK-LP-050.md) |

## Problem and intended outcome

Admin pipeline reads enrollmentInquiries without any matching Firestore rule. Forms, pipeline UI, payments, users, and students also write different status fields and identifiers.

## Implementation scope

1. Add narrowly authorized staff inquiry reads/transitions through rules or a server API; provide explicit listener error handling.
2. Define a canonical enrollment state machine linking inquiry, verified adult, learner, agreement, deposit/balance, and service enrollment without name/email-only assumptions.
3. Persist inquiries durably before messages and claim guest inquiries through a verified continuation process.
4. Migrate pipelineStage/status/enrollmentStatus aliases and build reconciliation views for unresolved payments or missing learners.

## Acceptance criteria

- **Given** authorized staff opens the pipeline, **when** the query executes, **then** inquiries load with a clear error if unavailable and cross-family users remain denied.

- **Given** a payment arrives before account creation or in a retry, **when** reconciliation runs, **then** it attaches to the correct verified enrollment exactly once or enters a review queue.

## Validation and evidence

Emulator admin-read and parent-denial tests, state-transition tests, guest claim and email-conflict cases, and end-to-end inquiry→agreement→test payment→portal state.

## Rollout, migration, and recovery

Maintain a mapping ledger and operator review queue; preserve historical statuses rather than silently treating all payments as completed enrollment.

## Source evidence

- [app/admin/pipeline/page.tsx:47](../../../app/admin/pipeline/page.tsx#L47)
- [functions/src/enroll.ts:78](../../../functions/src/enroll.ts#L78)
- [functions/src/stripe-webhook.ts:306](../../../functions/src/stripe-webhook.ts#L306)
- [firestore.rules:1](../../../firestore.rules#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
