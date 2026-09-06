# TASK-LP-005 — Define separate digital and tutoring offers with testable economics

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-01](../../audits/2026-09-05/product-direction/epics.md#epic-lp-01) |
| Priority / release gate | P1 / G3: paid digital release |
| Status | Proposed — review required |
| Proposed owner | Product + business owner |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F01](../../audits/2026-09-05/product-direction/findings.md#f01), [F32](../../audits/2026-09-05/product-direction/findings.md#f32), [F40](../../audits/2026-09-05/product-direction/findings.md#f40) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md), [TASK-LP-003](TASK-LP-003.md) |

## Problem and intended outcome

Existing prices sell tutoring sessions and native products use weekly/annual identifiers. The independent learning product lacks a defined paid benefit and a validated acquisition/support model.

## Implementation scope

1. Describe free/demo, paid family, and later practitioner access, including child/device limits, cancellation, refunds, trials, and what remains available after lapse.
2. Keep tutoring sessions and digital learning entitlements distinct; bundle only with an explicit entitlement rule and separate reporting.
3. Build a sensitivity model with editable acquisition cost, conversion, retention, support time, curriculum production, store/payment fees, cloud/storage, refunds, and educator review cost. Use assumptions, not revenue forecasts presented as evidence.
4. Interview external buyers and test willingness to pay without using fake purchase success or implying unavailable functionality.

## Acceptance criteria

- **Given** an offer is displayed, **when** a buyer compares plans, **then** the digital benefit and any service benefit are independently understandable.

- **Given** an input assumption changes, **when** the model recalculates, **then** contribution margin and break-even sensitivity update with assumptions labeled.

## Validation and evidence

Review offer matrix, buyer evidence, and scenario workbook. Revalidate payment/platform rules before implementation; no production prices changed by this ticket.

## Rollout, migration, and recovery

Preserve existing customers’ terms and record grandfathering decisions before changes.

## Source evidence

- [lib/subscription.ts:36](../../../lib/subscription.ts#L36)
- [ios/IEPAndThrive/Core/StoreKit/StoreKitClient.swift:18](../../../ios/IEPAndThrive/Core/StoreKit/StoreKitClient.swift#L18)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
