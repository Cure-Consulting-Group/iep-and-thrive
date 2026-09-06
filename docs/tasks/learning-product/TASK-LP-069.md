# TASK-LP-069 — Move browser E2E to staging and verify actual user outcomes

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-10](../../audits/2026-09-05/product-direction/epics.md#epic-lp-10) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | QA + web + infrastructure |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F18](../../audits/2026-09-05/product-direction/findings.md#f18), [F24](../../audits/2026-09-05/product-direction/findings.md#f24), [F38](../../audits/2026-09-05/product-direction/findings.md#f38) |
| Dependencies | [TASK-LP-011](TASK-LP-011.md), [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

The browser suite defaults to the production hostname and several checks cover rendered copy or hrefs rather than successful authorized completion. Time-sensitive marketing expectations already fail after the deadline.

## Implementation scope

1. Run mutable E2E against the candidate build with synthetic emulator/staging fixtures and blocked external side effects.
2. Cover signup/login continuation, learner selection, intake failure/retry, authorized document access, purchase request/redirect, booking/cancel, parent evidence, and staff pipeline.
3. Control time for seasonal copy tests and separately test pre/post-deadline behavior; make auth/profile/claim state deterministic.
4. Keep production smoke read-only, opt-in, and distinct from release-gating staging tests; sanitize traces, screenshots, and videos.

## Acceptance criteria

- **Given** a pricing CTA points to a JSON/401 endpoint, **when** the user journey test runs, **then** it fails because Checkout was not reached.

- **Given** a test starts without an explicit safe target, **when** configuration validates, **then** mutable tests cannot fall back to production.

## Validation and evidence

Playwright report across desktop/mobile and targeted Safari/WebKit checks; verify tests fail for known broken behavior and pass only after repairs.

## Rollout, migration, and recovery

Retain the original failed marketing evidence as baseline. Replacing brittle tests must not hide functional regressions.

## Source evidence

- [playwright.config.ts:3](../../../playwright.config.ts#L3)
- [.github/workflows/e2e.yml:21](../../../.github/workflows/e2e.yml#L21)
- [tests/e2e/tutoring.spec.ts:1](../../../tests/e2e/tutoring.spec.ts#L1)
- [tests/e2e/marketing.spec.ts:1](../../../tests/e2e/marketing.spec.ts#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
