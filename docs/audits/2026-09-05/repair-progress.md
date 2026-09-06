# Audit repair handoff — September 5, 2026

Resumed from the build audit at baseline `c60cc3b`. The audit remains the historical baseline; this file tracks subsequent repairs. No production changes have been deployed.

## First repair batch: A01 and A02

- **A01, local repair:** user-document creation allows only basic parent-profile fields. Parent updates allow only name, phone, notification/unsubscribe preferences, and their timestamps. Billing identity, subscription state/counters, roles, test markers, and unknown fields cannot be inserted, changed, or removed by a parent. Existing custom-claim admins retain maintenance access.
- **A01, UI:** auth context derives the displayed/checked role from `admin === true` on the Firebase ID token. Login uses the same claim. Token refresh updates the role; pending profile requests cannot restore an earlier account's role after sign-out. Stored UID values cannot override the authenticated UID.
- **A02, local repair:** all direct client access to `signedAgreements` is denied. The existing portal download uses the ownership-checked `getSignedAgreementPdf` endpoint; server-issued short-lived URLs remain the intended download path.
- Added 17 emulator regression cases and four auth-provider unit cases. Existing audit probes and observations are preserved unchanged.

## Verification

- Security emulator suite: **17 passed**, synthetic `demo-iep-security` data only.
- Unit suite: **41 passed** (37 existing + 4 auth regressions).
- `npx tsc --noEmit`: passed.
- Configured production export: **passed**, using the workflow public Firebase configuration.
- Reproduction: [security test instructions](../../../tests/security/README.md).

## Deployment and remaining work

The current deploy workflow deploys Hosting only. These rules must be included in a separate release before treating the exposures as closed in production. Existing billing mappings require validation against authoritative payment records because a rules change cannot establish whether earlier client writes occurred. Previously issued Storage download tokens require separate review/revocation; denying new direct reads does not invalidate them. Neither production task was performed here.

Next implementation work is **A08**: split instructor-private attendance notes into separately authorized documents, adapt staff reads/writes, and provide a migration for legacy records so existing notes do not remain readable. Then address the consent and diagnostic-data portions of **A09**. Consent is still unimplemented; this batch does not establish child-access readiness.

Proceed next with **A03** authoritative bookings. Locking subscription counters reinforces the intended server boundary: the existing client-side tutoring transactions remain incompatible with the rules, as already identified in the audit. Webhook recovery, deep links, identity/progress isolation, and learning-integrity repairs remain outstanding in the audit's order.
