# Independent learning-product audit and focus-shift review

**Review date:** September 5, 2026, America/New_York. **Baseline commit:** `c60cc3b6d1599a6c5e39f89e999b111a0cc25b2a`, plus the uncommitted A01/A02 repair from this conversation. **Deliverable:** 44 findings, 10 epics, and 76 fully specified local tickets. **Status:** ready for product/engineering review; proposed tickets have not been implemented, assigned, or published externally.

## Recommendation and decision

Build an independently useful, focused reading product using IEP & Thrive's educator expertise and practitioner relationships to develop and test it. Keep tutoring as a distinct service and a source of feedback. Keep a school optional. Do not position current completion/Sparks records as validated reading outcomes, and do not treat the existing service portal as a finished multi-practitioner learning platform.

There is substantial reusable work: a recognizable brand, a static web application with family and staff tools, Firebase integrations, instructor curriculum, native TCA navigation and practice mechanics, and initial tests/runbooks. The strategic gap is a complete, reliable reading experience whose learning evidence and value survive outside the founder's own services. The immediate technical gap is trust: authorization, durable identity/progress, honest outcome records, consent, and dependable service transactions.

The user supplies the backing educator's experience as ten years in education, a Dean role, and over five years specializing in SPED. This is the working founder context; no specific certification, employer endorsement, student outcomes, or licensed-instrument qualification is inferred. The educator should own instructional scope, content/rubric review, and interpretation rather than only endorse marketing.

## Review navigation

1. [Findings](findings.md) — 44 evidence-linked findings with consequence and required focus.
2. [System map](system-map.md) — frontend, native actions/effects, all 24 backend handlers, data, Storage, and infrastructure boundaries.
3. [Recommended sequencing](sequencing.md) — immediate containment, foundations, product slice, pilot, paid release, and conditional school-market work.
4. [Complete ticket index](ticket-index.md) — 76 linked tickets, owners, priorities, dependencies, estimates, and finding coverage.
5. [Epics](epics.md) — ten outcomes and their ticket groups.
6. [Architecture/API proposal](architecture-proposal.md) — proposed boundaries and contracts requiring review, not approved implementation decisions.
7. [Validation plan](validation-plan.md) — test inventory, failure scenarios, release evidence, and manual evaluation.
8. [Source register](sources.md), [route inventory](route-inventory.md), [source manifest](evidence/source-manifest.json), [verification summary](evidence/verification-summary.json), and [packet validation](evidence/document-validation.json).
9. [Machine-readable tickets](tickets.json), [CSV](tickets.csv), and [machine-readable findings](findings.json).

Individual tickets are in [`docs/tasks/learning-product`](../../../tasks/learning-product). Ticket IDs are new and do not overwrite historic `H*`, `S*`, or native sprint identifiers. The original [build audit](../build-audit.md) and [repair handoff](../repair-progress.md) remain historical evidence.

## What this audit did

The five audit phases were performed: (1) boundary mapping, (2) logic and trust-gap detection, (3) cross-layer wiring analysis, (4) test-evidence review, and (5) findings/backlog production. Source/config discovery and scans preceded the deeper traces. The scope was inferred directly from the user's full-product request; no additional product input was needed to produce review proposals.

- Inventoried 58 web page files, 38 web component files, 34 library files, 31 Functions TypeScript files, 38 native Swift source files, 12 native test files, 42 curriculum Markdown files, four workflow files, and supporting configs/scripts/assets. These are file counts, not feature completion percentages.
- Traced principal web/Swift/Firebase/payment/document/email flows and compared client writes, rules, server triggers, DTOs, curriculum descriptions, and deployment behavior.
- Re-ran web unit tests, existing security regressions, Functions compilation, and root/backend production dependency scans.
- Added and ran a documentation-owned synthetic emulator probe for twelve additional observations. It confirms current vulnerable/blocked behavior; it is not a passing security regression suite.
- Used same-day prior configured web build, TypeScript check, native simulator, browser, and CI observations where source was unchanged; those are explicitly labeled carried-forward evidence below.
- Reviewed current primary-source privacy/platform/NYCPS guidance for requirements that affect the proposed direction.
- Wrote documentation and reproduction probes only during this audit turn. Earlier uncommitted code repairs remain intact. No deployment, production migration, real payment, family-record inspection, or outbound email/calendar operation was performed.

This is a broad source-based audit with selected dynamic verification, not a claim of line-by-line proof, penetration-test certification, educational validation, or legal approval. Inventory/pattern scans cover the full listed surface; deep manual tracing concentrates on principal flows and consequential trust boundaries. Runtime behavior of every UI page and every deployed service was not exercised. Remaining verification work has tickets and release gates.

## Verification and limits

| Check | Result | Evidence and interpretation |
| --- | --- | --- |
| Web unit tests, current pass | **41 passed** | [Output](evidence/unit-tests.txt); includes four tests of actual auth-provider code with deterministic adapters |
| Family-access rules regression, current pass | **17 passed** | [Output](evidence/security-tests.txt); validates local A01/A02 repair and permitted controls |
| Extended rule probes, current pass | **12 expected observations reproduced** | [Results](evidence/extended-rules-results.json); several observations intentionally demonstrate exposures/denials |
| Functions TypeScript build, current pass | **Passed** | [Output](evidence/functions-build.txt); local runtime differs from declared Node 22 |
| Root production dependency scan | **23 flagged packages** | [JSON](evidence/web-dependency-audit.json): 2 critical, 8 high, 12 moderate, 1 low |
| Functions production dependency scan | **22 flagged packages** | [JSON](evidence/functions-dependency-audit.json): 2 critical, 5 high, 13 moderate, 2 low |
| Web configured export and TypeScript | **Passed, carried from immediately preceding repair turn** | [Repair handoff](../repair-progress.md); no app code changed during this audit turn |
| Native simulator tests/build | **95 passed, carried from same-day original audit** | [Original verification](../evidence/verification-summary.json); native source unchanged; no new real-device test |
| Marketing E2E | **7 passed, 2 stale-deadline failures, carried forward** | [Original output](../evidence/marketing-tests.txt); not re-run against production |
| Desktop/mobile routing/layout | **18 observations, carried forward** | [Original browser evidence](../evidence/browser-results.json); confirms deep-link/homepage fallback and missing program H1 |
| Production configuration, billing mappings, tokens, backups, IAM | **Not verified** | Read-only operational verification and controlled release tasks are explicit in the backlog |
| App Store Connect, real-device accessibility, cohort outcomes, paid demand | **Not verified** | Build artifacts and credentials in comments are not evidence of these outcomes |

Current tests use `demo-iep-security`; extended probes use `demo-iep-direction`, both on loopback Firestore/Storage ports 39188/39299. They do not use real family or provider data. npm scan exit code 1 indicates advisories were reported, not that parsing failed. See the validation plan for reproduction and limits of emulator index verification.

## Planning scorecard

This heuristic scores **evidence of readiness for the proposed independent product**, not percentage of code built or audit completeness. Scale: 0 absent; 1 partial/known consequential gaps; 2 implemented foundation with partial tests; 3 critical integration verified in isolation; 4 target-user/operational validation demonstrated. Android is not present and is excluded. Production unknowns prevent assigning validated-operational scores.

| Category | Web / adult product (0–4) | Native learning (0–4) | Backend / operations (0–4) | Total |
| --- | --- | --- | --- | --- |
| Product boundary and coherent end-to-end path | 2 | 2 | 2 | 6/12 |
| Logic and authorization correctness | 1 | 1 | 1 | 3/12 |
| Cross-layer lifecycle and integration | 1 | 1 | 1 | 3/12 |
| Relevant verification evidence | 2 | 2 | 1 | 5/12 |
| **Overall planning signal** | **6/16** | **6/16** | **5/16** | **17/48** |

The score is deliberately conservative and subjective. The actionable result is the finding/ticket evidence, especially the distinction between useful foundations and unverified learning/customer outcomes. Passing unit tests cannot raise a learning-validity score on their own.

## Investment changes

| Increase focus now | Retain and repair | Defer until evidence justifies it |
| --- | --- | --- |
| Narrow learner/reading outcome, educator-reviewed content and rubrics | Brand, typography/assets, reusable native navigation and practice controls | Facility/school formation as a software dependency |
| Consent, adult controls, scoped identity and durable progress | Firebase foundation, owner/admin protection, local A01/A02 repair | Broad literacy/math node expansion and decorative world economy |
| Complete reading quest, explicit help, fresh independent tasks, adult evidence | Existing tutoring/bookings/billing and staff service obligations | Student-facing generative chat, voice scoring, automated diagnoses |
| Safe environments, meaningful tests, recovery, monitoring, release gates | Existing instructor materials and assessment capture with corrected provenance | District SIS/SSO, large-enterprise tenancy, Android or full browser parity without device demand |
| External family/practitioner usability and paid-demand evidence | Useful runbooks, revised for actual deployments | Paid acquisition based on unsupported gains or unverified testimonials |

## Completion requirements

These apply to every ticket, scaled to its risk and artifact type:

- Independent code/content/document review with an accountable owner; instructional work requires educator review.
- Given/When/Then criteria demonstrated with linked evidence, including consequential error, authorization, concurrency, and lifecycle cases. Test actual code/contracts; do not mirror logic solely to obtain a pass.
- For changed business logic, measure meaningful coverage and aim for at least 80% of the changed testable logic, while requiring full coverage of identified critical cases. A percentage cannot replace a missing trust-boundary test. Documentation-only or reversible cosmetic changes do not require artificial unit tests.
- Update affected schemas/API specifications and record architectural decisions after approval. Proposed RFCs in this packet are not accepted ADRs.
- For migrations, provide a synthetic dry-run, idempotent resume, counts/identity checks, access checks, compatibility plan, and safe recovery. A privacy fix cannot roll back to data exposure.
- UI work includes design/accessibility QA, useful empty/loading/error states, and preservation of input where retry is safe.
- Relevant builds/type/lint checks pass with no new warnings; use release flags where justified, with owner/expiry and server enforcement for safety-critical flags.
- Update runbooks, support instructions, retention/consent disclosures, and source-of-truth status as relevant.
- Distinguish **implemented**, **tested locally**, **verified in staging**, **deployed**, and **verified operationally**. TASK-LP-006 is currently only in the first two states.

## Review decisions still required

The packet is complete for review without assuming answers to these decisions: initial learner/prerequisite band; first reading skill; educator review capacity; free/paid digital promise; initial device/channel coverage; consent/retention model reviewed by qualified advisers; pilot measures/stop criteria; and named release/support owners. Each decision has an executable ticket. No implementation authorization or real-world study approval is inferred from producing this backlog.
