# TASK-MVP-011 — Define the versioned curriculum JSON schema

| Field | Value |
| --- | --- |
| Epic | EPIC-M3 — Content platform |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | Content platform engineer + educator |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001 |
| Design | None |

## Problem and intended outcome

Level definitions are Swift struct literals, so a missing engine can ship as if it were content. A
versioned JSON contract must make engine, skill, sequence, practice items, and audio references
explicit and authorable without changing Swift source.

## Implementation scope

1. Define a checked-in JSON Schema with corpus version, stable level ID, skill IDs, sequence order,
   engine ID, grapheme/word items, audio IDs, and supported metadata.
2. Define enums and constraints for only the MVP engines and skill taxonomy; reject unknown engines,
   duplicate IDs, empty items, invalid ordering, and missing required audio references.
3. Define the Swift decoding DTO in Data and a migration note from the current `LevelDefinition`
   shape; keep Domain free of JSON and Composable Architecture imports.

## Acceptance criteria

- **Given** a valid level with a registered engine, skills, items, and audio IDs, **when** it is
  decoded, **then** it produces a stable DTO without lossy field conversion.
- **Given** a level omits its engine, uses an unknown engine, duplicates an ID, or has no skill,
  **when** schema validation runs, **then** it fails with a field-specific error.
- **Given** a content author adds a new supported engine, **when** the schema contract is reviewed,
  **then** the engine ID, runtime adapter, and test fixture are all named before use.

## Validation and evidence

Validate representative valid and invalid JSON fixtures, decode them in unit tests, and run the
module-graph check. Attach the schema version and educator review of field meaning.

## Rollout, migration, and recovery

Add the schema and DTO before removing Swift literals. Keep the old loader available only during
015's migration and remove it after corpus equivalence is proven.

## Source evidence

- [CurriculumClient.swift](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift)
- [ADR-000 D3](../../architecture/ADR-000-mvp-architecture-decisions.md#d3--content-is-data-validated-in-ci-never-code)

## Definition of done

Code review is approved; new code has at least 80% coverage; all decoded inputs are validated; no
secrets are hardcoded; the schema is versioned and documented; and Domain has no data-layer import.
