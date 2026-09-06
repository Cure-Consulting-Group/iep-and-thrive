# Sprint plan — audit backlog execution

**Generated September 6, 2026** from `docs/audits/2026-09-05/product-direction/tickets.json`.
Ordering is computed from the ticket dependency graph, not assigned by hand. Regenerate
rather than hand-edit.

**Decisions this encodes (September 6):** containment subset first, then reassess;
24 points per sprint, one engineer plus AI assistance.

## Where we stand

| | Count | Points |
| --- | --- | --- |
| Total backlog | 76 | 545 |
| G0: protect existing users | 30 | 219 |
| G1: internal prototype | 11 | 73 |
| G2: consented pilot | 25 | 185 |
| G3: paid digital release | 5 | 34 |
| G4: institutional use | 5 | 34 |

**75 of 76 tickets are still `Proposed — review required`.** Nothing from this backlog
has shipped to production. TASK-LP-006 is `Implemented locally` — the A01/A02 code is on
`main` as of PR #39 but is **not deployed**, so the ticket stays open.

Closed outside the backlog in the September 6 pre-merge review:

- Token-refresh regression in `lib/auth-context.tsx`, found by review and fixed before merge.
- `SignatureCanvas` unguarded `setPointerCapture` — silently bricked the signature pad.
- Four time-bombed or ambiguous E2E specs; merge gate split from the production-mutating suite.
- Admin custom-claim provisioning gap, recorded as a dated correction on TASK-LP-006.

## The blocker you cannot engineer around

[TASK-LP-001](../tasks/learning-product/TASK-LP-001.md) (approve the reading-product brief) is a **product decision, not engineering work**.
It blocks [TASK-LP-014](../tasks/learning-product/TASK-LP-014.md), which blocks [TASK-LP-076](../tasks/learning-product/TASK-LP-076.md), which together gate **10 of the 22 remaining G0 tickets**.

That means containment runs for about **three sprints and then stalls** unless the brief is
approved in parallel. The private-notes exposure ([TASK-LP-007](../tasks/learning-product/TASK-LP-007.md)) sits behind that chain — it is
real containment work that cannot start until a product question is answered.

**Approve TASK-LP-001 during Sprint 1 or 2.** It is the highest-leverage thing on this page
and it is not on the engineering track.

## Phase A — containment (52 pts, 3 sprints)

Dependency-closed: every ticket here is startable without the product brief. This is what
stops live exposure.

### Sprint 1 — 18 pts

*Stop testing against production; release what is already built.*

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-054](../tasks/learning-product/TASK-LP-054.md) | P0 | 8 | Isolate local, staging, and production configuration and data |
| [TASK-LP-064](../tasks/learning-product/TASK-LP-064.md) | P0 | 5 | Remove sensitive diagnostics and gate analytics collection by context |
| [TASK-LP-006](../tasks/learning-product/TASK-LP-006.md) | P0 | 5 | Review and release the existing billing and signed-PDF security repairs |

**Exit:** Named local/staging/prod projects with separate data. A01/A02 rules and web build released through a recorded process, with admin custom claims provisioned first. Sensitive diagnostics removed.

### Sprint 2 — 21 pts

*Know what is actually deployed, and close the credential hole.*

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-058](../tasks/learning-product/TASK-LP-058.md) | P0 | 8 | Inventory deployed IAM, secrets, regions, and service configuration |
| [TASK-LP-011](../tasks/learning-product/TASK-LP-011.md) | P0 | 5 | Remove production test-account credential defaults and isolate test access |
| [TASK-LP-057](../tasks/learning-product/TASK-LP-057.md) | P0 | 8 | Triage dependency advisories and remove unnecessary runtime dependencies |

**Exit:** Inventory of deployed IAM, secrets, regions and service config. Production test-account credential defaults removed from the repo and rotated. Dependency advisories triaged — 2 critical and 8 high are live on main today.

### Sprint 3 — 13 pts

*Close the unauthenticated attack surface and repair deep links.*

| Ticket | P | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-010](../tasks/learning-product/TASK-LP-010.md) | P0 | 8 | Add bounded validation and abuse protection to public endpoints |
| [TASK-LP-035](../tasks/learning-product/TASK-LP-035.md) | P0 | 5 | Repair static-export deep links, return URLs, and not-found behavior |

**Exit:** Bounded validation and abuse protection on public endpoints. Static-export deep links, return URLs and not-found behavior repaired.

## Phase B — remaining G0 (167 pts, 22 tickets)

Not scheduled. Re-plan after Phase A, with deployment visibility we do not have today —
Sprint 2's IAM and config inventory will likely reorder this.

Most of it hangs off two contracts, both gated on the product brief:

| Ticket | Pts | Unlocks | Role |
| --- | --- | --- | --- |
| [TASK-LP-014](../tasks/learning-product/TASK-LP-014.md) | 8 | 22 tickets | Define the canonical account, learner, enrollment, and program data contract |
| [TASK-LP-076](../tasks/learning-product/TASK-LP-076.md) | 8 | 5 tickets | Create a repeatable schema migration and compatibility framework |

The rest is the payment, booking and email correctness chain ([TASK-LP-042](../tasks/learning-product/TASK-LP-042.md), [TASK-LP-043](../tasks/learning-product/TASK-LP-043.md), [TASK-LP-044](../tasks/learning-product/TASK-LP-044.md), [TASK-LP-048](../tasks/learning-product/TASK-LP-048.md), [TASK-LP-050](../tasks/learning-product/TASK-LP-050.md) and their
dependents) plus the data-exposure repairs ([TASK-LP-007](../tasks/learning-product/TASK-LP-007.md), [TASK-LP-008](../tasks/learning-product/TASK-LP-008.md), [TASK-LP-012](../tasks/learning-product/TASK-LP-012.md), [TASK-LP-013](../tasks/learning-product/TASK-LP-013.md)).

## Product / educator track — runs in parallel

Different owner, consumes no engineering capacity, and gates Phase B. Ordered by urgency:

| Ticket | Gate | Pts | Title |
| --- | --- | --- | --- |
| [TASK-LP-001](../tasks/learning-product/TASK-LP-001.md) | G1 | 5 | Approve the independent reading-product brief and explicit non-goals |
| [TASK-LP-002](../tasks/learning-product/TASK-LP-002.md) | G1 | 5 | Establish educator ownership, content rights, and instructional review |
| [TASK-LP-072](../tasks/learning-product/TASK-LP-072.md) | G1 | 5 | Consolidate backlog ownership, operating runbooks, and support |
| [TASK-LP-003](../tasks/learning-product/TASK-LP-003.md) | G2 | 8 | Design a consented feasibility pilot and external demand study |
| [TASK-LP-005](../tasks/learning-product/TASK-LP-005.md) | G3 | 5 | Define separate digital and tutoring offers with testable economics |
| [TASK-LP-004](../tasks/learning-product/TASK-LP-004.md) | G4 | 5 | Qualify NYC channels and classroom policy requirements |

## Beyond G0

G1 (73 pts) is the internal reading prototype. G2 (185) is the consented pilot. G3 and G4
(68 combined) are business bets, not prerequisites — leave them unscheduled. Cut G2 against
what the G1 prototype actually shows rather than committing to it now.

## Standing rules

- A ticket is done when its own Given/When/Then criteria pass, not when the code merges.
- Implementation, local verification, staging verification and deployment are tracked
  separately in `STATE.md`. **Merging is not releasing** — TASK-LP-006 is the live example.
- G0 protects people already using the product. It outranks everything in G1–G4 regardless
  of how much more interesting the later work is.
