# Sprint plan — audit backlog execution

**Generated September 6, 2026** from `docs/audits/2026-09-05/product-direction/tickets.json`.
Ordering is computed from the ticket dependency graph. Regenerate rather than hand-edit.

**Decisions encoded:** containment first, then reassess; 24 points per sprint.

## Phase A — containment · COMPLETE

Merged to `main` in [PR #40](https://github.com/Cure-Consulting-Group/iep-and-thrive/pull/40) (`7eba0e1`). Test count 43 → 67.

| Ticket | Gate | P | Pts | Title |
| --- | --- | --- | --- | --- |
| [TASK-LP-006](../tasks/learning-product/TASK-LP-006.md) | G0 | P0 | 5 | Review and release the existing billing and signed-PDF security repairs |
| [TASK-LP-054](../tasks/learning-product/TASK-LP-054.md) | G0 | P0 | 8 | Isolate local, staging, and production configuration and data |
| [TASK-LP-064](../tasks/learning-product/TASK-LP-064.md) | G0 | P0 | 5 | Remove sensitive diagnostics and gate analytics collection by context |
| [TASK-LP-011](../tasks/learning-product/TASK-LP-011.md) | G0 | P0 | 5 | Remove production test-account credential defaults and isolate test access |
| [TASK-LP-057](../tasks/learning-product/TASK-LP-057.md) | G0 | P0 | 8 | Triage dependency advisories and remove unnecessary runtime dependencies |
| [TASK-LP-058](../tasks/learning-product/TASK-LP-058.md) | G0 | P0 | 8 | Inventory deployed IAM, secrets, regions, and service configuration |
| [TASK-LP-010](../tasks/learning-product/TASK-LP-010.md) | G0 | P0 | 8 | Add bounded validation and abuse protection to public endpoints |
| [TASK-LP-035](../tasks/learning-product/TASK-LP-035.md) | G0 | P0 | 5 | Repair static-export deep links, return URLs, and not-found behavior |

### Carried over from Phase A

These shipped code but are not finished. They are prerequisites for later work, so they
are listed here rather than buried in a ticket status field.

- **[TASK-LP-006](../tasks/learning-product/TASK-LP-006.md)** — Scripts and runbook exist; the release itself needs production credentials.
- **[TASK-LP-058](../tasks/learning-product/TASK-LP-058.md)** — Inventory script exists; running it needs production credentials.
- **[TASK-LP-054](../tasks/learning-product/TASK-LP-054.md)** — Resolver and guards shipped; the staging project does not exist yet.
- **[TASK-LP-035](../tasks/learning-product/TASK-LP-035.md)** — 404 and open-redirect guard shipped; deep links verified still broken.

**Also outstanding, discovered during Phase A:** the repository has only three E2E
secrets. `E2E_SUBSCRIBER_PASSWORD` and `E2E_ADMIN_PASSWORD` have never existed, so until
PR #40 every CI run signed into two real production accounts — one of them admin — with
passwords derivable from a formula in the public repo. Rotate both and add the secrets.

## Phase B — the rest of G0, plus the contracts

**68 tickets, 493 points remaining** across the whole backlog.
The three sprints below are the next 69 points. Beyond Sprint 6 the shape depends on
decisions that have not been made, so they are deliberately not enumerated.

### The product brief is needed by Sprint 6, not before

[TASK-LP-001](../tasks/learning-product/TASK-LP-001.md) gates [TASK-LP-014](../tasks/learning-product/TASK-LP-014.md), which gates 22 downstream tickets. But Sprints 4 and 5 are
entirely independent of it — that is roughly **four to six weeks of runway** to make the
call before it blocks anything.

It is still the single highest-leverage item on this page, and it is not engineering work.

### Sprint 4 — 24 pts

*Make the pipeline tell the truth.*

Phase A left three loops open on purpose. `test:security` runs in no workflow, E2E runs against production rather than the diff, and there is no staging to point either at. This closes all three and is the prerequisite for trusting any later sprint's evidence.

| Ticket | Gate | P | Pts | Title |
| --- | --- | --- | --- | --- |
| [TASK-LP-055](../tasks/learning-product/TASK-LP-055.md) | G0 | P0 | 8 | Gate releases on verification and deploy every Firebase surface |
| [TASK-LP-067](../tasks/learning-product/TASK-LP-067.md) | G0 | P0 | 8 | Build real backend and rules integration coverage |
| [TASK-LP-069](../tasks/learning-product/TASK-LP-069.md) | G0 | P0 | 8 | Move browser E2E to staging and verify actual user outcomes |

**Exit:** A versioned release graph that deploys rules, indexes and Functions together — not Hosting alone. Rules and backend integration coverage that runs in CI. E2E moved off production onto staging.

### Sprint 5 — 24 pts

*Recovery, and the money/email correctness chain.*

The first two protect people who already paid. Backups have never been restored, so 'we have backups' is currently unverified. Webhook replay and email delivery state are where duplicate charges and lost confirmations come from.

| Ticket | Gate | P | Pts | Title |
| --- | --- | --- | --- | --- |
| [TASK-LP-059](../tasks/learning-product/TASK-LP-059.md) | G0 | P0 | 8 | Validate backups and rehearse whole-system recovery |
| [TASK-LP-063](../tasks/learning-product/TASK-LP-063.md) | G0 | P0 | 8 | Repair lifecycle email consent, delivery state, and retry semantics |
| [TASK-LP-048](../tasks/learning-product/TASK-LP-048.md) | G0 | P0 | 8 | Repair webhook claim, retry, replay, and processing state |

**Exit:** A rehearsed restore with recorded timings. Idempotent webhook claim/retry/replay. Lifecycle email with real delivery state and consent.

### Sprint 6 — 21 pts · REQUIRES TASK-LP-001

*The canonical contracts.*

This is where the product brief becomes load-bearing. 014 defines the account/learner/enrollment contract and unlocks 22 downstream tickets; 076 gives you a migration framework so changing live data shape stops being freehand.

| Ticket | Gate | P | Pts | Title |
| --- | --- | --- | --- | --- |
| [TASK-LP-014](../tasks/learning-product/TASK-LP-014.md) | G1 | P1 | 8 | Define the canonical account, learner, enrollment, and program data contract |
| [TASK-LP-076](../tasks/learning-product/TASK-LP-076.md) | G0 | P0 | 8 | Create a repeatable schema migration and compatibility framework |
| [TASK-LP-002](../tasks/learning-product/TASK-LP-002.md) | G1 | P1 | 5 | Establish educator ownership, content rights, and instructional review |

**Exit:** An agreed data contract, a repeatable migration path, and named educator ownership of instructional scope.

## Beyond Sprint 6

Wave analysis puts the remainder at six further waves. Re-plan after Sprint 5, when the
deployed-config inventory and the restore rehearsal will have told you things about
production that nobody currently knows. Committing to that order now would be planning
against facts not yet in evidence.

The known large blocks: the data-exposure repairs (007, 008, 012, 013) behind 076; the
booking and payment chain (042–045, 049, 050); the G1 prototype (023–028); and the G2
pilot, which should be cut against what the prototype actually shows.

## Standing rules

- A ticket is done when its Given/When/Then criteria pass, not when the code merges.
- Implementation, local verification, staging verification and deployment are tracked
  separately in `STATE.md`. **Merging is not releasing** — TASK-LP-006 is the live example.
- G0 protects people already using the product. It outranks everything in G1–G4.
