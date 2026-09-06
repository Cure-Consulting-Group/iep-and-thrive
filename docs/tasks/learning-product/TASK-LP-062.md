# TASK-LP-062 — Add server-enforced release flags and client/content compatibility

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Backend + iOS + web |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F24](../../audits/2026-09-05/product-direction/findings.md#f24), [F29](../../audits/2026-09-05/product-direction/findings.md#f29), [F33](../../audits/2026-09-05/product-direction/findings.md#f33) |
| Dependencies | [TASK-LP-025](TASK-LP-025.md), [TASK-LP-026](TASK-LP-026.md), [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

There is no demonstrated controlled rollout or kill-switch system for unsafe content, sync, or digital access. Native releases and curriculum updates need compatible staged behavior.

## Implementation scope

1. Define environment-scoped flags for internal demos, consented pilot access, published content versions, new sync, and commerce; enforce safety/access flags on the server.
2. Include minimum supported schema/client/content versions and a known-good fallback for offline clients.
3. Record flag changes, owner, expiry, and rollout population without targeting children with manipulative experiments.
4. Document kill/restore procedures for bad content and broken endpoints; flags must not bypass rules, consent, or entitlement checks.

## Acceptance criteria

- **Given** a quest is withdrawn or a client schema is unsupported, **when** the client requests it, **then** the server rejects unsafe access and the UI offers the defined safe fallback.

- **Given** a UI flag is manually changed, **when** the server checks access, **then** restricted pilot content remains protected.

## Validation and evidence

Flag tampering, offline stale-config, disabled content, schema mismatch, and rollback tests across native/web versions.

## Rollout, migration, and recovery

Start with a small explicit pilot allowlist. Remove expired flags after stable rollout and preserve audit history.

## Source evidence

- [ios/IEPAndThrive/Core/Data/CurriculumClient.swift:113](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift#L113)
- [functions/src/index.ts:1](../../../functions/src/index.ts#L1)
- [lib/functions-config.ts:1](../../../lib/functions-config.ts#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
