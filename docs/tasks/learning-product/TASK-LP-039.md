# TASK-LP-039 — Create accurate product discovery pages and reconcile public claims

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P1 / G3: paid digital release |
| Status | Proposed — review required |
| Proposed owner | Product marketing + educator + web |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F01](../../audits/2026-09-05/product-direction/findings.md#f01), [F37](../../audits/2026-09-05/product-direction/findings.md#f37), [F40](../../audits/2026-09-05/product-direction/findings.md#f40) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md), [TASK-LP-002](TASK-LP-002.md), [TASK-LP-005](TASK-LP-005.md) |

## Problem and intended outcome

Public pages primarily sell Summer 2026 in Long Island and contain unverified testimonials/learning claims. The software direction needs clear NYC-rooted positioning without implying efficacy or availability that has not been established.

## Implementation scope

1. Create focused product pages explaining intended learner, short practice experience, adult evidence, supported devices, limitations, and product versus tutoring offers.
2. Build a claims register: supplied educator tenure/Dean/SPED experience, certifications needing confirmation, testimonial permissions, outcome evidence, cohort/date/price facts, and review owner.
3. Replace expired urgency, inconsistent cohort dates/group sizes, and unavailable purchase/demo claims; maintain separate current service information.
4. Audit metadata, social preview assets, canonical URLs, sitemap/robots behavior, structured data, domain routing, and accessible headings for public/private routes.

## Acceptance criteria

- **Given** a visitor reads a learning-gain or testimonial claim, **when** the claims register is checked, **then** supporting evidence and permission exist or the claim is removed.

- **Given** a product is still in pilot, **when** a visitor reaches its CTA, **then** the page accurately describes the access stage and supported platforms.

## Validation and evidence

Content/legal review as appropriate, direct CTA tests, metadata/robots inspection, desktop/mobile checks, and current domain/DNS verification at release.

## Rollout, migration, and recovery

Publish only reviewed claims; retain archived campaign copy for records without leaving expired urgency live. Do not borrow school-outcome claims for app performance.

## Source evidence

- [components/sections/Testimonials.tsx:1](../../../components/sections/Testimonials.tsx#L1)
- [components/sections/Hero.tsx:1](../../../components/sections/Hero.tsx#L1)
- [app/layout.tsx:24](../../../app/layout.tsx#L24)
- [curriculum/scope-and-sequence.md:17](../../../curriculum/scope-and-sequence.md#L17)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
