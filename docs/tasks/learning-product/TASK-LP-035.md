# TASK-LP-035 — Repair static-export deep links, return URLs, and not-found behavior

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Web + hosting |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F34](../../audits/2026-09-05/product-direction/findings.md#f34), [F42](../../audits/2026-09-05/product-direction/findings.md#f42) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md) |

## Problem and intended outcome

Only a placeholder student path is exported, and the Hosting catch-all serves the marketing homepage for missing routes. Auth also loses the enrollment continuation supplied through next.

## Implementation scope

1. Choose static query-based learner/session routes for the current export or explicitly migrate hosting strategy through an RFC; cover all dynamic admin and parent routes.
2. Replace internal links and implement safe same-origin continuation validation through login/signup; reject external return targets.
3. Serve a real not-found response/page for unknown URLs and redirect legacy learner URLs through a documented compatible route.
4. Add route-level loading, unauthorized, missing-learner, and service failure states rather than success-looking homepages.

## Acceptance criteria

- **Given** a parent opens or refreshes a valid learner link, **when** Hosting serves the request, **then** the correct authenticated learner page appears.

- **Given** a URL is unknown or next points off-site, **when** routing runs, **then** the app returns a not-found state or safe local destination.

## Validation and evidence

Hosting emulator tests for direct navigation, refresh, internal navigation, old links, query encoding, auth continuation, unauthorized IDs, and truly missing routes.

## Rollout, migration, and recovery

Deploy the new static destinations and link updates together. Preserve a bounded legacy redirect policy and do not depend on client navigation alone.

## Source evidence

- [app/portal/students/[studentId]/layout.tsx:2](../../../app/portal/students/[studentId]/layout.tsx#L2)
- [firebase.json:22](../../../firebase.json#L22)
- [app/login/page.tsx:16](../../../app/login/page.tsx#L16)
- [app/enroll/agreement/page.tsx:112](../../../app/enroll/agreement/page.tsx#L112)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
