# TASK-MVP-015 — Migrate Swift curriculum literals into the corpus

| Field | Value |
| --- | --- |
| Epic | EPIC-M3 — Content platform |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | Content platform engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-011, TASK-MVP-012, TASK-MVP-013, TASK-MVP-014 |
| Design | None |

## Problem and intended outcome

The current `CurriculumClient` contains the production corpus as Swift literals, which prevents
educator-led authoring and makes structural validation difficult. Migrate the existing supported
entries into bundled JSON without changing valid learner behavior.

## Implementation scope

1. Convert every current engine-backed level into the schema, assign reviewed skill IDs, and map
   audio IDs or explicit pending audio status rejected by CI.
2. Add a bundle loader in Data that validates before decoding and maps DTOs to Domain values; remove
   production literals after equivalence is proven.
3. Compare stable IDs, order, engine, target values, and completion behavior between old and new
   loaders; preserve local evidence by stable level and skill IDs.
4. Keep invalid phantom entries out of the migrated corpus and document any retired ID mapping.

## Acceptance criteria

- **Given** the pre-migration supported level inventory, **when** old and new loaders are compared,
  **then** every valid stable ID has equivalent sequence and engine behavior.
- **Given** a malformed bundled JSON file, **when** the app loads the corpus, **then** it fails to a
  safe testable state and never constructs a partial curriculum.
- **Given** local evidence references a migrated skill or level ID, **when** the new loader starts,
  **then** the evidence resolves without a destructive rewrite.

## Validation and evidence

Run the validator, loader tests, inventory diff, full iOS unit suite, and a local relaunch flow.
Attach the old/new inventory comparison and bundle checksum.

## Rollout, migration, and recovery

Keep the old loader behind a test-only comparison flag until the archive is validated. If the new
loader fails, retain the local data and restore the last known-good corpus bundle; do not restore
the phantom entries.

## Source evidence

- [CurriculumClient.swift](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift)
- [Models.swift](../../../ios/IEPAndThrive/Core/Data/Models.swift)

## Definition of done

Code review is approved; new loader code has at least 80% coverage; bundle inputs are validated; no
secrets are hardcoded; production literals are gone; and CI validates the corpus before archive.
