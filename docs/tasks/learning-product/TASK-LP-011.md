# TASK-LP-011 — Remove production test-account credential defaults and isolate test access

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-02](../../audits/2026-09-05/product-direction/epics.md#epic-lp-02) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Security + QA + operations |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F23](../../audits/2026-09-05/product-direction/findings.md#f23), [F38](../../audits/2026-09-05/product-direction/findings.md#f38) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

Test fixtures contain predictable fallback credentials, including an admin persona, while the default E2E target is production. The repository does not establish whether those credentials remain valid.

## Implementation scope

1. Inventory seeded accounts and privileged test identities through authorized administrative metadata; rotate or disable production fixtures that use documented defaults.
2. Require environment-scoped secret injection and refuse destructive seed/reset operations without an explicit nonproduction target and synthetic-account guard.
3. Ensure test personas cannot receive real marketing, booking invitations, or payment fulfillment. Separate optional production read-only smoke access from staging test accounts.
4. Remove credential formulas from active fixtures/docs and audit access to old test secrets without including values in tickets or logs.

## Acceptance criteria

- **Given** a test runs without its required secret, **when** fixture initialization occurs, **then** it fails clearly instead of using a predictable password.

- **Given** a reset script targets production, **when** the guard runs, **then** it refuses ordinary test execution.

## Validation and evidence

Negative script target checks, secret absence tests, permission-limited account verification, and staging E2E login. Do not attempt logins using exposed defaults during the audit.

## Rollout, migration, and recovery

Rotate before removing defaults if accounts exist; preserve an authorized operational access path. Audit historic use only with approved access.

## Source evidence

- [tests/e2e/fixtures.ts:3](../../../tests/e2e/fixtures.ts#L3)
- [playwright.config.ts:3](../../../playwright.config.ts#L3)
- [scripts/seed-test-accounts.mjs:1](../../../scripts/seed-test-accounts.mjs#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
