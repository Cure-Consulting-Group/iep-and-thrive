# TASK-LP-037 — Repair parent query authorization, read models, and data-state errors

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Web + backend |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F14](../../audits/2026-09-05/product-direction/findings.md#f14) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md) |

## Problem and intended outcome

Parent summary queries filter by studentId but rules authorize by parentId, so valid parents receive permission errors. Some reads hide errors as empty data, and probe capturedAt types differ between producer and consumer interfaces.

## Implementation scope

1. Pass trusted parent/learner keys through attendance, latest-note, reports, probes, and portfolio queries; match rule predicates and composite indexes.
2. Unify runtime decoding for timestamps and optional fields across assessment/probe/report/native producers; never trust casts alone at network boundaries.
3. Distinguish loading, no data, forbidden, unavailable, malformed, and stale data in portal components; isolate one tile failure from unrelated content.
4. Add bounded queries/cursors and test expected Firestore index requirements with a staging verification step because emulator behavior does not fully validate indexes.

## Acceptance criteria

- **Given** an owning parent has valid records, **when** the dashboard queries them, **then** records load without weakening cross-family rules.

- **Given** a query or decoder fails, **when** a tile renders, **then** it reports unavailable/partial data rather than implying the child has no progress.

## Validation and evidence

Emulator owner/cross-family query cases, production-shape Timestamp fixtures, missing-index staging smoke, and UI partial-failure tests.

## Rollout, migration, and recovery

Deploy indexes before the new query shape; keep explicit adapters for legacy fields and monitor rejected documents with sanitized counts.

## Source evidence

- [lib/portal-progress.ts:138](../../../lib/portal-progress.ts#L138)
- [lib/portal-progress.ts:210](../../../lib/portal-progress.ts#L210)
- [lib/probe-service.ts:91](../../../lib/probe-service.ts#L91)
- [firestore.indexes.json:1](../../../firestore.indexes.json#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
