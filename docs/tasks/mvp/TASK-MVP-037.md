# TASK-MVP-037 — Recruit and instrument a 30–50-child cohort

| Field | Value |
| --- | --- |
| Epic | EPIC-M8 — Measurement |
| Priority / release gate | P0 / Stage 3 gate |
| Status | Proposed — review required |
| Proposed owner | Cohort lead + product owner |
| Estimate | 3 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-034, TASK-MVP-035, TASK-MVP-036 |
| Design | None |

## Problem and intended outcome

The MVP answer requires real children using the released app, not a lab proxy or a post-hoc sample.
Recruit 30–50 eligible families through the approved channel, issue consented codes, and preserve a
clean cohort ledger without collecting unapproved learner identity.

## Implementation scope

1. Define eligibility, outreach script, consent handoff, code issuance, support contact, withdrawal
   process, and cohort ledger fields using the approved measurement plan.
2. Enroll 30–50 children, verify that each device has a valid code and consent artifact version,
   and run a synthetic end-to-end upload before the first real session.
3. Monitor delivery and missing-data checks without adding third-party telemetry or collecting raw
   child responses.

## Acceptance criteria

- **Given** a recruited family passes the approved consent process, **when** their code is issued,
  **then** the ledger contains only the approved cohort metadata and the device can enroll.
- **Given** the target cohort reaches 30–50 children, **when** the readiness check runs, **then**
  every participant has a valid code, consent version, first-open capture, and upload test result.
- **Given** a family withdraws, **when** withdrawal is recorded, **then** future uploads stop and the
  retention plan marks the participant according to its stated missing-data rule.

## Validation and evidence

Review the redacted cohort ledger, synthetic upload, consent audit, code inventory, and readiness
check. Never use real family records in repository fixtures.

## Rollout, migration, and recovery

Recruitment is staged after 034–036 approval. If the cohort is below target or upload quality fails,
pause recruitment, preserve consent evidence, and report the limitation rather than substituting an
unapproved sample.

## Source evidence

- [growth timeline](../../research/2026-09-06-growth-timeline.md#phase-1--depth--the-only-thing-that-matters-until-it-is-done)
- [ADR-000 D6](../../architecture/ADR-000-mvp-architecture-decisions.md#d6--the-only-free-tier-network-path-is-consented-cohort-measurement)

## Definition of done

The approved cohort is recruited, consent/code/upload readiness is evidenced, withdrawal handling is
tested, and no real family records or credentials are committed.
