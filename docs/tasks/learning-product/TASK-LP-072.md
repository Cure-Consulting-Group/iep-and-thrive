# TASK-LP-072 — Consolidate backlog ownership, operating runbooks, and support

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-10](../../audits/2026-09-05/product-direction/epics.md#epic-lp-10) |
| Priority / release gate | P1 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | Product + engineering lead + operations |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F01](../../audits/2026-09-05/product-direction/findings.md#f01), [F41](../../audits/2026-09-05/product-direction/findings.md#f41) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md) |

## Problem and intended outcome

Historical documents and ticket lists declare readiness and describe school-first priorities that conflict with the current direction. Establish a single active plan and realistic operational responsibility.

## Implementation scope

1. Mark historical PRDs/roadmaps as superseded where appropriate and link the approved brief, audit, ticket index, and current release evidence from STATE.md.
2. Assign accountable owners for curriculum review, privacy, incidents, billing reconciliation, backups, support, and release; record educator availability and engineering capacity.
3. Create support flows for login, lost progress, accessibility barriers, failed purchases, deletion, and instructional concerns with escalation boundaries.
4. Track ticket status, dependency changes, decision records, and accepted exceptions; archive obsolete stubs and backlog items only after use is checked.

## Acceptance criteria

- **Given** a contributor opens the repository, **when** they look for next work, **then** one active brief and sequenced backlog are clearly identified.

- **Given** a parent reports lost progress, **when** support follows the runbook, **then** the issue reaches the right owner without requesting unnecessary sensitive records.

## Validation and evidence

Link/backlog validation, owner review, one incident/support tabletop, and a documented weekly review cadence. Do not treat suggested owners as assigned people until accepted.

## Rollout, migration, and recovery

Preserve old research and decisions as historical context. No tickets are automatically published to external systems or assigned to individuals during this audit.

## Source evidence

- [STATE.md:1](../../../STATE.md#L1)
- [docs/epics-and-tickets.md:1](../../../docs/epics-and-tickets.md#L1)
- [docs/ios-pivot/BACKLOG.md:1](../../../docs/ios-pivot/BACKLOG.md#L1)
- [lib/gmail-service.ts:159](../../../lib/gmail-service.ts#L159)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
