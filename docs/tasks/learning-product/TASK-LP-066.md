# TASK-LP-066 — Replace hardcoded seasonal schedules with versioned program configuration

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-09](../../audits/2026-09-05/product-direction/epics.md#epic-lp-09) |
| Priority / release gate | P1 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + web + operations |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F21](../../audits/2026-09-05/product-direction/findings.md#f21), [F33](../../audits/2026-09-05/product-direction/findings.md#f33), [F37](../../audits/2026-09-05/product-direction/findings.md#f37) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-063](TASK-LP-063.md) |

## Problem and intended outcome

Program dates, group sizes, deadlines, weekly calculations, and lifecycle jobs reflect a single Summer 2026 cohort with conflicting calendar assumptions. Ongoing tutoring and digital learning should not inherit these constants.

## Implementation scope

1. Define versioned program/cohort schedules with timezone, attendance days, enrollment state, communication windows, pricing references, and active/archived status.
2. Reconcile canonical dates/group size/contact details with approved operations facts; separate the perpetual reading product from seasonal service messaging.
3. Update calendar/progress/digest calculations and scheduled jobs to use the same configuration and exclude archived cohorts.
4. Add operator previews and safe activation of a future cohort without code-wide search-and-replace.

## Acceptance criteria

- **Given** a cohort ends, **when** scheduled jobs run, **then** obsolete enrollment urgency and program ramp messages are not sent.

- **Given** a new cohort has different attendance days, **when** progress is calculated, **then** expected attendance and week labels use that cohort’s approved calendar.

## Validation and evidence

Date/DST tests across start/end boundaries, archived/future cohorts, differing schedules, and web/email consistency snapshots.

## Rollout, migration, and recovery

Freeze old configurations for historical reports; never recalculate past evidence using a new calendar.

## Source evidence

- [lib/dates.ts:1](../../../lib/dates.ts#L1)
- [lib/portal-progress.ts:81](../../../lib/portal-progress.ts#L81)
- [functions/src/pre-program-ramp.ts:1](../../../functions/src/pre-program-ramp.ts#L1)
- [curriculum/scope-and-sequence.md:16](../../../curriculum/scope-and-sequence.md#L16)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
