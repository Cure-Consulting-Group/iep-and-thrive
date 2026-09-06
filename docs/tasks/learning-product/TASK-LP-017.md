# TASK-LP-017 — Scope SwiftData records to accounts and learners with a safe legacy migration

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS data engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F04](../../audits/2026-09-05/product-direction/findings.md#f04), [F10](../../audits/2026-09-05/product-direction/findings.md#f10), [F43](../../audits/2026-09-05/product-direction/findings.md#f43) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-073](TASK-LP-073.md), [TASK-LP-076](TASK-LP-076.md) |

## Problem and intended outcome

Local profiles, lesson attempts, and Sparks carry no owner/learner key. Fetching the first profile and retaining records after sign-out can expose or attribute another child’s work.

## Implementation scope

1. Add immutable account/learner keys, record schema versions, stable activity/attempt identifiers, and uniqueness constraints to local models.
2. Introduce versioned SwiftData migration and an explicit decision for unattributed existing local records; do not silently assign all legacy work to the next signed-in child.
3. Scope every query, write, cache, aggregate, and cleanup operation to the active identity.
4. Make account sign-out remove or protect visible local state according to the approved offline retention policy.

## Acceptance criteria

- **Given** two children share one device, **when** the active child changes, **then** only that child’s scoped data is queried and rendered.

- **Given** an old unscoped store is upgraded, **when** ownership cannot be established, **then** records remain quarantined and do not count toward either learner’s progress.

## Validation and evidence

Real on-disk SwiftData migration tests with two accounts/children, interrupted upgrades, duplicate IDs, and inaccessible legacy data. Test sign-out/reinstall behaviors on devices; do not assume keychain lifecycle.

## Rollout, migration, and recovery

Back up the synthetic migration fixture and document recovery. Do not destroy uncertain records before the approved policy and migration verification are complete.

## Source evidence

- [ios/IEPAndThrive/Core/Data/Models.swift:22](../../../ios/IEPAndThrive/Core/Data/Models.swift#L22)
- [ios/IEPAndThrive/Core/Data/DatabaseClient.swift:20](../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift#L20)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
