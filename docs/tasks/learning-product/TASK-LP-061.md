# TASK-LP-061 — Bound query, storage, compute, and client performance costs

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Infrastructure + backend + clients |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F29](../../audits/2026-09-05/product-direction/findings.md#f29) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-054](TASK-LP-054.md), [TASK-LP-060](TASK-LP-060.md) |

## Problem and intended outcome

Admin roster and scheduled jobs scan users and subcollections, portal summaries load complete histories, and no explicit application capacity/budget controls were found. Lower school overhead does not make software operations cost-free.

## Implementation scope

1. Measure representative synthetic workloads for family history, practitioner roster, daily jobs, uploads, native drawing, content startup, and web navigation.
2. Add pagination/cursors, bounded batch sizes/concurrency, incremental summaries, indexed queries, and server limits where measurement identifies growth risks.
3. Set cloud budget alerts, storage/log retention, function instance/time limits, and forecast costs at explicit user/attempt/media assumptions. Budget alerts are notifications, not hard spending caps.
4. Define client performance budgets for supported devices, memory, startup, offline content size, and accessibility modes; prioritize measured bottlenecks over speculative rearchitecture.

## Acceptance criteria

- **Given** a learner has a long history or a practitioner has many learners, **when** a summary loads, **then** reads and response size remain bounded.

- **Given** usage exceeds a reviewed threshold, **when** controls trigger, **then** the system degrades safely and alerts an owner without losing accepted attempts.

## Validation and evidence

Synthetic load report with data sizes, p50/p95, read/write counts and estimated costs; old-device memory/scroll/drawing profiling and web bundle checks.

## Rollout, migration, and recovery

Introduce compatible aggregations alongside raw events and reconcile counts before switching reads. Avoid untested hard caps that prevent deletion or support access.

## Source evidence

- [lib/student-service.ts:47](../../../lib/student-service.ts#L47)
- [lib/ios-progress.ts:99](../../../lib/ios-progress.ts#L99)
- [functions/src/weekly-digest.ts:137](../../../functions/src/weekly-digest.ts#L137)
- [ios/IEPAndThrive/Features/Literacy/LetterTracer.swift:1](../../../ios/IEPAndThrive/Features/Literacy/LetterTracer.swift#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
