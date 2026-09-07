# TASK-MVP-023 — Record the example-word audio set

| Field | Value |
| --- | --- |
| Epic | EPIC-M5 — Audio production |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Audio producer + educator |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-022 |
| Design | None |

## Problem and intended outcome

Blending and word-building levels need spoken examples that match the written item. Produce roughly
120 bundled word assets with the same voice and room as the phoneme set.

## Implementation scope

1. Freeze the word inventory from the reviewed M4 corpus and engine fixtures, with stable audio IDs.
2. Record, edit, normalize, and export each word; reject pronunciations that do not match the
   educator's phoneme mapping or the authored word.
3. Extend the manifest and validator fixtures so a corpus reference cannot point to a missing word.

## Acceptance criteria

- **Given** the reviewed word inventory, **when** it is compared with the manifest, **then** every
  roughly 120 required word IDs has exactly one approved asset.
- **Given** a word has an incorrect sound or stress, **when** educator review rejects it, **then**
  the validator treats the ID as unavailable until a replacement is approved.
- **Given** an engine requests a word by ID, **when** the bundle loader resolves it, **then** it
  returns the recorded asset and never falls back to synthesized speech.

## Validation and evidence

Run asset existence, format, checksum, and manifest tests; attach educator pronunciation review and
the final inventory count.

## Rollout, migration, and recovery

Keep masters and prior accepted assets. Remove only rejected bundle outputs from the release
candidate; retain the ID contract for replacement.

## Source evidence

- [SpeechClient.swift](../../../ios/IEPAndThrive/Core/Audio/SpeechClient.swift)
- [ADR-000 D2](../../architecture/ADR-000-mvp-architecture-decisions.md#d2--phoneme-audio-is-recorded-never-synthesized)

## Definition of done

The educator-approved word manifest is complete, assets are consistent and checksummed, and the
validator rejects missing or rejected references.
