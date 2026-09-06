# TASK-LP-041 — Validate browser learner access before funding a second runtime

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-05](../../audits/2026-09-05/product-direction/epics.md#epic-lp-05) |
| Priority / release gate | P2 / G4: institutional use |
| Status | Proposed — review required |
| Proposed owner | Product + web + educator |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Findings | [F34](../../audits/2026-09-05/product-direction/findings.md#f34), [F40](../../audits/2026-09-05/product-direction/findings.md#f40) |
| Dependencies | [TASK-LP-001](TASK-LP-001.md), [TASK-LP-003](TASK-LP-003.md), [TASK-LP-027](TASK-LP-027.md) |

## Problem and intended outcome

The web app is an adult/service portal, not a browser learning client. NYC practitioner reach may require Chromebooks, shared computers, or teacher-led presentation; an iOS-only assumption needs evidence.

## Implementation scope

1. Survey pilot device availability and school/browser constraints; compare iOS-only plus adult web, browser-first, and a limited shared-content web renderer.
2. Build a synthetic-data prototype of the same reviewed quest for keyboard/touch and teacher-led display only if device evidence justifies it.
3. Evaluate shared-device logout/cache isolation, accessibility, offline expectations, support burden, and content/assessment parity.
4. Write RFC-LP-002 with an explicit proceed/defer decision; a browser prototype must not silently become a second full product backlog.

## Acceptance criteria

- **Given** the target buyers lack supported iOS devices, **when** channel evidence is reviewed, **then** the platform decision explicitly addresses their access or excludes that channel.

- **Given** a browser prototype is evaluated, **when** the task is compared with iOS, **then** instructional conditions and rubric differences are documented.

## Validation and evidence

Device/channel matrix, task-based prototype tests, comparative implementation/support estimate, and an approved platform decision.

## Rollout, migration, and recovery

No real child data in the prototype. Production browser learning requires separate consent, security, accessibility, and release validation.

## Source evidence

- [next.config.js:3](../../../next.config.js#L3)
- [app/portal/students/[studentId]/sessions/page.tsx:1](../../../app/portal/students/[studentId]/sessions/page.tsx#L1)
- [ios/project.yml:8](../../../ios/project.yml#L8)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
