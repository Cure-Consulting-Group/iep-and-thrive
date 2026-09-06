# TASK-LP-075 — Complete adult authentication recovery and account continuity

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Web + iOS + backend |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F05](../../audits/2026-09-05/product-direction/findings.md#f05), [F42](../../audits/2026-09-05/product-direction/findings.md#f42) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

Auth supports several sign-in methods but lacks a complete recovery/verification/linking experience. Web signup updates displayName after Auth creation, while an asynchronous profile initializer may already have persisted a blank name.

## Implementation scope

1. Implement password reset, appropriate email verification/recent-auth requirements, provider-link conflict handling, and useful signed-in account identity without exposing internals.
2. Make profile initialization idempotent and avoid signup display-name races; reconcile existing profiles without trusting stored role/UID values.
3. Preserve safe in-product continuation through login/signup and handle expired tokens, account disablement/deletion, and profile-read failure.
4. Add cancellation/generation guards for in-flight native auth actions and distinguish account linking from child selection or anonymous-data transfer.

## Acceptance criteria

- **Given** a user signs up with a display name, **when** initialization races with Auth callbacks, **then** the correct verified account profile is eventually saved once.

- **Given** a user returns from recovery or provider sign-in, **when** the continuation is evaluated, **then** they reach the intended authorized page or a clear recoverable state.

## Validation and evidence

Auth emulator and mocked-provider tests for password reset, expired/disabled users, duplicate initialization, claim changes, token failure, linked-provider conflicts, and safe return paths.

## Rollout, migration, and recovery

Preserve existing login methods and accounts; do not merge by unverified email. Provider configuration and real-device OAuth require a separate environment verification.

## Source evidence

- [lib/auth-context.tsx:43](../../../lib/auth-context.tsx#L43)
- [lib/auth-context.tsx:12](../../../lib/auth-context.tsx#L12)
- [ios/IEPAndThrive/Features/Auth/AuthFeature.swift:1](../../../ios/IEPAndThrive/Features/Auth/AuthFeature.swift#L1)
- [app/login/page.tsx:16](../../../app/login/page.tsx#L16)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
