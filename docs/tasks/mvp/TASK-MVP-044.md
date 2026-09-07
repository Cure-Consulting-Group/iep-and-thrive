# TASK-MVP-044 — Submit the app and close the release gates

| Field | Value |
| --- | --- |
| Epic | EPIC-M10 — Release |
| Priority / release gate | P0 / March 2027 ship gate |
| Status | Proposed — review required |
| Proposed owner | Release manager + iOS lead |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-003, TASK-MVP-005, TASK-MVP-007, TASK-MVP-008, TASK-MVP-010, TASK-MVP-013, TASK-MVP-015, TASK-MVP-025, TASK-MVP-028, TASK-MVP-030, TASK-MVP-031, TASK-MVP-035, TASK-MVP-036, TASK-MVP-037, TASK-MVP-040, TASK-MVP-041, TASK-MVP-042, TASK-MVP-043 |
| Design | design-studio — App Store listing screenshots and review-safe metadata, 1 package |

## Problem and intended outcome

The product cannot answer the retention question until the exact tested archive is available to the
recruited cohort. Close the technical, lawful, content, measurement, and recovery gates and submit
the iOS app for a March 2027 App Store release.

## Implementation scope

1. Assemble the release candidate from the validated corpus, audio manifest, policies, consent
   artifact, static export, no-network evidence, golden files, and migration report.
2. Run the full iOS, backend security, static export, accessibility, and release-candidate smoke
   suites; record versions, checksums, build number, and known limitations.
3. Prepare App Store metadata, Kids Category evidence, privacy manifest, support URL, screenshots,
   review notes, and staged release controls using the approved design-studio package.
4. Submit the archive, record Apple's response, and freeze the May 2027 retention readout owner,
   denominator, analysis date, and rollback contact.

## Acceptance criteria

- **Given** any required release gate is red or evidence is missing, **when** the release checklist
  runs, **then** submission is blocked and the named owner receives the defect.
- **Given** all gates are green, **when** the release candidate is installed on a clean device,
  **then** first launch, a complete offline session, local relaunch, consented synthetic upload,
  and clean exit pass with the recorded build checksum.
- **Given** the archive is submitted, **when** the release record is finalized, **then** it contains
  App Store submission evidence, policy versions, cohort readiness, rollback contact, and the May
  2027 analysis commitment.

## Validation and evidence

Run the release checklist, full test matrix, archive verification, App Store metadata review, and
clean-device smoke test. Attach the final signed checklist and submission receipt.

## Rollout, migration, and recovery

Use staged release controls and retain the last validated archive. If review rejects the build or a
gate regresses, pause distribution, preserve local/cohort state, correct the owning ticket, and
submit a new checksum; do not alter the measurement denominator after recruitment.

## Source evidence

- [project.yml](../../../ios/project.yml)
- [ADR-000](../../architecture/ADR-000-mvp-architecture-decisions.md)
- [growth timeline](../../research/2026-09-06-growth-timeline.md)

## Definition of done

Code and release review are approved; new automation has at least 80% coverage where applicable;
inputs and metadata are validated; no secrets are hardcoded; all gates are green; the March 2027
submission is recorded; and the May 2027 answer milestone has an owner and method.
