# TASK-LP-038 — Wire tutoring purchase buttons to authenticated supported checkout operations

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Web + backend |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F18](../../audits/2026-09-05/product-direction/findings.md#f18) |
| Dependencies | [TASK-LP-050](TASK-LP-050.md), [TASK-LP-075](TASK-LP-075.md) |

## Problem and intended outcome

Tutoring pricing anchors navigate directly to JSON endpoints. Subscription links cannot attach a bearer token, and drop-in/IEP-review links send product values that the cohort checkout endpoint does not accept.

## Implementation scope

1. Replace raw endpoint anchors with an accessible async checkout controller that preserves chosen offer through login, obtains a token where needed, calls the supported contract, and navigates to the returned Stripe URL.
2. Define server-owned drop-in and IEP-review SKUs or remove purchase CTAs until those products have a complete fulfillment path.
3. Show distinct unavailable, auth-required, busy, failed, and retry states; prevent repeated clicks from creating duplicate sessions.
4. Align advertised recurring-slot, pause, expiration, and cancellation promises with implemented booking and billing behavior.

## Acceptance criteria

- **Given** a signed-out family chooses a subscription, **when** they finish login, **then** their selected supported offer continues to Checkout with authenticated identity.

- **Given** a one-time tutoring SKU is unavailable, **when** the CTA is rendered, **then** it does not route to an incompatible cohort payment endpoint.

## Validation and evidence

Browser tests with mocked checkout responses plus Stripe test-mode integration; verify cancellation/back navigation and request auth/parameters without real charges.

## Rollout, migration, and recovery

Repair or temporarily disable broken purchase controls before campaigning; preserve existing subscription-management access.

## Source evidence

- [components/ui/PricingCard.tsx:83](../../../components/ui/PricingCard.tsx#L83)
- [components/sections/TutoringPricing.tsx:48](../../../components/sections/TutoringPricing.tsx#L48)
- [components/ui/IEPReviewBanner.tsx:23](../../../components/ui/IEPReviewBanner.tsx#L23)
- [functions/src/stripe-checkout.ts:52](../../../functions/src/stripe-checkout.ts#L52)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
