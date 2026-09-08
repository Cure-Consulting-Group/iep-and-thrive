# TASK-MVP-004 — Publish the information security programme

| Field | Value |
| --- | --- |
| Epic | EPIC-M1 — Lawful posture |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | Security lead |
| Estimate | 3 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001 |
| Design | None |

## Problem and intended outcome

The amended COPPA Rule requires a written information security programme. The current repository
has implementation notes but no approved, operational document that names controls for the
on-device free path and the narrow cohort exception.

## Implementation scope

1. Write the programme with scope, data-flow inventory, threat assumptions, access control,
   dependency review, secure development, incident response, backup/export handling, and review
   cadence.
2. Distinguish local learner data, temporary age signals, consent artifacts, and aggregate cohort
   counters; specify owners and evidence for each control.
3. Link the programme to ADR-000 and the release checklist without inventing controls the product
   does not implement.

## Acceptance criteria

- **Given** a reviewer follows every data flow in the iOS MVP, **when** they read the programme,
  **then** each flow has an owner, control, retention rule, and verification artifact.
- **Given** a new dependency or network client is proposed, **when** the programme review is
  applied, **then** the change has a documented security review before approval.
- **Given** an incident involving local or cohort data, **when** the runbook is opened, **then** it
  identifies containment, evidence preservation, notification decision, and recovery owners.

## Validation and evidence

Security lead and product owner review the document against ADR-000 D1, D6, D9, and D10. Check that
the controls match source/configuration and attach the signed review to the release evidence.

## Rollout, migration, and recovery

Documentation only. Existing behavior does not change. If a control is not yet implemented, mark it
as a release blocker rather than describing it as complete.

## Source evidence

- [ADR-000](../../architecture/ADR-000-mvp-architecture-decisions.md)
- [repair progress](../../audits/2026-09-05/repair-progress.md)

## Definition of done

The document is versioned, reviewed by security and product, linked from the release checklist,
and every stated control has a source or test artifact.
