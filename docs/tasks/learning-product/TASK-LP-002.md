# TASK-LP-002 — Establish educator ownership, content rights, and instructional review

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-01](../../audits/2026-09-05/product-direction/epics.md#epic-lp-01) |
| Priority / release gate | P1 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | Educator lead + product |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F01](../../audits/2026-09-05/product-direction/findings.md#f01), [F33](../../audits/2026-09-05/product-direction/findings.md#f33), [F37](../../audits/2026-09-05/product-direction/findings.md#f37) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md) |

## Problem and intended outcome

The curriculum is a substantial starting library, but files and founder credentials do not establish an approved digital curriculum or permission to distribute every item. Make expertise an accountable content-development process.

## Implementation scope

1. Inventory all lessons, passages, assessment references, art, and audio; record author, origin, rights, intended audience, version, and publication status.
2. Name the educator as instructional reviewer with time allocation and a substitute review path; distinguish supplied employment history from independently verified marketing credentials.
3. Review learning progressions, supports, and misconceptions; distinguish informal probes from licensed/normed instruments.
4. Set a release checklist for instructional accuracy, accessibility, cultural relevance, permission, and assessment separation.

## Acceptance criteria

- **Given** an asset has no documented rights or approval, **when** content publication is attempted, **then** the asset remains draft.

- **Given** an instructional change is proposed, **when** the reviewer approves it, **then** versioned rationale and affected skills are recorded.

## Validation and evidence

Audit a complete sample quest and its independent probe against the checklist; collect approval and rights evidence without copying restricted test material into the repository.

## Rollout, migration, and recovery

Preserve source materials. Quarantine uncertain assets from the digital release; do not relabel informal instruments as standardized.

## Source evidence

- [curriculum/scope-and-sequence.md:21](../../../curriculum/scope-and-sequence.md#L21)
- [lib/assessment-presets.ts:3](../../../lib/assessment-presets.ts#L3)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
