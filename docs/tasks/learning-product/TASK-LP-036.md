# TASK-LP-036 — Make intake learner-specific, resumable, and truthful about saving

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Web + data |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F15](../../audits/2026-09-05/product-direction/findings.md#f15), [F39](../../audits/2026-09-05/product-direction/findings.md#f39) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md) |

## Problem and intended outcome

Intake selects the first student, logs the full form, does not restore the entered draft, and displays submitted even when persistence fails or no student exists. Families can believe sensitive information was received when it was not.

## Implementation scope

1. Require an explicit authorized learner selection and reset scoped form state on account/learner change.
2. Persist bounded drafts and reload actual fields with conflict handling; separate in-progress, saving, saved, failed, and submitted states.
3. Mark submitted only after durable acknowledgment; preserve entered data for retry and handle no-student setup without silent success.
4. Remove full-payload console logging and restrict service intake to customers who need it; digital setup should use the minimal profile contract.

## Acceptance criteria

- **Given** the save fails or no learner is selected, **when** Submit is pressed, **then** the form stays recoverable and does not display submission success.

- **Given** a parent resumes a draft for child B, **when** the form loads, **then** only child B’s fields and status are displayed.

## Validation and evidence

Component/integration tests for network/rules failure, no students, multiple students, draft restore, duplicate submission, account switch, and sensitive console-output assertions.

## Rollout, migration, and recovery

Keep existing intake records readable with version adapters; avoid rewriting sibling data or overwriting completed submissions without revision history.

## Source evidence

- [app/portal/intake/page.tsx:192](../../../app/portal/intake/page.tsx#L192)
- [app/portal/intake/page.tsx:304](../../../app/portal/intake/page.tsx#L304)
- [app/portal/intake/page.tsx:197](../../../app/portal/intake/page.tsx#L197)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
