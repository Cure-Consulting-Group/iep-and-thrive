# TASK-LP-057 — Triage dependency advisories and remove unnecessary runtime dependencies

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Security + web + backend |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F26](../../audits/2026-09-05/product-direction/findings.md#f26) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

The current production dependency scans flag 23 root packages and 22 Functions packages, including critical advisories. Counts are not proof that every advisory is reachable in the deployed application.

## Implementation scope

1. Create a per-advisory matrix with installed version, dependency path, vulnerable behavior, runtime/build exposure, remediation, and time-bounded exception rationale.
2. Separate static-export Next server-only issues from browser/build exposure and backend runtime dependencies; verify protobuf/websocket/grpc paths rather than forcing all updates.
3. Upgrade supported package families incrementally with lockfiles and meaningful integration checks; remove unused legacy server/email libraries from the root where safe.
4. Add automated advisory monitoring, dependency review, integrity/lockfile controls, and a documented response owner.

## Acceptance criteria

- **Given** an advisory is marked mitigated or not applicable, **when** review occurs, **then** the entry identifies the exact deployed behavior and evidence.

- **Given** a dependency update changes auth/payment/runtime behavior, **when** validation runs, **then** critical contracts remain correct before release.

## Validation and evidence

Fresh advisory reports, dependency trees, targeted reproductions where safe, web/Functions builds, security/integration suites, and a reviewer-approved residual-risk record.

## Rollout, migration, and recovery

No blind forced fix. Separate major framework migrations from urgent reachable patches and preserve tested rollback artifacts.

## Source evidence

- [package-lock.json:1](../../../package-lock.json#L1)
- [functions/package-lock.json:1](../../../functions/package-lock.json#L1)
- [package.json:32](../../../package.json#L32)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
