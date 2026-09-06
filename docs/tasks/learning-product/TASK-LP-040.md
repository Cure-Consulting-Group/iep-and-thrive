# TASK-LP-040 — Complete web accessibility remediation across adult and public workflows

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | Web + accessibility specialist |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F31](../../audits/2026-09-05/product-direction/findings.md#f31) |
| Dependencies | [TASK-LP-034](TASK-LP-034.md), [TASK-LP-035](TASK-LP-035.md), [TASK-LP-036](TASK-LP-036.md), [TASK-LP-037](TASK-LP-037.md) |

## Problem and intended outcome

Some labels and responsive checks exist, but the audit did not establish WCAG 2.2 AA conformance. Signature drawing, form errors, custom controls, data views, and authenticated navigation need task-level verification.

## Implementation scope

1. Audit keyboard and screen-reader paths for auth, learner setup, consent, intake, evidence, booking, signature, billing, and practitioner tasks.
2. Fix labels, focus management, status/error announcements, heading structure, contrast, zoom/reflow, target size, and non-drag alternatives.
3. Ensure accessible document/report output and chart/table alternatives; create a documented accessible signature option.
4. Use automated checks as support for manual task testing; publish an accurate accessibility statement and issue intake route.

## Acceptance criteria

- **Given** a user navigates without a mouse, **when** they complete each G2 adult task, **then** no action depends solely on drawing/dragging or inaccessible focus behavior.

- **Given** a form fails validation, **when** errors appear, **then** focus and announcements identify the fields and preserve input.

## Validation and evidence

WCAG criterion matrix with evidence from keyboard, VoiceOver/Safari and an additional desktop screen reader, 200/400% zoom, mobile reflow, and automated scans. Record remaining limitations explicitly.

## Rollout, migration, and recovery

Address blockers before pilot; retain task-equivalent accessible alternatives where native gesture UX remains.

## Source evidence

- [components/portal/SignatureCanvas.tsx:1](../../../components/portal/SignatureCanvas.tsx#L1)
- [components/booking/MonthCalendar.tsx:1](../../../components/booking/MonthCalendar.tsx#L1)
- [styles/globals.css:1](../../../styles/globals.css#L1)
- [app/program/page.tsx:1](../../../app/program/page.tsx#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
