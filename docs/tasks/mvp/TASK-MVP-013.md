# TASK-MVP-013 — Fail CI on invalid curriculum content

| Field | Value |
| --- | --- |
| Epic | EPIC-M3 — Content platform |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | Build engineer |
| Estimate | 3 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-012 |
| Design | None |

## Problem and intended outcome

The validator has no release effect until CI runs it before the iOS archive. A malformed or
unpronounceable level must fail the build rather than reach a child.

## Implementation scope

1. Add a deterministic CI job that installs the pinned validator dependencies, validates the corpus,
   taxonomy, engine registry, and audio manifest, and uploads diagnostics.
2. Run the job before the iOS build/archive step and make nonzero validator output fail the workflow.
3. Add a fixture-only CI test that intentionally fails, then remove the failure from the shipping
   corpus while retaining the test assertion.

## Acceptance criteria

- **Given** a malformed or unreachable corpus fixture, **when** CI runs, **then** the workflow fails
  before archive creation and exposes the validator diagnostic.
- **Given** the reviewed MVP corpus and manifest, **when** CI runs, **then** validation passes before
  the iOS test and archive jobs.
- **Given** a validator dependency is unavailable, **when** CI starts, **then** the job fails closed
  rather than skipping validation.

## Validation and evidence

Run the workflow against valid and intentionally invalid fixtures. Attach the workflow run showing
ordering, failure behavior, and successful full-corpus validation.

## Rollout, migration, and recovery

Introduce the gate after 012 is green locally. If CI is unavailable, do not produce a release
archive; restore the last validated corpus only through review.

## Source evidence

- [project.yml](../../../ios/project.yml)
- [ADR-000 D3](../../architecture/ADR-000-mvp-architecture-decisions.md#d3--content-is-data-validated-in-ci-never-code)

## Definition of done

Code review is approved; build scripts have tests where practical; inputs are pinned and validated;
no secrets are hardcoded; and CI demonstrably fails before archive on invalid content.
