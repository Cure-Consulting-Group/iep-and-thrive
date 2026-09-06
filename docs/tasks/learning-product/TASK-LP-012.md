# TASK-LP-012 — Bind signed agreements to canonical terms and owned enrollment records

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-02](../../audits/2026-09-05/product-direction/epics.md#epic-lp-02) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + web + legal reviewer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F17](../../audits/2026-09-05/product-direction/findings.md#f17) |
| Dependencies | [TASK-LP-014](TASK-LP-014.md), [TASK-LP-076](TASK-LP-076.md) |

## Problem and intended outcome

The enrollment signature handler hashes client-supplied text against the client-supplied hash, accepts arbitrary version/inquiry IDs, and can produce a signed PDF even when its signature image cannot be embedded. This proves consistency of submitted bytes, not acceptance of approved terms.

## Implementation scope

1. Use a server-owned versioned document registry; fetch canonical text/hash and reject stale or unknown versions. Confirm the authenticated signer owns or can securely claim the referenced inquiry.
2. Require explicit agreement assent independently of electronic-delivery consent; validate signature payload size, image format, decoded bounds, and rendering.
3. Make sign operations idempotent with immutable audit history and deterministic associations to the enrollment/payment record.
4. Handle partial PDF/image/document writes with recovery and cleanup; provide an accessible signing alternative reviewed for the intended agreement.

## Acceptance criteria

- **Given** a signer submits modified terms with a matching self-computed hash, **when** the endpoint validates, **then** the request is rejected.

- **Given** an inquiry belongs to someone else or the PNG is invalid, **when** signing is attempted, **then** no successful agreement or payment-ready state is produced.

## Validation and evidence

Handler tests for tampered terms, stale versions, unknown/cross-family inquiries, invalid/large images, repeated requests, and failures between storage and Firestore writes; verify readable PDFs with long and non-ASCII names.

## Rollout, migration, and recovery

New versions apply prospectively. Preserve historical signed documents and flag uncertain provenance for review; never rewrite signed terms in place.

## Source evidence

- [functions/src/e-signature/index.ts:76](../../../functions/src/e-signature/index.ts#L76)
- [functions/src/e-signature/pdf-generator.ts:178](../../../functions/src/e-signature/pdf-generator.ts#L178)
- [app/enroll/agreement/page.tsx:36](../../../app/enroll/agreement/page.tsx#L36)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
