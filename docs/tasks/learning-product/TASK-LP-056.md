# TASK-LP-056 — Make iOS archives reproducible and validate the TestFlight pipeline

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P1 / G2: consented pilot |
| Status | Proposed — review required |
| Proposed owner | iOS release engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F25](../../audits/2026-09-05/product-direction/findings.md#f25), [F44](../../audits/2026-09-05/product-direction/findings.md#f44) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md), [TASK-LP-055](TASK-LP-055.md) |

## Problem and intended outcome

The release lane queries TestFlight build numbers before constructing its API key, dependency/release versions need verification, and the AppIcon catalog has no image filename. Simulator tests do not validate distribution.

## Implementation scope

1. Initialize App Store Connect authentication before remote build-number operations; verify Fastlane working directories and serialize concurrent release numbering.
2. Pin Ruby/Fastlane dependencies through a reviewed lockfile, confirm XcodeGen output parity, and verify final archived version/build values rather than relying on comments about Info.plist.
3. Complete required app icon, signing capabilities, privacy manifest/disclosures, product metadata, export compliance, dSYM upload, and store review notes.
4. Gate TestFlight upload on relevant tests and a concrete archive audit; record device/OS support and rollback build strategy.

## Acceptance criteria

- **Given** a clean release runner has only documented secrets, **when** the lane runs, **then** it authenticates, versions, archives, and produces a verifiable artifact without interactive login.

- **Given** two releases start, **when** build numbering occurs, **then** uploaded build numbers cannot collide.

## Validation and evidence

Local unsigned archive/build inspection where possible, signing/config checklist, sandbox product tests, and an authorized TestFlight upload as a separate release step. Record unverified Apple settings.

## Rollout, migration, and recovery

Do not upload during ticket review. Preserve a known-good release and avoid claiming App Store readiness from a simulator build.

## Source evidence

- [ios/fastlane/Fastfile:40](../../../ios/fastlane/Fastfile#L40)
- [ios/fastlane/Fastfile:48](../../../ios/fastlane/Fastfile#L48)
- [ios/IEPAndThrive/Resources/Info.plist:19](../../../ios/IEPAndThrive/Resources/Info.plist#L19)
- [ios/IEPAndThrive/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json:2](../../../ios/IEPAndThrive/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json#L2)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
