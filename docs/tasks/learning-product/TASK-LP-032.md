# TASK-LP-032 — Build the adult evidence dashboard and honest progress exports

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Web + backend + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F03](../../audits/2026-09-05/product-direction/findings.md#f03), [F14](../../audits/2026-09-05/product-direction/findings.md#f14), [F34](../../audits/2026-09-05/product-direction/findings.md#f34), [F36](../../audits/2026-09-05/product-direction/findings.md#f36) |
| Dependencies | [TASK-LP-025](TASK-LP-025.md), [TASK-LP-030](TASK-LP-030.md), [TASK-LP-037](TASK-LP-037.md) |

## Problem and intended outcome

The portal summarizes completed lessons and Sparks alongside service reports. The independent product needs an adult view showing what was practiced, what help was used, and what was demonstrated on fresh tasks.

## Implementation scope

1. Create learner-scoped views for recent practice, supported versus independent outcomes, representative response evidence, assessment context, and suggested next steps.
2. Keep rewards visually separate from learning observations; label legacy/unverified records and stale or incomplete synchronization.
3. Provide accessible print/export with provenance, date range, rubric/content versions, assistance, limitations, and explicit missing data; do not claim CSE acceptance or diagnostic validity.
4. Support zero history, partial sync, revoked sharing, and a learner with no tutoring enrollment.

## Acceptance criteria

- **Given** a family only uses the digital product, **when** they open the portal, **then** they see relevant learning evidence without enrollment prerequisites.

- **Given** only reward events exist, **when** the report is generated, **then** it states that independent skill evidence is unavailable.

## Validation and evidence

Golden-report fixtures, cross-family permission tests, empty/failed/stale data states, accessible chart/table alternatives, and educator verification of every outcome phrase.

## Rollout, migration, and recovery

Add the new view alongside service reporting and clearly separate data provenance. Preserve historical reports as authored documents.

## Source evidence

- [lib/ios-progress.ts:42](../../../lib/ios-progress.ts#L42)
- [components/portal/IOSSessionTile.tsx:1](../../../components/portal/IOSSessionTile.tsx#L1)
- [app/portal/students/[studentId]/sessions/page.tsx:1](../../../app/portal/students/[studentId]/sessions/page.tsx#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
