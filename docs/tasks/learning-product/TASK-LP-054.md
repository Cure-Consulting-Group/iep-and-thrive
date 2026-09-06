# TASK-LP-054 — Isolate local, staging, and production configuration and data

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Infrastructure + client leads |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F23](../../audits/2026-09-05/product-direction/findings.md#f23) |
| Dependencies | None; may start after backlog review |

## Problem and intended outcome

Firebase defaults, web function URLs, native plist, and E2E target point to one production project. Local function selection only recognizes localhost and does not connect web Auth/Firestore/Storage to emulators.

## Implementation scope

1. Define explicit environment manifests for web, Functions, iOS, test runners, Storage buckets, domains, OAuth clients, Stripe mode, and email/calendar sandbox recipients.
2. Connect all local Firebase clients to loopback emulators consistently; reject mixed production/emulator combinations and unsupported hosts such as 127.0.0.1 falling through to production.
3. Provision/document staging project configuration and synthetic seed data with least-privilege identities; add startup/build target validation.
4. Keep private credentials out of artifacts and distinguish public Firebase config from actual secrets.

## Acceptance criteria

- **Given** local or CI tests run, **when** clients initialize, **then** every data/side-effect service resolves to the selected synthetic environment.

- **Given** a build combines production Auth with staging Functions, **when** configuration is validated, **then** the build or startup fails with a safe diagnostic.

## Validation and evidence

Configuration matrix tests and blocked-external-network browser/native probes; inspect generated builds for intended public project IDs without exposing secrets.

## Rollout, migration, and recovery

Introduce staging without migrating production records. Production configuration remains explicit and release-locked; no default production fallback for test commands.

## Source evidence

- [lib/functions-config.ts:11](../../../lib/functions-config.ts#L11)
- [lib/firebase.ts:3](../../../lib/firebase.ts#L3)
- [.firebaserc:3](../../../.firebaserc#L3)
- [ios/IEPAndThrive/Resources/GoogleService-Info.plist:17](../../../ios/IEPAndThrive/Resources/GoogleService-Info.plist#L17)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
