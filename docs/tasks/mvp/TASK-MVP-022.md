# TASK-MVP-022 — Record the phoneme and grapheme audio set

| Field | Value |
| --- | --- |
| Epic | EPIC-M5 — Audio production |
| Priority / release gate | P0 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Audio producer + educator |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-011 |
| Design | None |

## Problem and intended outcome

The current synthesizer speaks letter names instead of phonemes. Record roughly 44 phoneme and
grapheme sounds in one consistent voice and room so decoding instruction is accurate and bundled.

## Implementation scope

1. Freeze the audio ID inventory from the schema and educator-approved skill taxonomy.
2. Record, edit, normalize, and export each required phoneme/grapheme asset in the agreed bundled
   format; keep one voice, room, microphone chain, and pronunciation standard.
3. Produce a manifest with duration, format, checksum, speaker/room session, and review status.

## Acceptance criteria

- **Given** the approved phoneme inventory, **when** the manifest is compared with it, **then** all
  roughly 44 required IDs have exactly one reviewed asset and no unexpected asset is referenced.
- **Given** two assets from the set, **when** loudness, sample format, and room consistency are
  checked, **then** they meet the documented production tolerances.
- **Given** an educator reviews each pronunciation, **when** an error is found, **then** the asset
  remains rejected in the manifest until replaced and rechecked.

## Validation and evidence

Run manifest checksum and audio-format checks; perform educator pronunciation review; attach the
recording log, production settings, and rejected-asset log.

## Rollout, migration, and recovery

Keep source masters and the last accepted bundle. If a production session is inconsistent, reject
that session and re-record affected IDs; never silently substitute synthesis.

## Source evidence

- [SpeechClient.swift](../../../ios/IEPAndThrive/Core/Audio/SpeechClient.swift)
- [ADR-000 D2](../../architecture/ADR-000-mvp-architecture-decisions.md#d2--phoneme-audio-is-recorded-never-synthesized)

## Definition of done

Educator approval, consistent-room production log, complete manifest, checksums, and passing format
validation are present.
