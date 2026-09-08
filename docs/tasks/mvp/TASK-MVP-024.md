# TASK-MVP-024 — Record instruction and encouragement audio

| Field | Value |
| --- | --- |
| Epic | EPIC-M5 — Audio production |
| Priority / release gate | P1 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Audio producer + educator |
| Estimate | 3 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-022 |
| Design | None |

## Problem and intended outcome

Instruction and encouragement lines must be consistent with the child-led session and must not
force a remedial lecture after a miss. Record the small approved line set in the same production
conditions as phonemes and words.

## Implementation scope

1. Freeze line IDs and usage contexts from the session and pacing contracts.
2. Record concise instruction, feedback, encouragement, and transition assets with no unsupported
   claims about mastery or diagnosis.
3. Add the line IDs to the audio manifest and mark which lines may be skipped by the child.

## Acceptance criteria

- **Given** each approved line ID, **when** the manifest is checked, **then** exactly one normalized,
  reviewed bundled asset exists.
- **Given** a failure response, **when** the session requests feedback, **then** the available line
  does not force a remedial lecture and the skip contract remains honored.
- **Given** a line is missing, **when** CI validates the bundle, **then** the build fails with the
  line ID rather than synthesizing a substitute.

## Validation and evidence

Educator reviews wording and audio; asset checks verify format, duration, checksum, and skip flag.
Attach the line inventory and production log.

## Rollout, migration, and recovery

Keep source masters and the prior accepted line set. Reject incomplete candidates rather than
shipping a synthesized fallback.

## Source evidence

- [SpeechClient.swift](../../../ios/IEPAndThrive/Core/Audio/SpeechClient.swift)
- [ADR-000 D2](../../architecture/ADR-000-mvp-architecture-decisions.md#d2--phoneme-audio-is-recorded-never-synthesized)

## Definition of done

The educator-approved line set is complete, bundled, checksummed, skip-labeled, and validator-covered.
