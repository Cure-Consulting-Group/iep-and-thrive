# TASK-MVP-001 — Remove third-party telemetry and launch networking from the free path

| Field | Value |
| --- | --- |
| Epic | EPIC-M1 — Lawful posture |
| Priority / release gate | P0 / Stage 1 gate |
| Status | Proposed — review required |
| Proposed owner | iOS platform engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | None |
| Design | None |

## Problem and intended outcome

The app currently configures Firebase and resolves anonymous identity at launch, while Crashlytics
and other SDKs can open network paths. The default free experience must be genuinely on-device so a
child can use it without a third-party identifier or an accidental socket.

## Implementation scope

1. Remove Firebase Auth, Firestore, Crashlytics, Google Sign-In, StoreKit, and any analytics SDK
   initialization from the iOS free-path target and launch sequence; leave the marketing site
   integration outside this target.
2. Define one validated `Data` boundary for the later consented cohort client, disabled unless the
   explicit cohort state is present; no other layer may open a socket.
3. Preserve local SwiftData reads and writes, replace remote error reporting with MetricKit-safe
   first-party diagnostics, and document the boundary in the module-graph check.
4. Add unit and launch tests for cold start, relaunch, lesson completion, failure, and exit.

## Acceptance criteria

- **Given** a fresh install with no cohort enrollment, **when** the app cold-launches and loads a
  full session, **then** no Firebase, Crashlytics, Google, StoreKit, or analytics initialization
  occurs and no outbound request is attempted.
- **Given** a local profile and skill evidence, **when** the device is offline, **then** launch,
  lesson completion, relaunch, and local persistence succeed without a remote dependency.
- **Given** a new type imports the Domain layer, **when** the module-graph check runs, **then** the
  type cannot import a network SDK or open a socket.

## Validation and evidence

Run the iOS unit suite, module-graph check, and a proxy-backed device/simulator launch test. Capture
the request log for cold launch and a complete session; the expected count is zero. Review the
dependency graph for removed SDK initialization.

## Rollout, migration, and recovery

Ship behind the release branch only after local data is proven intact. If a build fails because a
feature still expects a remote client, restore that dependency as a test stub only, not as a live
free-path transport, and reopen the owning ticket. Do not delete local records.

## Source evidence

- [IEPAndThriveApp.swift](../../../ios/IEPAndThrive/IEPAndThriveApp.swift)
- [RootFeature.swift](../../../ios/IEPAndThrive/Features/Root/RootFeature.swift)
- [ADR-000 D1](../../architecture/ADR-000-mvp-architecture-decisions.md#d1--the-free-tier-makes-zero-network-requests)

## Definition of done

Code review is approved; new code has at least 80% test coverage; inputs are validated; no secrets
are hardcoded; the one network boundary is explicit and deny-by-default; the module graph passes;
and the captured no-request evidence is attached to the release checklist.
