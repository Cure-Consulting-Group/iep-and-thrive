# TASK-LP-065 — Define privacy-preserving product metrics and pilot dashboards

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-09](../../audits/2026-09-05/product-direction/epics.md#epic-lp-09) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Product analytics + backend + privacy |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F03](../../audits/2026-09-05/product-direction/findings.md#f03), [F29](../../audits/2026-09-05/product-direction/findings.md#f29), [F40](../../audits/2026-09-05/product-direction/findings.md#f40) |
| Dependencies | [TASK-LP-003](TASK-LP-003.md), [TASK-LP-025](TASK-LP-025.md), [TASK-LP-064](TASK-LP-064.md) |

## Problem and intended outcome

Current analytics emphasize enrollment and checkout clicks; native rewards do not measure learning or retention reliably. The standalone business needs metrics with clear denominators and provenance.

## Implementation scope

1. Define activation as a meaningful completed setup/practice/evidence-view sequence; track eligible cohorts, attempts, help, independent checks, return use, and adult engagement separately.
2. Track support burden and external paid conversion by offer without child PII in marketing tools; distinguish initiated checkout from settled payment.
3. Document event names/version, consent scope, deduplication, offline timestamps, retention, access, and deletion propagation.
4. Build descriptive pilot dashboards with small-sample suppression, missing-data reporting, and explicit separation of usage from learning effectiveness.

## Acceptance criteria

- **Given** an offline attempt is replayed twice, **when** metrics aggregate, **then** it contributes once to the appropriate eligible denominator.

- **Given** only activity completion improves, **when** the dashboard is reviewed, **then** it does not label that change as reading mastery or causal efficacy.

## Validation and evidence

Event-contract tests, synthetic cohort fixtures, double-submit/replay, withdrawal/deletion, and independent reconciliation of dashboard counts to source events.

## Rollout, migration, and recovery

No raw child responses in general-purpose analytics. Start with minimal necessary events and remove unused collection.

## Source evidence

- [lib/analytics.ts:29](../../../lib/analytics.ts#L29)
- [ios/IEPAndThrive/Features/Journey/JourneyFeature.swift:7](../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift#L7)
- [docs/ios-pivot/PRD.md:52](../../../docs/ios-pivot/PRD.md#L52)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
