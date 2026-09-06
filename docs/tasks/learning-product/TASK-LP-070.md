# TASK-LP-070 — Complete native accessibility, sensory controls, and audio lifecycle

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-10](../../audits/2026-09-05/product-direction/epics.md#epic-lp-10) |
| Priority / release gate | P0 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS + accessibility specialist + educator |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F30](../../audits/2026-09-05/product-direction/findings.md#f30) |
| Dependencies | [TASK-LP-016](TASK-LP-016.md), [TASK-LP-028](TASK-LP-028.md) |

## Problem and intended outcome

Tracing/cube interactions do not establish equivalent assistive access, many fonts are fixed size, speech uses a short-lived synthesizer, and ambient_forest.mp3 is referenced but absent from the inventoried assets.

## Implementation scope

1. Provide task-equivalent accessible controls or alternatives for gesture-only activities without changing the assessed skill unnoticed; distinguish motor practice from reading evidence.
2. Implement Dynamic Type/scaled typography, VoiceOver focus/labels, Switch Control and external keyboard paths, reduced motion, contrast, and persistent sensory preferences.
3. Keep a durable speech/audio controller with completion/cancellation, interruptions, background/foreground, volume/mute, and missing-asset feedback; verify actual bundled audio rights/assets.
4. Ensure safe-space exit and navigation cleanup stop audio and offer a predictable return to learning without coercive reward loss.

## Acceptance criteria

- **Given** a learner cannot drag or trace, **when** the task is opened, **then** an approved accessible alternative is available or the unsupported task is clearly excluded.

- **Given** speech is interrupted or the audio file is missing, **when** playback is requested, **then** the app recovers predictably and does not imply that sound played.

## Validation and evidence

Real-device task tests with VoiceOver, large accessibility text, reduced motion, switch/keyboard input, Bluetooth audio, silent mode, and background interruptions; record supported-device limitations.

## Rollout, migration, and recovery

Block pilot tasks lacking needed access. Do not claim equivalent instructional validity merely because an alternative button exists; educator reviews the accommodation.

## Source evidence

- [ios/IEPAndThrive/Core/Audio/SpeechClient.swift:16](../../../ios/IEPAndThrive/Core/Audio/SpeechClient.swift#L16)
- [ios/IEPAndThrive/Features/SafeSpace/SafeSpaceFeature.swift:29](../../../ios/IEPAndThrive/Features/SafeSpace/SafeSpaceFeature.swift#L29)
- [ios/IEPAndThrive/Features/Literacy/SandTrayView.swift:63](../../../ios/IEPAndThrive/Features/Literacy/SandTrayView.swift#L63)
- [ios/IEPAndThrive/Core/DesignSystem/Theme.swift:1](../../../ios/IEPAndThrive/Core/DesignSystem/Theme.swift#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
