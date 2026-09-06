# TASK-LP-022 — Implement least-privilege practitioner invitations and learner sharing

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-03](../../audits/2026-09-05/product-direction/epics.md#epic-lp-03) |
| Priority / release gate | P1 / G4: institutional use |
| Status | Proposed — review required |
| Proposed owner | Backend + web + privacy |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F35](../../audits/2026-09-05/product-direction/findings.md#f35) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-015](TASK-LP-015.md), [TASK-LP-021](TASK-LP-021.md) |

## Problem and intended outcome

The only staff authority is a global admin custom claim. Independent practitioners cannot safely use this as a multi-customer product without limited, revocable access.

## Implementation scope

1. Specify household versus organization ownership and an invitation/grant model scoped to assigned learners and permitted actions. Do not give pilot practitioners global admin.
2. Implement verified recipient invitations, expiration, acceptance, revocation, role changes, and account departure with server authorization.
3. Separate practitioner-private notes from shared observations and preserve who entered/approved educational evidence.
4. Add an access-management UI and audit events; document the minimum organization model needed for the first practitioner pilot before enterprise features.

## Acceptance criteria

- **Given** a practitioner has access to learner A, **when** they query learner B or another organization, **then** access is denied.

- **Given** a parent or authorized organization revokes a grant, **when** the practitioner refreshes or requests a new report, **then** access ceases and stale UI state is cleared.

## Validation and evidence

Rules/API matrix for parent, invited/unaccepted staff, assigned staff, revoked staff, org admin, and platform admin; cross-tenant batch/query and file-link checks.

## Rollout, migration, and recovery

Initially limit participation to reviewed grants. No broad collection read bypass; migrate global admin usage only after documented staff responsibilities.

## Source evidence

- [firestore.rules:11](../../../firestore.rules#L11)
- [lib/student-service.ts:41](../../../lib/student-service.ts#L41)
- [app/admin/layout.tsx:32](../../../app/admin/layout.tsx#L32)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
