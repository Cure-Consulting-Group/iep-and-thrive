# TASK-MVP-025 — Replace synthesis with a retained audio player

| Field | Value |
| --- | --- |
| Epic | EPIC-M5 — Audio production |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS audio engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-011, TASK-MVP-022, TASK-MVP-023, TASK-MVP-024 |
| Design | None |

## Problem and intended outcome

`SpeechClient` creates an `AVSpeechSynthesizer` for each call, speaks letter names, has no retained
playback state, and has no real stop operation. Replace it with a bundled-asset player that can be
interrupted and reports completion deterministically.

## Implementation scope

1. Define a dependency interface for `play(assetID:)`, `stop()`, and completion/failure callbacks;
   resolve IDs through the validated bundle manifest.
2. Retain one audio engine/player in the live Data implementation, stop the prior item before a new
   item, and release playback resources on session exit.
3. Keep Domain unaware of AVFoundation and provide deterministic test values for reducers and engine
   tests; synthesis must not be used on the instructional path.

## Acceptance criteria

- **Given** an instructional asset ID, **when** playback starts, **then** the recorded bundled asset
  plays and no synthesizer is constructed.
- **Given** an active asset, **when** `stop()` is called, **then** playback stops within the tested
  bound, completion is resolved once, and a new asset can start cleanly.
- **Given** an unknown or malformed asset ID, **when** playback is requested, **then** it fails
  safely with a validated error and never constructs a synthesized substitute.

## Validation and evidence

Run audio-client unit tests, interruption tests, missing-asset tests, and a device/simulator lesson
flow. Search the instructional path for `AVSpeechSynthesizer` and attach the clean result.

## Rollout, migration, and recovery

Bundle audio alongside the loader migration. If playback fails in a release candidate, preserve the
prior local state and block release; do not re-enable synthesis.

## Source evidence

- [SpeechClient.swift](../../../ios/IEPAndThrive/Core/Audio/SpeechClient.swift)
- [AudioClient.swift](../../../ios/IEPAndThrive/Core/Audio/AudioClient.swift)
- [ADR-000 D2](../../architecture/ADR-000-mvp-architecture-decisions.md#d2--phoneme-audio-is-recorded-never-synthesized)

## Definition of done

Code review is approved; new audio code has at least 80% coverage; IDs and playback inputs are
validated; no secrets are hardcoded; Domain has no AVFoundation import; and stop/interruption
evidence is attached.
