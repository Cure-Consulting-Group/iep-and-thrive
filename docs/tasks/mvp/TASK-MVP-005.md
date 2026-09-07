# TASK-MVP-005 — Publish the data retention policy

| Field | Value |
| --- | --- |
| Epic | EPIC-M1 — Lawful posture |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | Product lead + counsel |
| Estimate | 3 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001 |
| Design | None |

## Problem and intended outcome

The MVP needs a written data retention policy that is honest about device-local evidence, temporary
age signals, consent, and the finite cohort study. Without it, deletion and study shutdown cannot
be verified.

## Implementation scope

1. Define retention and deletion for local skill evidence, temporary age data, consent artifacts,
   participant token, aggregate uploads, logs, exports, and archived study output.
2. Specify triggers, responsible operator, verification evidence, and recovery constraints for each
   class; never promise deletion of data the system does not control.
3. Define study closeout and token destruction, and link the policy to the consent artifact and
   measurement plan.

## Acceptance criteria

- **Given** each MVP data class is listed, **when** the policy is reviewed, **then** it names a
  retention period or event, deletion owner, and verification method.
- **Given** the cohort study ends, **when** the closeout procedure runs, **then** participant tokens
  and raw upload records are destroyed or de-identified as specified, with an evidence log.
- **Given** a local migration or export is needed, **when** the policy is applied, **then** the
  recovery copy has a defined lifetime and is not silently retained indefinitely.

## Validation and evidence

Counsel and product review every data class against the implementation and D6/D10. Simulate study
closeout in a test environment and attach the deletion evidence without using real family data.

## Rollout, migration, and recovery

Documentation only. The policy cannot shorten already-required operational retention without an
approved deletion procedure. Any mismatch becomes a release blocker.

## Source evidence

- [ADR-000 D6](../../architecture/ADR-000-mvp-architecture-decisions.md#d6--the-only-free-tier-network-path-is-consented-cohort-measurement)
- [ADR-000 D10](../../architecture/ADR-000-mvp-architecture-decisions.md#d10--swiftdata-for-local-persistence-with-an-explicit-schema-version)

## Definition of done

The policy is versioned, counsel-reviewed, linked from consent and release artifacts, and every
retention claim is backed by a test, operator procedure, or explicit limitation.
