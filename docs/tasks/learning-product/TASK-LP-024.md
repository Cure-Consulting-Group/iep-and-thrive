# TASK-LP-024 — Restrict the catalog to supported activity types and accurate claims

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P0 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | Educator + iOS |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F02](../../audits/2026-09-05/product-direction/findings.md#f02), [F33](../../audits/2026-09-05/product-direction/findings.md#f33) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md), [TASK-LP-025](TASK-LP-025.md) |

## Problem and intended outcome

Comprehension and writing labels route to token tracing. Some math lessons accept any positive cube count; equal-groups and arrays only check the total. Hide unsupported instructional claims while preserving useful practice.

## Implementation scope

1. Add explicit supported activity types and validators to catalog entries; reject missing prompt/response/rubric definitions.
2. Publish tracing as tracing and counting as counting. Remove unsupported prediction, retelling, main-idea, writing, place-value, rounding, grouping, and array claims until valid activities exist.
3. Separate retained math/tracing practice from the first reading-product progression; do not prioritize new math content for the reading pilot.
4. Handle removed/retired nodes and old level indices without shifting historical attribution.

## Acceptance criteria

- **Given** a catalog item lacks a valid implementation, **when** the catalog is built, **then** publication fails or the item remains unavailable.

- **Given** a retired lesson has old records, **when** the adult views history, **then** the original identity and practice-only status remain intelligible.

## Validation and evidence

Catalog validation tests across all 38 definitions, routing matrix, and educator review of title/prompt/response alignment. Test no empty-catalog dead end.

## Rollout, migration, and recovery

Use stable activity IDs and archived catalog versions; avoid renumbering historical levelIndex records into new skills.

## Source evidence

- [ios/IEPAndThrive/Core/Data/CurriculumClient.swift:82](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift#L82)
- [ios/IEPAndThrive/Features/Math/MathFeature.swift:26](../../../ios/IEPAndThrive/Features/Math/MathFeature.swift#L26)
- [ios/IEPAndThrive/Features/Root/RootFeature.swift:226](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L226)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
