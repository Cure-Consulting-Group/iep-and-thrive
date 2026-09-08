# TASK-MVP-012 — Build the curriculum validator

| Field | Value |
| --- | --- |
| Epic | EPIC-M3 — Content platform |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | Content platform engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-011 |
| Design | None |

## Problem and intended outcome

Schema validation alone cannot detect a level that points to an unavailable engine, unreachable
sequence position, missing audio, or a word the phoneme map cannot pronounce. The validator must
make those shipping failures deterministic and readable to an educator.

## Implementation scope

1. Implement a command-line validator that loads schema, taxonomy, engine registry, corpus, and
   audio manifest as explicit inputs.
2. Check unique IDs, contiguous or explicitly linked sequence reachability, skill references,
   supported engine IDs, item limits, pronounceable grapheme/word mappings, and audio existence.
3. Emit stable file-and-field diagnostics with nonzero exit status; never silently drop entries or
   auto-correct authored content.
4. Add fixtures for every failure class and one full-corpus validation fixture.

## Acceptance criteria

- **Given** a corpus with an unknown engine, missing audio ID, or unpronounceable item, **when** the
  validator runs, **then** it exits nonzero and names the offending level and field.
- **Given** a corpus with a valid branching or sequential path, **when** reachability validation
  runs, **then** every intended MVP level is reachable from the first item exactly once by its
  declared sequence rule.
- **Given** identical inputs, **when** validation runs twice, **then** diagnostics and exit status
  are deterministic.

## Validation and evidence

Run unit tests for each rule and an integration test against the complete corpus and audio manifest.
Capture the successful report and representative failure output in CI artifacts.

## Rollout, migration, and recovery

The validator is additive until 013 turns it into a gate. If a rule rejects existing content,
quarantine the fixture and repair the content; do not weaken the rule without educator and platform
review.

## Source evidence

- [ADR-000 D3](../../architecture/ADR-000-mvp-architecture-decisions.md#d3--content-is-data-validated-in-ci-never-code)
- [CurriculumClient.swift](../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift)

## Definition of done

Code review is approved; new validator code has at least 80% coverage; all file inputs are bounded
and validated; no secrets are hardcoded; diagnostics are stable; and the full fixture passes.
