# TASK-LP-071 — Run a release-gate review and consented pilot acceptance cycle

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-10](../../audits/2026-09-05/product-direction/epics.md#epic-lp-10) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | QA lead + educator + product + privacy |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F38](../../audits/2026-09-05/product-direction/findings.md#f38), [F40](../../audits/2026-09-05/product-direction/findings.md#f40), [F41](../../audits/2026-09-05/product-direction/findings.md#f41) |
| Dependencies | [TASK-LP-003](TASK-LP-003.md), [TASK-LP-006](TASK-LP-006.md), [TASK-LP-007](TASK-LP-007.md), [TASK-LP-008](TASK-LP-008.md), [TASK-LP-012](TASK-LP-012.md), [TASK-LP-013](TASK-LP-013.md), [TASK-LP-015](TASK-LP-015.md), [TASK-LP-016](TASK-LP-016.md), [TASK-LP-018](TASK-LP-018.md), [TASK-LP-019](TASK-LP-019.md), [TASK-LP-020](TASK-LP-020.md), [TASK-LP-021](TASK-LP-021.md), [TASK-LP-023](TASK-LP-023.md), [TASK-LP-024](TASK-LP-024.md), [TASK-LP-028](TASK-LP-028.md), [TASK-LP-029](TASK-LP-029.md), [TASK-LP-030](TASK-LP-030.md), [TASK-LP-032](TASK-LP-032.md), [TASK-LP-036](TASK-LP-036.md), [TASK-LP-037](TASK-LP-037.md), [TASK-LP-040](TASK-LP-040.md), [TASK-LP-055](TASK-LP-055.md), [TASK-LP-056](TASK-LP-056.md), [TASK-LP-060](TASK-LP-060.md), [TASK-LP-062](TASK-LP-062.md), [TASK-LP-064](TASK-LP-064.md), [TASK-LP-065](TASK-LP-065.md), [TASK-LP-068](TASK-LP-068.md), [TASK-LP-070](TASK-LP-070.md), [TASK-LP-074](TASK-LP-074.md), [TASK-LP-075](TASK-LP-075.md) |

## Problem and intended outcome

A build and unit-test pass do not establish that the product is safe, usable, instructionally sound, or independently valuable. Make the decision to involve children explicit and evidence-based.

## Implementation scope

1. Create a release dossier tied to exact app/backend/rules/content versions, unresolved risks, supported learners/devices, consent readiness, and support ownership.
2. Rehearse adult setup, child quest, help/exit, offline restart, independent check, adult evidence, and withdrawal using synthetic data before enrollment.
3. Execute the approved feasibility protocol only after G2 prerequisites and documented operational authorization; record assistance, confusion, access barriers, failures, and retention.
4. Hold a go/iterate/stop review with objective findings; do not convert small-pilot improvement into a validated efficacy claim.

## Acceptance criteria

- **Given** a required gate lacks evidence, **when** pilot enrollment is proposed, **then** the release remains blocked with a named owner and concrete missing item.

- **Given** the pilot ends, **when** the decision is recorded, **then** the team can trace continuation or redesign to observed results and limitations.

## Validation and evidence

Completed UAT scenarios, device/accessibility matrix, protocol approvals, issue log, denominator-aware results, and signed review record. Acceptance thresholds are agreed before collection.

## Rollout, migration, and recovery

Provide a stop-collection switch, support contact, and participant exit plan. A failed pilot criterion results in iteration or stop, not silently lowered thresholds.

## Source evidence

- [docs/audits/2026-09-05/build-audit.md:159](../../../docs/audits/2026-09-05/build-audit.md#L159)
- [docs/launch-checklist.md:1](../../../docs/launch-checklist.md#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
