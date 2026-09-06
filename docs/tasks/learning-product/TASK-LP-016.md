# TASK-LP-016 — Build an accessible adult gate and parent control center

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS + product design |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F06](../../audits/2026-09-05/product-direction/findings.md#f06), [F32](../../audits/2026-09-05/product-direction/findings.md#f32) |
| Dependencies | [TASK-LP-015](TASK-LP-015.md) |

## Problem and intended outcome

Settings and purchases are reachable from the child journey without the parent gate promised in the native PRD. A parental gate and data consent are separate controls.

## Implementation scope

1. Create a reusable adult-area gate with accessible fallback and re-entry/timeout rules; avoid relying on a math question that overlaps the child’s curriculum.
2. Route purchases, external links, identity switching, consent, export/deletion, and support settings through the adult area.
3. Show meaningful account/child identity instead of a truncated UID as the primary parent-facing label.
4. Remove automatic child-facing paywall presentation and define how the adult learns about access limits without pressure on the child.

## Acceptance criteria

- **Given** a child is in a learning activity, **when** settings or commerce is requested, **then** the adult gate is required before protected controls appear.

- **Given** the gate expires or the app backgrounds, **when** a protected action is retried, **then** adult verification is required again according to the reviewed policy.

## Validation and evidence

UI tests for every protected entry point, accessibility manual checks, background/foreground and dismiss/reopen cases, plus purchase link-out review against Apple guidance.

## Rollout, migration, and recovery

Gate existing protected entry points first. Maintain a safe exit and free permitted activity when commercial access is unavailable.

## Source evidence

- [ios/IEPAndThrive/Features/Root/RootFeature.swift:238](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L238)
- [ios/IEPAndThrive/Features/Settings/SettingsFeature.swift:17](../../../ios/IEPAndThrive/Features/Settings/SettingsFeature.swift#L17)
- [docs/ios-pivot/PRD.md:33](../../../docs/ios-pivot/PRD.md#L33)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
