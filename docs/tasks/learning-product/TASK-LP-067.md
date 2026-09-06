# TASK-LP-067 — Build real backend and rules integration coverage

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-10](../../audits/2026-09-05/product-direction/epics.md#epic-lp-10) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | QA + backend |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F38](../../audits/2026-09-05/product-direction/findings.md#f38) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

Functions currently have a build script but no test suite; existing web tests often mirror implementation shapes. Critical payment, booking, signature, and privacy contracts need executable failure-path coverage.

## Implementation scope

1. Introduce a test harness that imports actual handler/business modules, uses Firebase emulators for data/rules, and stubs external providers at transport boundaries.
2. Cover authorization/field matrices, transactions, duplicate/out-of-order webhooks, signature integrity, consent/deletion, and outbox retries with synthetic records.
3. Keep source schemas/business rules shared with tests rather than copying them into assertions; make error and boundary cases explicit.
4. Produce machine-readable results and CI gates; require deployed-index staging checks separately from emulator assertions.

## Acceptance criteria

- **Given** a handler silently converts a persistence failure into success, **when** its tests execute, **then** the regression is detected.

- **Given** a rule change permits an unauthorized write, **when** security tests run, **then** CI fails before release.

## Validation and evidence

Baseline test inventory, meaningful assertions against actual code, failure-injection coverage, and a deliberate regression demonstration. Do not claim coverage percentages without measurement.

## Rollout, migration, and recovery

Keep tests isolated from production, email, Stripe, and calendar. Add coverage alongside each repair, not as a final testing-only phase.

## Source evidence

- [functions/package.json:4](../../../functions/package.json#L4)
- [tests/security/family-access.test.cjs:1](../../../tests/security/family-access.test.cjs#L1)
- [tests/unit/ios-progress.test.mjs:17](../../../tests/unit/ios-progress.test.mjs#L17)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
