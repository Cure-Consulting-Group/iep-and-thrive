# TASK-LP-014 — Define the canonical account, learner, enrollment, and program data contract

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P1 / G1: internal prototype |
| Status | Proposed — review required |
| Proposed owner | Data architect + backend + client leads |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F10](../../audits/2026-09-05/product-direction/findings.md#f10), [F20](../../audits/2026-09-05/product-direction/findings.md#f20), [F33](../../audits/2026-09-05/product-direction/findings.md#f33), [F35](../../audits/2026-09-05/product-direction/findings.md#f35), [F43](../../audits/2026-09-05/product-direction/findings.md#f43) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md) |

## Problem and intended outcome

The platform mixes Auth UIDs, random payment-created user IDs, native UUIDs, default student IDs, flat student references, and multiple enrollment fields. A stable model is needed before product and service data expand.

## Implementation scope

1. Produce RFC-LP-001 and versioned schemas for adult account, household/learner identity, practitioner grant, tutoring enrollment, program/cohort, content assignment, and digital entitlement.
2. Separate service-specific intake/medical/emergency fields from minimal digital learner preferences. Preserve globally unique or fully qualified learner references across all flat collections.
3. Define canonical timestamps, server ownership, client edit allowlists, schema versions, optional values, and handling of malformed/legacy records for Swift and TypeScript.
4. Specify account claiming for historical email-only payments without using unverified email matching as proof; identify legacy users needing manual reconciliation.

## Acceptance criteria

- **Given** a learner exists on web and iOS, **when** its records are decoded, **then** both clients resolve the same stable identity without overwriting trusted path fields.

- **Given** a legacy record cannot be attributed safely, **when** migration evaluates it, **then** it is quarantined for review rather than assigned heuristically.

## Validation and evidence

Schema fixtures covering web/native/payment-created accounts, same-email conflicts, two children, duplicate default IDs, deleted learners, null fields, and future schema versions.

## Rollout, migration, and recovery

Approve the RFC before schema migration. Keep compatibility adapters explicit and time-limited; no automatic cross-account merge based only on matching names or email strings.

## Source evidence

- [lib/student-service.ts:20](../../../lib/student-service.ts#L20)
- [ios/IEPAndThrive/Core/Data/FirestoreDTOs.swift:32](../../../ios/IEPAndThrive/Core/Data/FirestoreDTOs.swift#L32)
- [functions/src/stripe-webhook.ts:302](../../../functions/src/stripe-webhook.ts#L302)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
