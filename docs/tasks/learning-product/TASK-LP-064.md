# TASK-LP-064 — Remove sensitive diagnostics and gate analytics collection by context

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-09](../../audits/2026-09-05/product-direction/epics.md#epic-lp-09) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | iOS + web + privacy |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F06](../../audits/2026-09-05/product-direction/findings.md#f06), [F39](../../audits/2026-09-05/product-direction/findings.md#f39) |
| Dependencies | None; may start after backlog review |

## Problem and intended outcome

Native onboarding logs a child’s first name, intake logs the entire sensitive form, and the root reducer prints state changes. GA loads from the global layout when configured, including authenticated routes.

## Implementation scope

1. Remove names, intake payloads, credentials, responses, and unnecessary stable identity from logs; inspect reducer debug printing and SDK error metadata for disclosure.
2. Define child/adult/public contexts and consent conditions for diagnostics and analytics; keep marketing scripts out of child and sensitive adult workflows unless specifically justified.
3. Configure Crashlytics and other SDK collection/access/retention according to the approved policy and actual data disclosure.
4. Add automated forbidden-payload checks and a network/log inspection checklist for future instrumentation.

## Acceptance criteria

- **Given** a child enters a name or an adult enters medical intake data, **when** the flow runs or fails, **then** no raw value appears in logs or third-party analytics requests.

- **Given** tracking is disabled or consent withdrawn, **when** navigation continues, **then** disallowed SDK collection does not resume.

## Validation and evidence

Run synthetic canary strings through onboarding, auth, intake, and error paths; inspect logs and network destinations. Verify release build behavior separately from debug.

## Rollout, migration, and recovery

Remove explicit sensitive logging immediately; broader consent-dependent SDK configuration may follow the consent model. Do not delay simple log removal behind full consent delivery.

## Source evidence

- [ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift:78](../../../ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift#L78)
- [ios/IEPAndThrive/IEPAndThriveApp.swift:17](../../../ios/IEPAndThrive/IEPAndThriveApp.swift#L17)
- [app/portal/intake/page.tsx:304](../../../app/portal/intake/page.tsx#L304)
- [components/layout/GoogleAnalytics.tsx:13](../../../components/layout/GoogleAnalytics.tsx#L13)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
