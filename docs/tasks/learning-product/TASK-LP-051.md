# TASK-LP-051 — Define digital entitlement authority and cross-platform access policy

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-07](../../audits/2026-09-05/product-direction/epics.md#epic-lp-07) |
| Priority / release gate | P1 / G3: paid digital release |
| Status | Proposed — review required |
| Proposed owner | Product + backend + iOS |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F32](../../audits/2026-09-05/product-direction/findings.md#f32) |
| Dependencies | [TASK-LP-005](TASK-LP-005.md), [TASK-LP-014](TASK-LP-014.md) |

## Problem and intended outcome

Native premium is a Boolean observed from StoreKit and is not used to gate lessons. Web tutoring and app purchases are different offers. Define exactly what a digital purchase grants before enforcement.

## Implementation scope

1. Approve access rules for trial/free/paid/expired/pending/refunded users, household children, devices, offline grace, restoration, and practitioner seats.
2. Choose authoritative store verification and account association; plan server-side verification/notifications for shared web/native benefits if required, rather than trusting a client premium flag.
3. Keep tutoring credit usage separate from digital content entitlement and define any intentional bundle mapping.
4. Review purchase/restoration/account-linking UX and applicable store policies before shipping external payment links or institutional offers.

## Acceptance criteria

- **Given** a tutoring subscription is active, **when** digital access is evaluated, **then** access follows an explicit bundle policy instead of assuming all products are equivalent.

- **Given** a digital entitlement expires offline, **when** the grace policy applies, **then** the child gets a safe defined experience and adults receive an accurate status.

## Validation and evidence

Entitlement state table, threat model, account/store mismatch scenarios, and cross-device architecture review; current platform rules cited in the source register are rechecked at implementation.

## Rollout, migration, and recovery

Use an ADR and test-mode flags before paid release; never silently remove benefits already promised to customers.

## Source evidence

- [ios/IEPAndThrive/Core/StoreKit/StoreKitClient.swift:11](../../../ios/IEPAndThrive/Core/StoreKit/StoreKitClient.swift#L11)
- [ios/IEPAndThrive/Features/Root/RootFeature.swift:16](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L16)
- [lib/subscription.ts:73](../../../lib/subscription.ts#L73)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
