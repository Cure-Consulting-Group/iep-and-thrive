# TASK-LP-034 — Separate marketing, family learning, practitioner, and service navigation

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P1 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | Web + product design |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F01](../../audits/2026-09-05/product-direction/findings.md#f01), [F34](../../audits/2026-09-05/product-direction/findings.md#f34) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md) |

## Problem and intended outcome

The global web layout renders marketing urgency/navigation/footer around all pages, while portal navigation assumes service enrollment. Define a product information architecture that serves standalone users.

## Implementation scope

1. Map public product discovery, public tutoring discovery, adult account setup, learner evidence, practitioner access, and internal service operations into distinct route groups/layouts.
2. Keep existing tutoring URLs and customer actions available with a documented redirect map; give digital-only accounts an appropriate first destination.
3. Remove expired acquisition chrome from authenticated and learning surfaces; make role/offer visibility follow actual claims and entitlements.
4. Document responsive navigation, focus behavior, page titles, loading/error boundaries, and safe sign-out across layouts.

## Acceptance criteria

- **Given** a digital-only parent signs in, **when** the portal opens, **then** the primary action is learner setup or evidence, not a cohort enrollment task.

- **Given** an existing service customer follows a saved link, **when** navigation resolves, **then** the service task remains available or redirects explicitly.

## Validation and evidence

Route inventory review, responsive keyboard navigation, auth/role states, and direct-link/refresh tests. Preserve historical paths in the route map.

## Rollout, migration, and recovery

Release route groups gradually with redirects and analytics comparisons; keep rollbacks to working pages without restoring stale seasonal promises.

## Source evidence

- [app/layout.tsx:75](../../../app/layout.tsx#L75)
- [app/portal/layout.tsx:1](../../../app/portal/layout.tsx#L1)
- [app/admin/layout.tsx:1](../../../app/admin/layout.tsx#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
