# TASK-MVP-009 — Correct tracer scale normalization

| Field | Value |
| --- | --- |
| Epic | EPIC-M2 — A truthful app |
| Priority / release gate | P1 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS learning-engine engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | None |
| Design | design-studio — tracing surface scale QA, 1 screen |

## Problem and intended outcome

The tracer constructs CoreText geometry and centers it, but the scale transform is not explicit for
all canvas sizes. The same trace should evaluate consistently on supported phone sizes and
orientation changes rather than silently changing the target geometry.

## Implementation scope

1. Define a pure normalization transform from glyph bounds to the measured canvas, preserving aspect
   ratio and applying the configured inset/tolerance once.
2. Apply the transform consistently to path, anchors, and hit testing; avoid a second scale in the
   SwiftUI wrapper.
3. Add geometry fixtures for portrait, compact, large, and non-square canvases and retain the design
   QA handoff as visual evidence only.

## Acceptance criteria

- **Given** the same normalized trace on two supported canvas sizes, **when** it is evaluated,
  **then** accuracy, coverage, and pass/fail are equal within the documented tolerance.
- **Given** a canvas changes size during layout, **when** the tracer is rebuilt, **then** anchors
  and the inflated path share the same transform and no stale geometry is used.
- **Given** a point outside the normalized glyph bounds, **when** hit testing runs, **then** it is
  not accepted merely because the canvas scale changed.

## Validation and evidence

Run LetterTracer unit tests with generated fixtures and the iOS UI trace flow on the supported
device-size matrix. Attach geometry metrics and design QA screenshots.

## Rollout, migration, and recovery

No persisted-data change. If a device-specific failure appears, fall back to the prior thresholds
for that build only while preserving the failing fixture for correction.

## Source evidence

- [LetterTracer.swift](../../../ios/IEPAndThrive/Features/Literacy/LetterTracer.swift)
- [SandTrayView.swift](../../../ios/IEPAndThrive/Features/Literacy/SandTrayView.swift)

## Definition of done

Code review is approved; new geometry code has at least 80% coverage; coordinates and sizes are
validated; no secrets are hardcoded; and design QA confirms the transform does not alter the
approved interaction states.
