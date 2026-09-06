# TASK-LP-006 — Review and release the existing billing and signed-PDF security repairs

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-02](../../audits/2026-09-05/product-direction/epics.md#epic-lp-02) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Implemented locally — deployment and historical verification outstanding |
| Proposed owner | Security + backend + release owner |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F07](../../audits/2026-09-05/product-direction/findings.md#f07), [F08](../../audits/2026-09-05/product-direction/findings.md#f08) |
| Dependencies | None; may start after backlog review |

## Problem and intended outcome

A01/A02 code repairs and regression tests exist locally, but no deployed rules or historical exposure have been verified. Close the operational gap without representing a local change as production protection.

## Implementation scope

1. Review the current profile allowlist, token-derived UI role, and direct signed-PDF denial against signup, profile editing, staff access, and the ownership-checked download endpoint.
2. Prepare a versioned release of Firestore rules, Storage rules, and the web build; record exact hashes and independent review. An emergency manual release can precede the full CI work if documented.
3. Using authorized operational access, validate billing mappings against authoritative Stripe records and inspect historical signed-object tokens/access evidence; plan targeted revocation and remediation if needed.
4. Verify synthetic canary denials after release and preserve sanitized evidence; keep prior exposure status explicitly unknown until investigated.

## Acceptance criteria

- **Given** a parent attempts to replace a customer ID or role, **when** the request reaches released rules, **then** the write is denied and legitimate contact edits still work.

- **Given** a family requests a signed PDF, **when** ownership is checked, **then** its authorized endpoint works while direct client access is denied.

## Validation and evidence

17 security cases and four auth tests already pass locally; add endpoint owner/admin/cross-family tests and production synthetic canary evidence. Do not expose real family documents in evidence.

## Rollout, migration, and recovery

Status is implemented locally, pending review and release. Do not roll back to vulnerable rules; use a restrictive fallback or pause the affected feature. Production review requires operational authorization at execution time.

## Source evidence

- [firestore.rules:21](../../../firestore.rules#L21)
- [storage.rules:39](../../../storage.rules#L39)
- [lib/auth-context.tsx:86](../../../lib/auth-context.tsx#L86)
- [functions/src/customer-portal.ts:59](../../../functions/src/customer-portal.ts#L59)

## Correction — September 6, 2026 (post-audit)

Added during pre-merge review of `feature/product-audit-handoff`; the original audit scope above did not cover it.

The release in step 2 must be preceded by admin custom-claim provisioning. `isAdmin()` in `firestore.rules` is claim-based, but the only `setCustomUserClaims` call in the repository is [scripts/seed-test-accounts.mjs:232](../../../scripts/seed-test-accounts.mjs#L232), which seeds a single test account. No production path, migration, or runbook grants the claim.

Consequence if skipped: any production admin holding only a persisted `users/{uid}.role == 'admin'` document loses the admin UI at release, because the client no longer reads that field. Those admins were already denied admin *data* by the existing claim-based rules, so this converts a silent half-lockout into a total one rather than causing a new data regression — but it is user-visible and must be handled before release, not after.

5. Enumerate existing `users/{uid}` documents with `role == 'admin'`, confirm each against an authorized list of current staff, and assign `{ admin: true }` custom claims before releasing rules or the web build. Record the enumeration and the claims granted as release evidence; do not grant claims from the persisted field alone without human confirmation of each account.

- **Given** a confirmed production admin, **when** the release completes, **then** they retain admin UI access and their claim grant is recorded in release evidence.

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
