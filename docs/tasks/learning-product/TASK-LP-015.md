# TASK-LP-015 — Implement adult consent and child-data minimization before cloud collection

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Privacy lead + backend + iOS + web |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F06](../../audits/2026-09-05/product-direction/findings.md#f06), [F39](../../audits/2026-09-05/product-direction/findings.md#f39) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md) |

## Problem and intended outcome

Native onboarding collects a child’s name and age and syncs after anonymous authentication; no completed consent gate was found. Existing intake/photo-release scaffolds serve different purposes.

## Implementation scope

1. Define collection purposes and the appropriate verified adult-consent process with qualified privacy review; distinguish parent consent, child assent, school-authorized use, and optional marketing/media permission.
2. Add an adult setup flow on web/iOS that records notice/version, scope, verification status, time, and withdrawal; enforce collection permissions server-side.
3. Keep the pre-consent demonstration local and free of child identifiers; review Firebase Auth, Crashlytics, analytics, caches, and third-party SDK initialization timing.
4. Collect only the learner data required for the initial reading product; do not require diagnosis, full IEP, birth date, or medical records for routine digital practice without a defined necessity.

## Acceptance criteria

- **Given** consent is absent or withdrawn, **when** a child-data sync is attempted, **then** the server rejects it and the client preserves only permitted local demo state.

- **Given** a parent declines optional media/marketing, **when** setup completes, **then** essential learning remains available under the approved core-consent model.

## Validation and evidence

Network inspection before/after consent; server denial tests; interrupted verification, expired notice, revocation, multiple children, and cross-device state tests. Review against sources S02/S03 in the source register.

## Rollout, migration, and recovery

Existing records require an explicit transition policy. A UI checkbox alone does not establish verified consent; pause collection when verification is unresolved.

## Source evidence

- [ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift:86](../../../ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift#L86)
- [ios/IEPAndThrive/IEPAndThriveApp.swift:12](../../../ios/IEPAndThrive/IEPAndThriveApp.swift#L12)
- [docs/compliance-framework.md:1](../../../docs/compliance-framework.md#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
