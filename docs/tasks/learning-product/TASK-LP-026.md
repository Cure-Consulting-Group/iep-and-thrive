# TASK-LP-026 — Build a reviewed content publication and rollback pipeline

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-04](../../audits/2026-09-05/product-direction/epics.md#epic-lp-04) |
| Priority / release gate | P1 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | Content engineering + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F33](../../audits/2026-09-05/product-direction/findings.md#f33) |
| Dependencies | [TASK-LP-002](TASK-LP-002.md), [TASK-LP-025](TASK-LP-025.md) |

## Problem and intended outcome

Curriculum is duplicated across Markdown, TypeScript views, and hardcoded Swift definitions. Updating educational content currently requires code changes without a shared approval/version contract.

## Implementation scope

1. Define a repository-first content schema with draft/reviewed/published/retired states, stable IDs, rights metadata, age/prerequisite tags, supports, rubrics, and asset hashes.
2. Create lint/build validation and an educator-readable preview; publish immutable signed or integrity-checked bundles with minimum supported client versions.
3. Separate independent probes from practice content and restrict unreleased assets; define a catalog manifest and known-good offline bundle.
4. Document content rollback and withdrawal of unsafe/incorrect items without changing historical evidence. A full CMS is not required for the pilot.

## Acceptance criteria

- **Given** an item lacks approval, rights, or a valid rubric, **when** publication runs, **then** the bundle is rejected.

- **Given** a published item is withdrawn, **when** clients refresh or operate offline, **then** the defined safe fallback applies and historical attempts keep their original version.

## Validation and evidence

Content schema tests, broken asset and version compatibility tests, snapshot review of all quest screens, and rollback rehearsal with cached bundles.

## Rollout, migration, and recovery

Retain immutable bundle versions; release a compatible reader before changing content format. Keep an embedded safe demo for unavailable content.

## Source evidence

- [lib/curriculum-lessons.ts:1](../../../lib/curriculum-lessons.ts#L1)
- [lib/curriculum-data.ts:1](../../../lib/curriculum-data.ts#L1)
- [ios/IEPAndThrive/Core/Data/CurriculumClient.swift:79](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift#L79)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
