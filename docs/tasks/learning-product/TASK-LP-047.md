# TASK-LP-047 — Complete governed resource and portfolio publishing

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-06](../../audits/2026-09-05/product-direction/epics.md#epic-lp-06) |
| Priority / release gate | P1 / G4: institutional use |
| Status | Proposed — review required |
| Proposed owner | Web + backend + privacy |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F12](../../audits/2026-09-05/product-direction/findings.md#f12), [F14](../../audits/2026-09-05/product-direction/findings.md#f14), [F33](../../audits/2026-09-05/product-direction/findings.md#f33) |
| Dependencies | [TASK-LP-009](TASK-LP-009.md), [TASK-LP-013](TASK-LP-013.md), [TASK-LP-015](TASK-LP-015.md), [TASK-LP-022](TASK-LP-022.md) |

## Problem and intended outcome

Resources and portfolio readers exist, but comments about consent-checked artifact writers do not establish a complete publishing workflow. Media permissions and publication rights need enforceable behavior.

## Implementation scope

1. Inventory active writers and retire unsupported upload surfaces; define draft/uploaded/reviewed/published/withdrawn states.
2. Require appropriate learner/media permission and scope before publication; distinguish family portfolio sharing from separately opted-in marketing use.
3. Implement staff upload/preview/caption/alt text and authorized family download, with bounded media size, scanning, orphan cleanup, and retention.
4. Record version, author, permission basis, audience, and withdrawal; keep resource download counts non-authoritative.

## Acceptance criteria

- **Given** media permission is absent or revoked, **when** publication or new delivery is requested, **then** the operation is denied or withdrawn according to policy.

- **Given** a file upload succeeds but metadata fails, **when** the operation retries, **then** no orphaned public media or duplicate artifact is created.

## Validation and evidence

Consent/role matrix, media upload failures, direct object denials, accessible caption alternatives, withdrawal, and scheduled retention cleanup tests.

## Rollout, migration, and recovery

Keep unreviewed media private. Do not infer consent from a UI checkbox or an old general intake field.

## Source evidence

- [lib/resource-service.ts:47](../../../lib/resource-service.ts#L47)
- [lib/portal-progress.ts:213](../../../lib/portal-progress.ts#L213)
- [functions/src/photo-release.ts:110](../../../functions/src/photo-release.ts#L110)
- [firestore.rules:147](../../../firestore.rules#L147)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
