# Sprint plan — audit backlog execution

**Generated September 6, 2026** from `docs/audits/2026-09-05/product-direction/tickets.json`.
Regenerate rather than hand-edit; the ordering below is computed from the ticket
dependency graph, not assigned by hand.

## Where we stand

| | Count | Points |
| --- | --- | --- |
| Total backlog | 76 | 545 |
| G0: protect existing users | 30 | 219 |
| G1: internal prototype | 11 | 73 |
| G2: consented pilot | 25 | 185 |
| G3: paid digital release | 5 | 34 |
| G4: institutional use | 5 | 34 |

**75 of 76 tickets are still `Proposed — review required`.** One (TASK-LP-006) is
`Implemented locally`. Nothing from this backlog has shipped to production.

Closed outside the backlog, in the September 6 pre-merge review (PR #39):

- A01/A02 trust repairs merged to `main` — **not deployed**. TASK-LP-006 stays open.
- Token-refresh regression in `lib/auth-context.tsx` found and fixed before merge.
- `SignatureCanvas` unguarded `setPointerCapture` fixed.
- Four time-bombed/ambiguous E2E specs repaired; merge gate split from the
  production-mutating suite.
- Admin custom-claim provisioning gap recorded as a correction on TASK-LP-006.

## The shape of it

At a **24-point sprint**, the engineering track is **23 sprints**.
That is the whole 76-ticket backlog, which is not the goal. The useful milestones:

- **G0 complete (219 pts)** — current families and paying customers are safe. This is the only
  part with a real deadline, because the exposure is live.
- **G0 + G1 (292 pts)** — safe, plus an internal reading prototype you can show and critique.
- **G0 + G1 + G2 (477 pts)** — plus a consented external pilot.

G3 and G4 are optional business bets, not prerequisites. Do not schedule them yet.

## Critical path

These unlock the most downstream work. Everything else waits on them:

| Ticket | Points | Directly unlocks | Why it gates |
| --- | --- | --- | --- |
| [TASK-LP-014](../tasks/learning-product/TASK-LP-014.md) | 8 | 22 tickets | The canonical data contract. All identity, enrollment and learner work derives from it. |
| [TASK-LP-054](../tasks/learning-product/TASK-LP-054.md) | 8 | 16 tickets | Every environment-dependent fix; you cannot safely test anything against production today. |
| [TASK-LP-001](../tasks/learning-product/TASK-LP-001.md) | 5 | 12 tickets | The product brief. G1 content and catalog work is undefined without it. |
| [TASK-LP-025](../tasks/learning-product/TASK-LP-025.md) | 8 | 12 tickets | Learning-event contract. All evidence, rubric and reporting work derives from it. |
| [TASK-LP-015](../tasks/learning-product/TASK-LP-015.md) | 8 | 6 tickets | Adult consent and child-data minimization. No real child data may be collected before it. |
| [TASK-LP-076](../tasks/learning-product/TASK-LP-076.md) | 8 | 5 tickets | Schema migration framework. Any rules/shape change to live data needs it. |

## Engineering track

Sequential; each sprint's dependencies are satisfied by earlier sprints. 24 points per sprint.

### Sprint 1 — G0 · 18 pts

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-054](../tasks/learning-product/TASK-LP-054.md) | P0 | 8 | Isolate local, staging, and production configuration and data |
| [TASK-LP-064](../tasks/learning-product/TASK-LP-064.md) | P0 | 5 | Remove sensitive diagnostics and gate analytics collection by context |
| [TASK-LP-006](../tasks/learning-product/TASK-LP-006.md) | P0 | 5 | Review and release the existing billing and signed-PDF security repairs |

### Sprint 2 — G0 · 24 pts

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-058](../tasks/learning-product/TASK-LP-058.md) | P0 | 8 | Inventory deployed IAM, secrets, regions, and service configuration |
| [TASK-LP-067](../tasks/learning-product/TASK-LP-067.md) | P0 | 8 | Build real backend and rules integration coverage |
| [TASK-LP-055](../tasks/learning-product/TASK-LP-055.md) | P0 | 8 | Gate releases on verification and deploy every Firebase surface |

### Sprint 3 — G0 · 18 pts

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-011](../tasks/learning-product/TASK-LP-011.md) | P0 | 5 | Remove production test-account credential defaults and isolate test access |
| [TASK-LP-035](../tasks/learning-product/TASK-LP-035.md) | P0 | 5 | Repair static-export deep links, return URLs, and not-found behavior |
| [TASK-LP-057](../tasks/learning-product/TASK-LP-057.md) | P0 | 8 | Triage dependency advisories and remove unnecessary runtime dependencies |

### Sprint 4 — G0 · 24 pts

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-050](../tasks/learning-product/TASK-LP-050.md) | P0 | 8 | Make checkout identity, supported SKUs, and duplicate prevention authoritative |
| [TASK-LP-076](../tasks/learning-product/TASK-LP-076.md) | P0 | 8 | Create a repeatable schema migration and compatibility framework |
| [TASK-LP-037](../tasks/learning-product/TASK-LP-037.md) | P0 | 8 | Repair parent query authorization, read models, and data-state errors |

### Sprint 5 — G0 · 24 pts

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-036](../tasks/learning-product/TASK-LP-036.md) | P0 | 8 | Make intake learner-specific, resumable, and truthful about saving |
| [TASK-LP-048](../tasks/learning-product/TASK-LP-048.md) | P0 | 8 | Repair webhook claim, retry, replay, and processing state |
| [TASK-LP-063](../tasks/learning-product/TASK-LP-063.md) | P0 | 8 | Repair lifecycle email consent, delivery state, and retry semantics |

### Sprint 6 — G0 · 24 pts

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-059](../tasks/learning-product/TASK-LP-059.md) | P0 | 8 | Validate backups and rehearse whole-system recovery |
| [TASK-LP-010](../tasks/learning-product/TASK-LP-010.md) | P0 | 8 | Add bounded validation and abuse protection to public endpoints |
| [TASK-LP-069](../tasks/learning-product/TASK-LP-069.md) | P0 | 8 | Move browser E2E to staging and verify actual user outcomes |

### Sprint 7 — G0 · 24 pts

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-007](../tasks/learning-product/TASK-LP-007.md) | P0 | 8 | Separate all instructor-private notes from parent-readable records |
| [TASK-LP-008](../tasks/learning-product/TASK-LP-008.md) | P0 | 8 | Make student identity and enrollment authority server-controlled |
| [TASK-LP-012](../tasks/learning-product/TASK-LP-012.md) | P0 | 8 | Bind signed agreements to canonical terms and owned enrollment records |

### Sprint 8 — G0 · 24 pts

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-013](../tasks/learning-product/TASK-LP-013.md) | P0 | 8 | Align IEP and report storage paths with ownership and safe delivery |
| [TASK-LP-042](../tasks/learning-product/TASK-LP-042.md) | P0 | 8 | Move booking reservation and entitlement consumption into a server transaction |
| [TASK-LP-049](../tasks/learning-product/TASK-LP-049.md) | P0 | 8 | Align Stripe invoice schemas and cycle accounting with event ordering |

### Sprints 9–23 — 324 pts remaining

Deliberately not expanded. Re-plan after Sprint 4; the G2 pilot scope should be
cut against what the internal prototype actually shows, not committed now.

## Product / educator track

Runs in parallel — different owner, no engineering capacity consumed. These gate G1
content work, so they must not trail the engineering track.

| Ticket | Gate | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-001](../tasks/learning-product/TASK-LP-001.md) | G1 | 5 | Approve the independent reading-product brief and explicit non-goals |
| [TASK-LP-002](../tasks/learning-product/TASK-LP-002.md) | G1 | 5 | Establish educator ownership, content rights, and instructional review |
| [TASK-LP-072](../tasks/learning-product/TASK-LP-072.md) | G1 | 5 | Consolidate backlog ownership, operating runbooks, and support |
| [TASK-LP-027](../tasks/learning-product/TASK-LP-027.md) | G1 | 8 | Author one complete reading quest and equivalent independent tasks |
| [TASK-LP-003](../tasks/learning-product/TASK-LP-003.md) | G2 | 8 | Design a consented feasibility pilot and external demand study |
| [TASK-LP-005](../tasks/learning-product/TASK-LP-005.md) | G3 | 5 | Define separate digital and tutoring offers with testable economics |
| [TASK-LP-004](../tasks/learning-product/TASK-LP-004.md) | G4 | 5 | Qualify NYC channels and classroom policy requirements |

## Standing rules

- A ticket is done when its own Given/When/Then criteria pass, not when the code merges.
- Implementation, local verification, staging verification and deployment are tracked
  separately in `STATE.md`. Merging is not releasing.
- G0 tickets protect people who are already using the product. They outrank everything
  in G1–G4 regardless of how interesting the later work is.
