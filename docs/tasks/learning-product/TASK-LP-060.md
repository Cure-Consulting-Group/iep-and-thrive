# TASK-LP-060 — Implement privacy-safe observability and actionable service alerts

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Backend + iOS + operations |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F06](../../audits/2026-09-05/product-direction/findings.md#f06), [F29](../../audits/2026-09-05/product-direction/findings.md#f29), [F41](../../audits/2026-09-05/product-direction/findings.md#f41) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md), [TASK-LP-058](TASK-LP-058.md), [TASK-LP-064](TASK-LP-064.md) |

## Problem and intended outcome

Crash logging exists, but most failures are console logs without user recovery or operational ownership. The product needs to distinguish failed learning saves, broken billing, and unavailable content without collecting sensitive responses in diagnostics.

## Implementation scope

1. Define structured event/error codes, correlation IDs, severity, and redaction for client/API/outbox/payment/content failures.
2. Add dashboards/alerts for sync rejection/backlog, webhook failures, missing email configuration, authorization spikes, content errors, crash-free sessions, and backup freshness.
3. Set service objectives and owner/on-call escalation appropriate to a small team; include support-safe request references.
4. Separate diagnostics from research/product analytics and document access, sampling, retention, and consent behavior.

## Acceptance criteria

- **Given** a durable learning save or billing transition fails repeatedly, **when** monitoring observes it, **then** the responsible owner can locate the error using sanitized identifiers.

- **Given** a child response or intake payload contains private text, **when** an error is logged, **then** the payload does not enter diagnostic logs.

## Validation and evidence

Synthetic fault injection, alert delivery to an approved operational destination, log-redaction tests, and a timed incident tabletop. Thresholds are proposed targets, not achieved SLOs.

## Rollout, migration, and recovery

Roll out redaction before broader instrumentation. Avoid alerting through family communication channels or logging raw provider responses.

## Source evidence

- [ios/IEPAndThrive/Core/Observability/CrashlyticsClient.swift:24](../../../ios/IEPAndThrive/Core/Observability/CrashlyticsClient.swift#L24)
- [functions/src/email-service.ts:111](../../../functions/src/email-service.ts#L111)
- [functions/src/stripe-webhook.ts:945](../../../functions/src/stripe-webhook.ts#L945)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
