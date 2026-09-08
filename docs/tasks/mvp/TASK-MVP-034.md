# TASK-MVP-034 — Add the consent artifact and cohort enrollment flow

| Field | Value |
| --- | --- |
| Epic | EPIC-M8 — Measurement |
| Priority / release gate | P0 / Stage 3 gate |
| Status | Proposed — review required |
| Proposed owner | Product lead + counsel + iOS engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-003, TASK-MVP-033, TASK-MVP-005 |
| Design | design-studio — cohort consent and code entry, 4 screens |

## Problem and intended outcome

The only network exception is a parent-consented recruited cohort. Consent must be a real written
artifact, visible and revocable, and code entry must unlock only the approved aggregate upload path.

## Implementation scope

1. Produce the counsel-reviewed consent document naming purpose, counters, token, upload cadence,
   revocation, retention, study closeout, contact, and limitations.
2. Implement the numeric gate plus bounded cohort code entry, validate the code format locally, and
   store only the minimum enrollment state and random participant token.
3. Make enrollment off by default, visible in local settings, revocable without deleting learning
   evidence, and testable without real participant data.

## Acceptance criteria

- **Given** a device has no enrollment, **when** the child uses the app, **then** no cohort counter
  leaves the device and no participant token exists.
- **Given** a parent passes the numeric gate and enters a valid issued code, **when** consent is
  confirmed, **then** the approved artifact version, enrollment state, and random token are stored
  and the upload client alone becomes eligible.
- **Given** the parent revokes consent, **when** revocation completes, **then** future uploads stop,
  the token is destroyed as specified, and local learning evidence remains available.

## Validation and evidence

Counsel reviews the artifact; reducer tests cover invalid code, cancel, consent, revocation, and
relaunch; design/accessibility QA covers the visible flow; no real cohort data is used in tests.

## Rollout, migration, and recovery

Enrollment is additive. If an upload is in flight during revocation, cancel it and mark the local
state revoked; recover only from the signed consent artifact and issue a new code if re-enrollment
is approved.

## Source evidence

- [ADR-000 D6](../../architecture/ADR-000-mvp-architecture-decisions.md#d6--the-only-free-tier-network-path-is-consented-cohort-measurement)
- [ADR-000 D7](../../architecture/ADR-000-mvp-architecture-decisions.md#d7--personal-information-enters-at-the-parent-account-and-not-one-step-earlier)

## Definition of done

Code and document review are approved; new code has at least 80% coverage; code and inputs are
validated; no secrets are hardcoded; consent is explicit/revocable; and design QA passes.
