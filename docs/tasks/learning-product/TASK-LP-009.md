# TASK-LP-009 — Constrain notification edits and enforce resource visibility

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-02](../../audits/2026-09-05/product-direction/epics.md#epic-lp-02) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Backend + web |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F12](../../audits/2026-09-05/product-direction/findings.md#f12) |
| Dependencies | [TASK-LP-008](TASK-LP-008.md) |

## Problem and intended outcome

Notification update rules freeze only selected fields, permitting altered content, arbitrary extra fields, and invalid read values. Enrolled-only resources are readable by every authenticated account.

## Implementation scope

1. Allow only read/readAt changes on notifications with explicit types and immutable identity/content. Decide whether unread toggles are supported.
2. Define all versus enrolled/assigned resource access using trusted entitlement or assignment data; protect both metadata and Storage access.
3. Remove privileged download-counter updates from parent clients; record downloads through bounded telemetry or a narrowly validated server operation.
4. Align resource UI visibility with actual authorization and preserve useful errors when downloads fail.

## Acceptance criteria

- **Given** a parent marks a notification read, **when** only the supported read fields change, **then** the update succeeds.

- **Given** an ineligible account knows a resource ID or storage path, **when** it requests an enrolled-only file, **then** both metadata and direct object access are denied.

## Validation and evidence

Emulator field injection/type tests; authenticated but unenrolled, enrolled, revoked, and staff resource tests; UI download error and popup behavior checks.

## Rollout, migration, and recovery

Migrate visibility metadata before enforcing private access; inspect legacy durable download URLs separately because rules alone cannot revoke bearer links.

## Source evidence

- [firestore.rules:164](../../../firestore.rules#L164)
- [storage.rules:15](../../../storage.rules#L15)
- [app/portal/resources/page.tsx:31](../../../app/portal/resources/page.tsx#L31)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
