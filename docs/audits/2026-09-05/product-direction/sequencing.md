# Sequencing and release gates

**Proposal for review, September 5, 2026.** Read alongside the [ticket index](ticket-index.md). Ticket dependencies identify prerequisites to completing the full ticket; investigation and reversible containment can start earlier. Points are relative planning estimates, not dates or a budget. No team capacity, approved cash budget, or delivery deadline was supplied.

## Direction and allocation

Choose the independent reading product, with tutoring retained as a separate service and an instructional feedback channel. The founder's educational experience becomes a content and review responsibility. A school is a future business option, not a dependency for the learning product. Neither engineering activity nor founder credibility alone establishes demand or learning benefit.

For the first planning cycle, allocate attention in this order: protect current families; establish the learner/content/data contracts; deliver one supported reading loop with reliable records; test it with families outside the existing service. Preserve obligations to current tutoring customers while avoiding a broad service-management expansion. There is no recommendation to rewrite the existing stack or build all 76 tickets before showing an internal prototype.

**Priority interpretation:** P0 means a blocker for the ticket's stated release gate, not an instruction to run every P0 simultaneously. G0 protects existing exposed service paths. G1 permits internal synthetic-data prototypes. G2 permits a consented external pilot only after privacy, integrity, accessibility, and recovery prerequisites. G3 adds paid digital commerce. G4 adds institutional or additional-channel requirements. A later gate also inherits applicable earlier safeguards.

## First reviewable work packages

| Order | Work package | Tickets / exit evidence |
| --- | --- | --- |
| 1 | Release the local trust repairs through a controlled process; inspect historical effects | [006](../../../tasks/learning-product/TASK-LP-006.md). Existing 17 rules and four auth regressions stay green; compare intended and deployed rules/claims, inspect historical billing mappings and document tokens with authorized operational access |
| 2 | Stop private-note exposure and unsafe client authority | [007](../../../tasks/learning-product/TASK-LP-007.md), [008](../../../tasks/learning-product/TASK-LP-008.md), [009](../../../tasks/learning-product/TASK-LP-009.md), [064](../../../tasks/learning-product/TASK-LP-064.md). Negative access tests, safe migration, removal of sensitive diagnostics |
| 3 | Establish isolated release/test environments and close unsafe public entry points | [010](../../../tasks/learning-product/TASK-LP-010.md), [011](../../../tasks/learning-product/TASK-LP-011.md), [054](../../../tasks/learning-product/TASK-LP-054.md), [057](../../../tasks/learning-product/TASK-LP-057.md), [058](../../../tasks/learning-product/TASK-LP-058.md). Named environments, test-provider credentials, least privilege, advisory triage |
| 4 | Agree on the reading-product promise and canonical contracts | [001](../../../tasks/learning-product/TASK-LP-001.md), [002](../../../tasks/learning-product/TASK-LP-002.md), [014](../../../tasks/learning-product/TASK-LP-014.md), [025](../../../tasks/learning-product/TASK-LP-025.md). Educator-approved target/prerequisites, content responsibility, identity and event RFCs |
| 5 | Repair current transactions while constructing the narrow learning slice | Service/payment tickets below alongside [023–030](ticket-index.md). Separate owners and scoped changes prevent one stream from blocking all useful work |

Packages are not five promised sprints. Service exposure and deployed configuration have not been inspected, so the first operational review may reorder G0 work. A short-term server/rules restriction or temporary suspension of a defective action can protect users before a full feature replacement. Record affected users, support alternatives, and recovery steps; never silently discard legitimate appointments or purchases. Removing known sensitive logging does not wait for the whole consent redesign, and reviewing/releasing the already-tested A01/A02 changes does not wait for completion of the whole CI epic.

## Gate G0 — Existing family/service protection

**Accountable roles:** engineering release owner, service operations owner, privacy/security reviewer.

- Family authorization and document integrity: 006–013. Separate instructor-only fields into separately protected documents; do not rely on hiding fields in a parent screen.
- Service correctness: 035, 038, 042–045, 048–050, 063, 064, 066, 075. Repair direct links/auth continuation, signed agreements, reservations, cancellation, payment transitions, and communication delivery. Existing service checkout can be repaired without deciding the future digital subscription.
- Operational foundations: 054, 055, 057–059, 067, 069, 076. Verify environments, actual deployed resources, coordinated release artifacts, recovery, and meaningful integration checks. Establish the minimal canonical identity mapping from 014 where service migration depends on it.

**Exit evidence:** owner/admin/stranger rules matrix; no client mutation of authoritative enrollment or billing fields; known document access path; concurrency and retry tests for active booking/billing flows; reproducible release and recovery record; explicit disposition of all G0 findings. A disabled feature with a documented support alternative is containment, not a completed feature ticket. Unknown production exposure is investigated without claiming a breach or a clean bill of health.

## Gate G1 — Internal reading prototype

**Accountable roles:** product owner and educator; iOS/backend leads.

1. Approve 001/002/014/025 and the [architecture proposal](architecture-proposal.md). Select one reading skill with explicit prerequisites. The suggested grades 3–5 band is a discovery hypothesis, not an enrollment rule or a claim the current activities meet grade standards.
2. Restrict catalog claims and separate attempts/help/completion/rewards (023/024).
3. Publish one reviewed quest and a separate fresh task through 026/027; implement the native passage flow and help semantics (028/029).
4. Use synthetic learners to demonstrate every task, navigation exit, error, and outcome. Establish documentation/support ownership (072).

**Exit evidence:** the educator can explain what each interaction measures, what assistance changes, and what it cannot establish. A child activity labeled inference must actually exercise inference. Quitting, tracing an unrelated glyph, or placing any cube cannot produce an unqualified success record. The prototype may be local-only and unpaid; it must not ingest real child data while G2 safeguards remain incomplete.

## Gate G2 — Consented external pilot

**Accountable roles:** educator/pilot lead, engineering release owner, family support owner.

- Complete identity, consent, scoped persistence, restore/linking, durable sync and deletion: 015–021, 073, 076, supported by 014/025.
- Add independent checks, careful adult evidence and historical educator assessments: 030–032, 037, 046. Assignment sequencing must use appropriate evidence, not reward totals.
- Make adult/public navigation, intake, recovery and accessibility usable: 034, 036, 040, 070, 074, 075.
- Prove release, observability, cost bounds, compatible flags, privacy-safe metrics and real-store integration: 055/056/060–062/065/068, with applicable G0 controls inherited.
- Execute 003 and 071. Proposed initial feasibility recruitment is 8–12 families and 3–5 practitioners, including people outside founder tutoring. These are manageable learning cohorts, not statistically powered efficacy samples. Research safeguards, recruitment and measures need review before real participation.

**Exit evidence:** the full release checklist in [validation plan](validation-plan.md), observed usable task completion, recorded support/assistance, acknowledged sync, safe account switching/deletion, and an educator-reviewed report. Track usability, return use, burden, reasons for abandonment and willingness to pay separately from learning change. No improvement percentage should be marketed from a small uncontrolled pilot.

**Decision after pilot:** continue the independent product if non-tutoring families can use and value the loop; narrow or revise if help dependence/content fit dominates; if almost all value requires founder-led instruction, consider an explicit practitioner-supported product. This is a testable decision, not a presumption that an app necessarily scales profitably.

## Gate G3 — Paid digital release

Complete 005, 051–053 and the applicable earlier gates. Define the buyer, benefit, price experiment, entitlement authority, restoration, cancellation/refunds and support responsibilities. Track content-review labor, acquisition, support, infrastructure, payment/platform fees and retention in the economic model. Avoid treating app development as zero overhead simply because it does not require a school facility.

**Exit evidence:** test-provider lifecycle results for purchase/pending/cancel/revoke/restore; one consistent access decision across surfaces; reconciled financial records; adult purchasing boundary; reviewed store disclosures and actual access to promised content. Start paid acquisition only with a supported offer and a way to measure retention and cost. Existing tutoring payment repair is G0 and does not wait for G3.

## Gate G4 — Institutional and additional-channel expansion

Qualify 004 before designing NYCPS student use or making school-market claims. A NYC family channel, independent practitioner channel, private school, and NYCPS classroom deployment have different purchasers, constraints and evidence needs; local roots help relationships but do not remove those distinctions. See [primary sources](sources.md).

Expand to 022/033/047 for authorized practitioner sharing, assignment/review and governed publishing only when a real workflow/purchaser supports it. Evaluate browser learner delivery (041) using device/access research; a responsive adult web portal does not establish browser learner demand. District integrations, organizational tenancy, Android and facility planning remain conditional future proposals.

**Exit evidence:** qualified buyer/use case, permission and data agreements appropriate to that use, least-privilege collaboration, accessibility/device fit, reviewed instructional and marketing claims, and support economics. A direct-to-family pilot does not prove institutional readiness.

## Dependency and review discipline

The machine-readable graph in [tickets.json](tickets.json) is authoritative for this proposal. Common paths are:

- Environment 054 → real backend tests 067 → payment claim 048 / checkout 050 → server booking 042 → cancellation 043 → durable delivery 044.
- Product 001 + identity 014 → event contract 025 → reviewed content 026/027 → native quest 028 → independent evidence 030 → adult report 032.
- Identity 014 + migration 076 + actor contracts 073 → scoped local store 017 → linking 019 and sync 020 → restore 018 → real-store tests 068.
- Consent 015 + deletion 021 + accessibility 040/070 + verified integration/release → pilot gate 071.

These abbreviated paths illustrate ordering; consult each ticket for its full dependency set. Resolve any scope split during review rather than using the diagram as permission to omit a prerequisite. Cross-gate foundational work can be completed minimally for the earlier flow without declaring its later product applications complete.

At review, name owners, select the active gate, split large/uncertain tickets if needed, and accept or amend RFCs. Retain finding IDs when splitting so evidence is not lost. Mark work separately as implemented, locally tested, staging verified, deployed, and operationally verified. Do not carry historical “shipped” labels forward as a substitute for this evidence.
