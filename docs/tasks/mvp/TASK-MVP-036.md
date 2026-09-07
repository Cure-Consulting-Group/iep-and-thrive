# TASK-MVP-036 — Approve the retention measurement plan

| Field | Value |
| --- | --- |
| Epic | EPIC-M8 — Measurement |
| Priority / release gate | P0 / Stage 3 gate |
| Status | Proposed — review required |
| Proposed owner | Measurement lead + product owner |
| Estimate | 3 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-033, TASK-MVP-034 |
| Design | None |

## Problem and intended outcome

Without a pre-registered measurement plan, the team could change the denominator or substitute
engagement proxies after seeing the data. Define one honest week-eight retention analysis before
recruitment.

## Implementation scope

1. Specify cohort eligibility, first-open date, session and week definitions, primary week-eight
   return metric, denominator, censoring and missing-data rule, and minimum cohort size of 30–50.
2. Define secondary descriptive counters without turning them into mastery or diagnostic claims.
3. Specify data quality checks, confidence interval method, analysis owner, readout date in May
   2027, and limitations.

## Acceptance criteria

- **Given** a synthetic cohort with known first opens and returns, **when** the plan is applied,
  **then** the primary numerator and denominator are reproducible by a second reviewer.
- **Given** missing uploads or revoked consent, **when** the analysis is run, **then** the stated
  missing-data rule is applied without silently changing the cohort denominator.
- **Given** the release candidate, **when** the plan is reviewed, **then** every collected field is
  justified by the primary question or a declared secondary description.

## Validation and evidence

Run the synthetic analysis twice with independent reviewers. Attach the approved plan, data
dictionary, synthetic output, and May readout calendar entry.

## Rollout, migration, and recovery

Freeze the plan before recruitment. Any later change is a dated amendment with owner, rationale,
and impact; do not rewrite prior results silently.

## Source evidence

- [growth timeline](../../research/2026-09-06-growth-timeline.md#the-three-unknowns-in-the-order-they-can-kill-this)
- [ADR-000 D6](../../architecture/ADR-000-mvp-architecture-decisions.md#d6--the-only-free-tier-network-path-is-consented-cohort-measurement)

## Definition of done

The plan is approved, reproducible on synthetic data, linked to the consent artifact and payload
schema, and has an owner and May 2027 readout date.
