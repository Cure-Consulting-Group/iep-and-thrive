# TASK-LP-055 — Gate releases on verification and deploy every Firebase surface

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Infrastructure + QA |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F24](../../audits/2026-09-05/product-direction/findings.md#f24) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

Hosting deploy runs independently of E2E failures and does not deploy Functions, rules, or indexes. Build success is not a coordinated release of the application’s authorization and behavior.

## Implementation scope

1. Create a versioned CI release graph for web unit/type/build, Functions build/integration, security rules tests, staging E2E, and required native verification where affected.
2. Deploy indexes ahead of dependent queries, then compatible Functions/rules/Hosting changes in a documented order with exact revision hashes.
3. Add environment protection, concurrency control, least-privilege deploy identity, artifact promotion, and explicit rollback/roll-forward procedures.
4. Align CI Node runtime with the declared Functions runtime and retain cost-aware iOS gates without allowing release tags to bypass required validation.

## Acceptance criteria

- **Given** a security or critical-path test fails, **when** deployment is requested, **then** the affected release cannot proceed.

- **Given** a release changes rules and Functions, **when** deployment completes, **then** all required surfaces match the recorded reviewed revision.

## Validation and evidence

Workflow dry-run with intentional failing checks, staging full-surface deployment, stale-index scenario, rollback rehearsal, and branch/release protection review.

## Rollout, migration, and recovery

Existing production defects may use an independently reviewed emergency release path with equivalent evidence; routine deploys must converge on the gated workflow.

## Source evidence

- [.github/workflows/deploy.yml:48](../../../.github/workflows/deploy.yml#L48)
- [.github/workflows/e2e.yml:16](../../../.github/workflows/e2e.yml#L16)
- [firebase.json:6](../../../firebase.json#L6)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
