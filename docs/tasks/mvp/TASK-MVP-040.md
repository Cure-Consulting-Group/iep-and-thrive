# TASK-MVP-040 — Remove backend rules and Functions for deleted routes

| Field | Value |
| --- | --- |
| Epic | EPIC-M9 — Web reduction |
| Priority / release gate | P1 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Backend/security engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-039 |
| Design | None |

## Problem and intended outcome

Deleted web capabilities can remain exposed through Firestore rules or callable Functions even after
their pages disappear. Remove those contracts and keep only the marketing/support and one consented
cohort endpoint allowed by ADR-000.

## Implementation scope

1. Map each removed route to its rules, indexes, Functions, triggers, schemas, and tests.
2. Delete obsolete rules and Functions, narrow exports and deployment configuration, and retain
   deny-by-default behavior for collections without an MVP writer.
3. Preserve and separately test the single cohort Function contract from 035; do not alter its
   write-only boundary while removing unrelated code.

## Acceptance criteria

- **Given** a removed route or collection, **when** its old read/write request is replayed in the
  emulator, **then** it is denied or returns the documented missing-handler response.
- **Given** the cohort endpoint contract, **when** its security suite runs, **then** valid writes
  still pass and reads, malformed inputs, and unauthorized writes remain denied.
- **Given** the Functions build, **when** exports and rules are enumerated, **then** no deleted route
  has a reachable backend handler or permissive rule.

## Validation and evidence

Run Functions build, emulator security tests, export inventory, dead-reference search, and rules
coverage. Attach the route-to-backend deletion map.

## Rollout, migration, and recovery

Deploy only with the static export release. Keep a versioned rules file for rollback review, but do
not restore removed permissions without a new approved MVP ticket.

## Source evidence

- [firestore.rules](../../../firestore.rules)
- [functions/src](../../../functions/src)
- [ADR-000 D8](../../architecture/ADR-000-mvp-architecture-decisions.md#d8--the-web-is-a-static-export-with-no-learner-surface-until-year-3)

## Definition of done

Code review is approved; new code has at least 80% coverage; request inputs are validated; secrets
are configuration-managed; rules deny by default; the cohort Function remains isolated; and the
deletion map is attached.
