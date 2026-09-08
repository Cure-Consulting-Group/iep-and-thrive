# IEP & Thrive MVP — Product Requirements Document

> Supersedes [PRD-LP-001](../research/2026-09-06-product-brief.md) for MVP scope. PRD-LP-001 remains the substantive research brief; this document consolidates its approved product requirements with the binding decisions in [ADR-000](../architecture/ADR-000-mvp-architecture-decisions.md).

## One-sentence definition

IEP & Thrive is a phone-native, on-device reading product that teaches an 8–11-year-old who is reading below grade level to decode independently, free forever, while preparing a parent-held skill record for a later phase.

## User and buyer

The user is the child: 8–11, reading below grade level, with or eligible for an IEP, and likely already aware that reading is difficult. The child has a phone, more screen time than peers, and opens the app alone. The product must work without a parent, teacher, school, diagnosis, evaluation, or account.

The buyer is the parent whose system did not deliver: eligibility took months, the mandated service was unstaffed, or nobody explained what to do at home. This is an affordability-constrained buyer, not a premium-service buyer. Parents do have alternatives, including direct-to-parent products; our honest difference is an independent phone form factor, a free instructional core, and child agency—not the claim that help is otherwise unavailable.

The referring teacher is a channel participant and ethical stakeholder, not the buyer or product operator. A teacher may recommend the free product without compensation. The exposure of an impermissible business relationship lands on the teacher, so channel design must protect that person.

## Problem and verified gap

The verified gap is systematic decoding instruction on a phone for an 8–11-year-old who can work without an adult beside them. Lexia Core5 and Nessy teach systematically and serve the age range but are not modern phone experiences in the cited comparison. Several phone products are aimed at younger readers or have little review evidence. Parents can buy Nessy directly at approximately $15.50/month or Lexia for Home at $175/year; IEP & Thrive is not solving absence of access in the abstract. It is solving affordability, form factor, independence, and agency.

The incumbent evidence also identifies a product risk: children complain about pacing, repeated remediation, and narration they cannot skip. Instructional rigor and delight must coexist. The product is not a diagnosis and does not replace an evaluation.

## MVP scope

The MVP is the Phase 1 depth and retention experiment. It includes:

- A bundled, systematic decoding sequence authored as versioned JSON, with a published schema and CI validation.
- A first-class skill taxonomy. Skills are the instructional and future-record unit; levels are practice encounters that evidence one or more skills.
- Inferred placement with no placement test. The first session teaches immediately and biases toward starting too easy.
- Decoding interactions sufficient for tracing, blending, and word-building, with skippable instruction and a clean exit.
- Approximately 120 instructional nodes at the MVP floor, enough to cover 72–96 consumed nodes over eight weeks at three to four nodes per 10–15-minute session, with cushion.
- Bundled recorded phoneme, grapheme-name, example-word, instruction, and encouragement audio.
- Local progress on the device. No account, email capture, waitlist, parent portal, learner sync, or paid purchase in MVP.
- A narrow, visible, revocable, parent-consented cohort endpoint for aggregate weekly counters only.
- Five static web pages: what it is, who it is for, why it is free, safety, and support.
- Kids Category positioning subject to the compliance decisions and release gates in the source documents.

## Explicit non-goals

MVP does not include comprehension instruction, diagnostic claims, speech or read-aloud collection, school or district sales, roster sync, SSO, DPA work, classroom teacher operations, parent accounts, exports, multi-child records, subscription checkout, server-side learner records, third-party analytics, third-party advertising, sponsored content, or data sales. The full parent record is a post-MVP phase. The web has no learner surface until Year 3 under ADR-000.

## Functional requirements

1. The app shall open and teach a child without requiring an account, email, evaluation, diagnosis, parent, teacher, school, or subscription.
2. The free learning path shall contain the complete MVP decoding scope and shall not paywall an instructional skill.
3. The first session shall begin instruction immediately and shall infer placement from early performance; it shall not present a placement test.
4. Every instructional level shall declare an existing engine, reference valid skills, and reference valid audio asset IDs; CI shall fail malformed, unreachable, unpronounceable, or missing-asset content.
5. Progress shall attach to skills, never only to level numbers; a level may evidence one or more skills.
6. The curriculum shall include enough authored depth for the approximately 120-node floor and shall not exhaust before the week-eight study window under the stated pacing assumption.
7. Instructional narration shall be skippable, failure shall not trigger a remedial lecture, and the child shall be able to leave a session cleanly.
8. Phonemes, grapheme names, and example words shall use bundled recorded audio; instructional audio shall not use text-to-speech as its phonology source.
9. The free path shall make zero network requests except when a parent explicitly enrolls the device in the consented cohort measurement path.
10. Cohort measurement shall upload only batched aggregate counters under a random participant token, be off by default, visible and revocable, and have no client read path.
11. The app shall persist progress locally using the versioned local schema and provide the export escape hatch required before the first migration.
12. The product shall not collect a child name, email, account identity, voice, or school-supplied record in MVP.
13. The static web export shall expose only the five approved informational/support pages and no learner or authenticated parent surface.
14. Release shall include the lawful Kids Category, COPPA, age-assurance, network-permission, content-integrity, and accessibility gates identified by ADR-000 and the growth timeline.

## Non-functional requirements

- Accessibility target: WCAG 2.2 AA for all user-facing MVP surfaces, including readable text, accessible controls, sufficient contrast, non-audio alternatives where required, and interaction paths that do not depend on precise motor performance.
- Device performance: sessions must remain responsive on the oldest supported iPhone in the declared support matrix. Exact model, OS, cold-launch budget, frame-rate budget, and memory ceiling are open performance-baseline assumptions to be measured before cohort release; no unsupported number is treated as a fact.
- Offline-always: the instructional path shall function without connectivity and make no socket request, with the single consented cohort exception. Content is bundled and updates arrive through the App Store.
- Session length: the primary learning loop is 10–15 minutes, with three sessions per week used for planning and measurement.
- Reliability: missing content, missing audio, unsupported engines, and invalid taxonomy references are build failures, not runtime fallbacks.
- Privacy and safety: no child-directed ads, data sale, third-party analytics, or server-side learner record in MVP.

## Definition of done

Done is not “the build shipped.” Done is a measured eight-week cohort result. A recruited cohort has completed the approved consent flow, aggregate counters are available without identifying the child, and week-eight retention is calculated using the pre-registered definition in [success-metrics.md](success-metrics.md). The result must be compared with the category baseline of roughly 7% monthly churn. If the gate fails, the team stops to fix instruction, content depth, agency, or usability rather than marketing harder. A shipped build without this measured result is an implementation milestone, not MVP completion.

## Open decisions and owners

| Decision | Owner | Timing / effect |
| --- | --- | --- |
| Exact oldest supported iPhone and performance budgets | Engineering | Before cohort release; validates the device NFR |
| WCAG 2.2 AA test method and assistive-technology matrix | Product + accessibility owner | Before cohort release |
| Whether StoreKit purchase satisfies verifiable parental consent | Counsel | Before post-MVP record/upgrade flow; does not block MVP |
| COPPA notice requirement for the internal-operations exception | Counsel | Before record phase; confirms D1 |
| Whether on-device speech processing is “collection” | Counsel | Before any read-aloud feature |
| Whether tracing stroke data is a biometric identifier | Counsel | Before any relaxed-data design |
| Final authored sequence and 120-node corpus acceptance | Educator/content owner | Before content freeze |
| Eight-week cohort recruitment and measurement protocol | Founder + study owner | Before cohort enrollment |

## Source boundary

This PRD does not convert historical school, tutoring, or service-business assumptions into MVP requirements. The old business documents remain historical records. Product and business claims must trace to ADR-000, PRD-LP-001, the product vision, the growth timeline, or an explicitly labeled assumption.
