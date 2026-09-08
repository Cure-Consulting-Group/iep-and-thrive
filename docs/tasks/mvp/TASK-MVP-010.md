# TASK-MVP-010 — Raise the amber token to accessible contrast

| Field | Value |
| --- | --- |
| Epic | EPIC-M2 — A truthful app |
| Priority / release gate | P1 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS design-system engineer |
| Estimate | 3 points; planning estimate, not a delivery commitment |
| Dependencies | None |
| Design | design-studio — accessible warning-token audit, 1 token sheet |

## Problem and intended outcome

The current amber token measures about 2.91:1 against white, below the required contrast for text
and icons. Replace the token through the design-system contract and verify all warning usages.

## Implementation scope

1. Update the shared amber token to a value that reaches at least 4.5:1 for normal text against its
   approved background pair; preserve semantic token names so call sites do not fork colors.
2. Inventory warning, hint, and status usages and classify any large-text or non-text exceptions.
3. Add an automated contrast test for the token pairs and consume the design-studio audit without
   adding visual decisions to feature code.

## Acceptance criteria

- **Given** the approved amber token and each registered background pair, **when** the contrast test
  runs, **then** normal text pairs meet 4.5:1 or the documented WCAG exception is recorded.
- **Given** a feature requests a warning color, **when** the source is inspected, **then** it uses
  the shared semantic token rather than a new hardcoded color.
- **Given** the app renders existing warning and hint states, **when** accessibility inspection is
  performed, **then** text and icons remain distinguishable in light and dark system settings.

## Validation and evidence

Run token tests, static search for direct color literals, and an accessibility audit on warning
states. Attach the contrast calculation and design-studio sign-off.

## Rollout, migration, and recovery

No data migration. If a legacy screen becomes unreadable, revert only that token change, retain the
failing screenshot, and correct the shared pair before release.

## Source evidence

- [Theme.swift](../../../ios/IEPAndThrive/Core/DesignSystem/Theme.swift)
- [ADR-000 D9](../../architecture/ADR-000-mvp-architecture-decisions.md#d9--clean-architecture-boundaries-enforced-by-the-module-graph)

## Definition of done

Code review is approved; new code has at least 80% coverage; token inputs are validated; no secrets
are hardcoded; no feature hardcodes a replacement color; and contrast evidence is attached.
