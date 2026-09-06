# TASK-LP-058 — Inventory deployed IAM, secrets, regions, and service configuration

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Infrastructure + security |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F27](../../audits/2026-09-05/product-direction/findings.md#f27) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

Repository configuration references Gmail OAuth, calendar service credentials, preview tokens, Stripe secrets, and mixed documented regions. The audit did not inspect deployed IAM or secrets and cannot establish their protection.

## Implementation scope

1. Produce a secret/config inventory by consuming function and environment: binding mechanism, owner, rotation, permissions, availability, and validation without recording values.
2. Review runtime/deploy service accounts, administrator claims, default service-account roles, public invocation, preview endpoints, and least-privilege access.
3. Verify actual Firestore/Storage/Functions/Scheduler regions, billing project, OAuth origins, domain ownership, App Check configuration, and audit-log settings.
4. Replace long-lived credentials with managed short-lived identities where appropriate; bind required secrets explicitly and add sanitized health checks. Verify effective Hosting security headers and deploy a tested CSP/frame/referrer policy compatible with Firebase authentication and payments.

## Acceptance criteria

- **Given** a function requires a secret, **when** a staging deployment runs, **then** the binding exists and missing configuration produces a monitored failure.

- **Given** a service account is reviewed, **when** its role list is evaluated, **then** only required operations are permitted or an exception is recorded.

## Validation and evidence

Read-only exported configuration metadata, role-diff review, staging missing-secret tests, and a rotation rehearsal. No credential values in documentation or test artifacts.

## Rollout, migration, and recovery

Use staged credential rotation with overlap and rollback; production IAM changes require a reviewed access-preservation plan.

## Source evidence

- [functions/src/email-service.ts:66](../../../functions/src/email-service.ts#L66)
- [functions/src/calendar-sync.ts:14](../../../functions/src/calendar-sync.ts#L14)
- [functions/src/preview-email.ts:19](../../../functions/src/preview-email.ts#L19)
- [scripts/setup-firestore-backups.sh:59](../../../scripts/setup-firestore-backups.sh#L59)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
