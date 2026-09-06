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

## Correction — September 6, 2026 (owner decision)

An earlier revision of this plan led with "paying parents cannot book tutoring sessions" and
proposed TASK-LP-042a to repair it. **That was the wrong conclusion from a correct observation.**

The observation stands: `lib/booking-service.ts:143` updates `availableSlots` from the client
while `firestore.rules:97` allows that write only for admins, so a parent booking fails with
PERMISSION_DENIED. What was wrong was the framing. I called it a live outage hitting paying
parents. In fact booking is linked only from the authenticated portal — nothing on the public
marketing site points at `/book` — and, more to the point, **parent-facing tutoring scheduling is
not part of this product at all.** The product is the learning app and the web app.

The sharper problem was one step over: the public `/tutoring` page still sold weekly,
twice-weekly and drop-in tutoring through live Stripe checkout. Someone could buy sessions they
could never book.

**Owner decision:** remove the booking flow entirely, and take the tutoring purchase CTAs down.

This is cheaper than the repair it replaces and removes a payment surface rather than
maintaining one. The summer-program enrollment deposit in `components/sections/ProgramCards.tsx`
is untouched — that is the actual business, and it shares the `stripeCheckout` endpoint with the
tutoring paths, which is exactly the kind of adjacency worth stating before anyone edits there.

`TASK-LP-042`, `TASK-LP-043`, `TASK-LP-044` and `TASK-LP-049` (booking reservation, cancellation,
booking email delivery, invoice cycle accounting) describe a scheduling product that is not being
built. They should be closed as out-of-scope rather than carried as G0 debt — 32 points that were
never going to be spent. Confirm before closing; the audit assumed obligations to existing
tutoring customers, and that assumption has not been tested against reality.

## Sprint 7 — 21 pts · remove what should not exist, close the exposure

| Ticket | Gate | P | Pts | Title |
| --- | --- | --- | --- | --- |
| **Remove booking + tutoring sales** (new) | G0 | P0 | 5 | Delete the booking flow and the public tutoring purchase CTAs |
| [TASK-LP-007](../tasks/learning-product/TASK-LP-007.md) | G0 | P0 | 8 | Separate all instructor-private notes from parent-readable records |
| [TASK-LP-060](../tasks/learning-product/TASK-LP-060.md) | G2 | P1 | 8 | Implement privacy-safe observability and actionable service alerting |

**[TASK-LP-007](../tasks/learning-product/TASK-LP-007.md)** is the highest-value security item
left and is startable today. It was blocked behind
[TASK-LP-076](../tasks/learning-product/TASK-LP-076.md), which shipped in sprint 6 built
contract-agnostic, so it never needed the identity RFC. Parents can currently read
instructor-private notes on attendance and probe records; field hiding is UI-only and does not
protect a whole-document read.

**[TASK-LP-060](../tasks/learning-product/TASK-LP-060.md)** stays in this sprint for the reason
the booking bug went unnoticed: nothing reports a failure. A parent hit PERMISSION_DENIED on
every booking attempt and no alert fired anywhere, which is why an audit found it rather than a
dashboard.

**Exit:** no route or CTA offers tutoring scheduling or its purchase; instructor-private notes
are unreadable by parents with a negative test proving it; a client-side permission failure
raises an alert.

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
