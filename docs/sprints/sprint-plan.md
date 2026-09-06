# Sprint plan — audit backlog execution

**Regenerated September 6, 2026** after the full-session audit (Codex `gpt-5.6-sol @ high`
correctness + Antigravity system review). Ordering is computed from the ticket dependency
graph. Regenerate rather than hand-edit.

## Shipped — sprints 1–6 · COMPLETE

15 tickets merged across PRs #39–#44. Tests 43 → 73 unit, 5 → 25 functions, 17 → 24 security.

| | Tickets |
| --- | --- |
| Phase A containment | 006, 010, 011, 035, 054, 057, 058, 064 |
| Sprints 4–6 | 048, 055, 059, 063, 067, 069, 076 |
| Drafts awaiting approval | 001, 002, 014 |

## The finding that reorders everything

**Paying parents cannot book tutoring sessions.** `lib/booking-service.ts:143` updates
`availableSlots` from the client; `firestore.rules:97` allows that write only for admins, so
every parent booking fails with PERMISSION_DENIED. `/book` is linked from the parent portal in
four places, and `subscription-checkout.ts` bills monthly regardless.

This is **pre-existing** — not a regression from this session — and the audit already knew:
[TASK-LP-042](../tasks/learning-product/TASK-LP-042.md)'s first line reads *"Normal parent booking cannot update admin-only slots."* It was
filed as a correctness improvement rather than an outage, which is why it sat at wave 3.

**It is blocked.** [TASK-LP-042](../tasks/learning-product/TASK-LP-042.md) depends on [TASK-LP-050](../tasks/learning-product/TASK-LP-050.md) and [TASK-LP-014](../tasks/learning-product/TASK-LP-014.md); both need [TASK-LP-001](../tasks/learning-product/TASK-LP-001.md), the
product brief. So the highest-severity live defect in the system sits behind a decision only
the owner can make.

I do not think that dependency is real for the *outage*. Restoring booking needs the slot write
moved server-side under the identity model that exists today. The canonical identity contract is
required for the rest of [TASK-LP-042](../tasks/learning-product/TASK-LP-042.md) — entitlement ledgers, cross-platform learner references —
not for stopping the bleeding. Sprint 7 therefore proposes a narrow repair.

## Sprint 7 — 24 pts · restore service, close the exposure

| Ticket | Gate | P | Pts | Title |
| --- | --- | --- | --- | --- |
| [TASK-LP-007](../tasks/learning-product/TASK-LP-007.md) | G0 | P0 | 8 | Separate all instructor-private notes from parent-readable records |
| **TASK-LP-042a** (new, carve-out) | G0 | P0 | 8 | Restore parent booking via a server-side reservation |
| [TASK-LP-060](../tasks/learning-product/TASK-LP-060.md) | G2 | P1 | 8 | Implement privacy-safe observability and actionable service alerts |

**[TASK-LP-007](../tasks/learning-product/TASK-LP-007.md)** is the highest-value security item left and is startable today. It was blocked
behind [TASK-LP-076](../tasks/learning-product/TASK-LP-076.md), which shipped in sprint 6 — the migration runner was built
contract-agnostic, so it did not need the identity RFC after all. Parents can currently read
instructor-private notes on attendance and probe records; field hiding is UI-only and does not
protect a whole-document read.

**TASK-LP-042a** is the carve-out: move the slot claim into a Cloud Function with an atomic
availability check, using today's identity model. Explicitly *not* the entitlement ledger or the

**[TASK-LP-060](../tasks/learning-product/TASK-LP-060.md)** last, because nothing currently reports that booking is failing. A parent hits
PERMISSION_DENIED and no alert fires anywhere.

**Exit:** a parent with an active subscription can book and cancel; instructor-private notes are
unreadable by parents with a negative test proving it; a failed booking raises an alert.

## Sprint 8 — 21 pts · the decision, then what it unblocks

| Ticket | Gate | P | Pts | Title |
| --- | --- | --- | --- | --- |
| [TASK-LP-001](../tasks/learning-product/TASK-LP-001.md) | G1 | P1 | 5 | Approve the independent reading-product brief and explicit non-goals |
| [TASK-LP-014](../tasks/learning-product/TASK-LP-014.md) | G1 | P1 | 8 | Define the canonical account, learner, enrollment, and program data contract |
| [TASK-LP-002](../tasks/learning-product/TASK-LP-002.md) | G1 | P1 | 5 | Establish educator ownership, content rights, and instructional review |

Approving these three moves **14 additional tickets** into immediate reach — the single largest
unlock left in the backlog. The drafts are written and waiting; what is missing is an educator
conversation and four decisions, including which of `programTrack` or `enrollmentStatus` is
authoritative. A wrong answer there silently mis-migrates every enrolled family.

If the brief slips, Sprint 8 becomes 056 + 060 spillover and the backlog stops widening.

## Sprint 9 — 24 pts · identity-dependent G0, once 014 lands

| Ticket | Gate | P | Pts | Title |
| --- | --- | --- | --- | --- |
| [TASK-LP-008](../tasks/learning-product/TASK-LP-008.md) | G0 | P0 | 8 | Make student identity and enrollment authority server-controlled |
| [TASK-LP-050](../tasks/learning-product/TASK-LP-050.md) | G0 | P0 | 8 | Make checkout identity, supported SKUs, and duplicate prevention authoritative |
| [TASK-LP-012](../tasks/learning-product/TASK-LP-012.md) | G0 | P0 | 8 | Bind signed agreements to canonical terms and owned enrollment records |

Not scheduled beyond this. Sprint 7 will change what the rest costs, and the deployed-config
inventory has still never been run against production.

## Known defects not yet ticketed

| Defect | Evidence | Disposition |
| --- | --- | --- |
| One-time deposits create user docs with random ids the owner can never read | `stripe-webhook.ts:561` `usersRef.doc()`; rules require `uid == userId` | Pre-existing; fold into 008 |
| `webhookOutbox` has no consumer — a transient Gmail failure loses a receipt permanently | Audit upgraded severity: duplicates short-circuit, replay skips succeeded claims | Needs its own ticket |
| Deep links still broken | verified against production; homepage served for real student URLs | 035 criterion unmet |
| Auth has no export | `verify-recovery-readiness.sh` | Blocks any restore |
| No deletion manifest | a faithful restore resurrects deleted records | Privacy obligation |

## Standing rules

- A ticket is done when its Given/When/Then criteria pass, not when the code merges.
- **Merging is not releasing.** Nothing from sprints 1–6 is deployed; the deploy job is
  `workflow_dispatch`-only until admin claims are provisioned.
- G0 protects people already using the product. It outranks everything in G1–G4.
