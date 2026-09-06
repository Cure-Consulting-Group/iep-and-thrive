# TASK-LP-074 — Complete essential assets and align the child/adult design system

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-10](../../audits/2026-09-05/product-direction/epics.md#epic-lp-10) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Product design + iOS + web |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F30](../../audits/2026-09-05/product-direction/findings.md#f30), [F44](../../audits/2026-09-05/product-direction/findings.md#f44) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md), [TASK-LP-002](TASK-LP-002.md), [TASK-LP-028](TASK-LP-028.md) |

## Problem and intended outcome

The brand and native scene foundation are reusable, but an AppIcon image is missing and some story/biome assets are placeholders. Visual expansion should serve the reading task rather than drive the roadmap.

## Implementation scope

1. Inventory actual shipped art/fonts/audio/icon assets, rights, dimensions, bundle inclusion, and supported appearance/device variants.
2. Prioritize a valid app icon, legible reading typography, clear response/help states, and consistent semantic colors/spacing before new biomes or virtual-economy decoration.
3. Define child and adult component tokens with accessibility states, reduced motion, long text, and empty/error/loading behavior.
4. Document asset fallback and review screens at supported sizes; remove unimplemented customization promises.

## Acceptance criteria

- **Given** the app is archived for distribution, **when** assets are validated, **then** required icons and referenced learning assets are present and licensed.

- **Given** large text or a missing decorative asset is used, **when** the quest renders, **then** content and controls remain legible and functional.

## Validation and evidence

Asset manifest validation, visual review on smallest supported iPhone and iPad sizes, light/dark appearance policy, accessibility text, and fallback snapshots.

## Rollout, migration, and recovery

Keep new decorative worlds/economy out of the pilot critical path. Asset changes should be independently reversible without changing learning-record meaning.

## Source evidence

- [ios/IEPAndThrive/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json:1](../../../ios/IEPAndThrive/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json#L1)
- [ios/IEPAndThrive/Features/SafeSpace/SafeSpaceView.swift:96](../../../ios/IEPAndThrive/Features/SafeSpace/SafeSpaceView.swift#L96)
- [ios/IEPAndThrive/Core/DesignSystem/Theme.swift:1](../../../ios/IEPAndThrive/Core/DesignSystem/Theme.swift#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
