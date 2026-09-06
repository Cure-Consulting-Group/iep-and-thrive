# TASK-LP-013 — Align IEP and report storage paths with ownership and safe delivery

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-02](../../audits/2026-09-05/product-direction/epics.md#epic-lp-02) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + web + privacy |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F16](../../audits/2026-09-05/product-direction/findings.md#f16) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-076](TASK-LP-076.md) |

## Problem and intended outcome

Profile uploads use iep-documents while rules cover ieps. Report uploads put studentId in a path segment authorized as userId. Durable download URLs further complicate access revocation.

## Implementation scope

1. Define one owner-scoped object schema for IEPs, reports, private signatures, and resources with immutable metadata and bounded file type/size.
2. Update upload/read/delete code and metadata together; make success conditional on both object and metadata completion.
3. Inventory legacy paths and bearer links; build a migration and repair path for orphaned objects and broken metadata without exposing contents in logs.
4. Use an authorization-checked delivery mechanism for sensitive documents; document expiration, revocation, and authorized offline copies. Add file screening/quarantine appropriate to uploaded documents.

## Acceptance criteria

- **Given** a parent uploads a supported IEP, **when** the upload completes, **then** it is readable by the owner and permitted staff, and unavailable to another family.

- **Given** report metadata is removed or access revoked, **when** a new download is requested, **then** no new authorized download is issued.

## Validation and evidence

Emulator tests for both historical mismatches, owner/admin access, oversized/non-PDF files, upload interruption, orphan cleanup, and document revocation. Validate server-signed URL semantics separately.

## Rollout, migration, and recovery

Dual-read explicit legacy mappings during migration; never temporarily grant all-authenticated reads. Previously issued links need targeted expiration/revocation work.

## Source evidence

- [app/portal/profile/page.tsx:71](../../../app/portal/profile/page.tsx#L71)
- [lib/report-service.ts:64](../../../lib/report-service.ts#L64)
- [storage.rules:23](../../../storage.rules#L23)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
