# TASK-LP-052 — Complete native purchase, restoration, pending, and revocation handling

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-07](../../audits/2026-09-05/product-direction/epics.md#epic-lp-07) |
| Priority / release gate | P1 / G3: paid digital release |
| Status | Proposed — review required |
| Proposed owner | iOS + payments QA |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F32](../../audits/2026-09-05/product-direction/findings.md#f32) |
| Dependencies | [TASK-LP-016](TASK-LP-016.md), [TASK-LP-051](TASK-LP-051.md), [TASK-LP-056](TASK-LP-056.md) |

## Problem and intended outcome

StoreKit accepts any verified current entitlement as premium, pending and canceled purchases collapse to nil, and restore success provides little user feedback. Commercial behavior is not yet validated.

## Implementation scope

1. Filter verified transactions by supported product IDs and valid entitlement state; associate purchases with the approved account model.
2. Handle purchase-in-progress, Ask to Buy/pending, cancellation, verification failure, refund, revocation, expiration, and restore-no-entitlement distinctly.
3. Manage transaction observation lifecycle and completion according to StoreKit semantics; avoid repeated concurrent purchases or leaked observer tasks.
4. Add adult-facing subscription terms, manage/restore actions, products-unavailable fallback, and meaningful feedback behind the adult gate.

## Acceptance criteria

- **Given** an unrelated verified product exists, **when** entitlements are evaluated, **then** it does not grant IEP & Thrive premium.

- **Given** a purchase is pending or later revoked, **when** StoreKit sends state changes, **then** the app displays and enforces the correct approved access state.

## Validation and evidence

StoreKit configuration tests and sandbox device validation for purchase, pending, restore on a second device, revocation, expired products, and network failure. Verify App Store Connect product availability separately.

## Rollout, migration, and recovery

Pilot without unsupported paid claims until products and restoration are verified. Maintain a free safe fallback when commerce is unavailable.

## Source evidence

- [ios/IEPAndThrive/Core/StoreKit/StoreKitClient.swift:70](../../../ios/IEPAndThrive/Core/StoreKit/StoreKitClient.swift#L70)
- [ios/IEPAndThrive/Features/Paywall/PaywallFeature.swift:19](../../../ios/IEPAndThrive/Features/Paywall/PaywallFeature.swift#L19)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
