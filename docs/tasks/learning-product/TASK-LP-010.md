# TASK-LP-010 — Add bounded validation and abuse protection to public endpoints

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-02](../../audits/2026-09-05/product-direction/epics.md#epic-lp-02) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + security |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F22](../../audits/2026-09-05/product-direction/findings.md#f22) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md), [TASK-LP-058](TASK-LP-058.md) |

## Problem and intended outcome

Public contact, enrollment, guide, and checkout endpoints can trigger writes, email, and payment-session creation without application-level quotas or bounded input sizes. CORS does not prevent direct HTTP abuse.

## Implementation scope

1. Inventory anonymous versus authenticated operations; use exact origin allowlists, request method/content-type controls, size/length bounds, normalized validation, and safe error envelopes.
2. Introduce per-operation quotas and bot friction appropriate to public forms, plus server-verified App Check where applicable; treat App Check as an additional signal, not authorization.
3. Persist durable submissions before dispatching side effects; support bounded idempotency keys and safe retries.
4. Add global/endpoint kill controls and rate-limit observability without logging sensitive payloads; handle accessibility and shared-school-network false positives.

## Acceptance criteria

- **Given** a repeated or oversized submission arrives, **when** validation and quota checks run, **then** the operation is rejected before expensive work or duplicate messages.

- **Given** a legitimate client is rate limited, **when** the UI receives the error, **then** it displays a recoverable explanation and retry guidance.

## Validation and evidence

Synthetic HTTP tests for malformed JSON, large strings/images, repeated keys, quota exhaustion, direct requests bypassing CORS, and fail-closed storage failures. Never load-test production.

## Rollout, migration, and recovery

Start with measured conservative limits in staging, then enforce with monitored overrides. Changes must not disable ownership checks during fallback.

## Source evidence

- [functions/src/enroll.ts:15](../../../functions/src/enroll.ts#L15)
- [functions/src/contact.ts:12](../../../functions/src/contact.ts#L12)
- [functions/src/summer-guide-capture.ts:28](../../../functions/src/summer-guide-capture.ts#L28)
- [functions/src/subscription-checkout.ts:20](../../../functions/src/subscription-checkout.ts#L20)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
