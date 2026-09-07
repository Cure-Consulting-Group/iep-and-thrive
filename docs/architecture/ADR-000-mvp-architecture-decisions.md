# ADR-000 — MVP architecture decisions

**September 7, 2026. Accepted.** The binding decisions for the MVP defined in
[the delivery roadmap](../research/2026-09-06-growth-timeline.md) and
[PRD-LP-001](../research/2026-09-06-product-brief.md). Every architecture document, ticket and
diagram in this repository derives from this file. Where a later document conflicts with this
one, this one wins until it is superseded by a numbered successor.

These are decisions, not options. The alternatives are recorded so a future reader can see what
was rejected and why, not so the choice can be reopened casually.

---

## D1 — The free tier makes zero network requests

**Decision.** The free product is entirely on-device. No Firebase, no Crashlytics, no Google
Sign-In, no analytics SDK, no content fetch, no crash reporter with a network transport. The app
opens, teaches, and records progress without ever opening a socket.

**Why.** The product thesis is a child alone with a phone and no adult. That posture is
simultaneously our differentiator and the hardest regulatory position available under the amended
COPPA Rule, where a persistent third-party identifier is itself personal information. Shipping
today, the app fires anonymous Firebase Auth on launch and transmits per-item reading failures
keyed to a stable UID. A "collects no personal information" claim is not a description of what we
have; it is a requirement we have to build.

Zero network is also the only version of the claim that is cheap to verify and impossible to
regress accidentally: a test that asserts no outbound request during a full session run is a
one-line invariant, where "we only send anonymised events" is a judgment call re-litigated at
every code review.

**Consequences.**

- Content ships in the app bundle. New levels arrive through App Store updates, not a CDN.
- We lose crash reporting on the free path. Mitigated by MetricKit (first-party, aggregated by
  Apple, no PII, no SDK) and by a heavier automated test suite. This cost is real and budgeted.
- The Kids Category becomes free to enter: it bans third-party analytics, which this decision
  already forbids. We enter it.
- A network-permission assertion test is a release gate, not a nice-to-have.

**Rejected.** Anonymised telemetry with a rotating identifier — still a network request from a
child's device to us, still requires the notice analysis, and buys debugging convenience at the
cost of the only claim that makes teachers comfortable recommending this.

## D2 — Phoneme audio is recorded, never synthesized

**Decision.** Every phoneme, grapheme name and example word is a bundled pre-recorded audio
asset. `AVSpeechSynthesizer` is removed from the instructional path entirely.

**Why.** The shipping `SpeechClient` passes a grapheme to the system synthesizer, which speaks the
letter *name* — "ay" where a child learning to decode must hear /a/. There is no configuration
that fixes this; the synthesizer models text, not phonology. A phonics app that pronounces the
letter names is not a phonics app with a bug, it is teaching the wrong thing.

**Consequences.**

- An audio production workstream exists that nobody had scoped: ~44 phonemes, ~120 example words
  at the MVP floor, plus instruction and encouragement lines. Single voice, consistent room.
- Bundle size grows. At 48kHz mono AAC this is single-digit megabytes and is not a constraint.
- `SpeechClient` becomes an audio player with a retained engine, a real `stop()`, and completion
  callbacks — which also fixes the interruptibility defect, because the incumbent's single
  loudest complaint is narration a child cannot skip.
- Synthesis may still be used for non-instructional UI text where a screen reader would anyway.

## D3 — Content is data, validated in CI, never code

**Decision.** The curriculum is a versioned JSON corpus in the repository with a published schema,
validated by a CI job that fails the build on a malformed, unreachable, or unpronounceable entry.
Level definitions stop being Swift struct literals.

**Why.** The MVP requires ~90 new levels and Year 2 requires ~426 more. That authoring is done by
an educator against a scope and sequence, not by an engineer. It must not require a Swift
compiler, a pull request review of source code, or an engineer in the loop. It is also the exact
place the current build failed: six "levels" ship with no engine behind them, and the app would
speak the string `main-idea` and ask a child to trace it. A schema with a required `engine` field
makes that specific failure unrepresentable.

**Consequences.**

- A content schema, a validator, and a CI gate are MVP-scope engineering work.
- Every level names its engine explicitly; an engine that does not exist is a build failure.
- Every level references audio assets by id; a missing asset is a build failure.
- The 98-row authored scope and sequence becomes the seed corpus.

## D4 — Skills are a first-class taxonomy, separate from levels

**Decision.** A `Skill` is the unit of instruction and the unit of the record. A `Level` is one
practice encounter with one or more skills. Progress is tracked against skills, never against
levels.

**Why.** The thing we sell later is a parent-held record that means something in a CSE meeting.
"Completed level 47" means nothing there. "Can decode closed syllables with short vowels;
emerging on consonant digraphs" is the artifact a parent can use. Building the record on a level
counter would force a migration precisely when we are also introducing accounts and consent — the
worst possible moment to reshape live data. Deciding it now costs nothing.

**Consequences.**

- The skill taxonomy is authored alongside the content and is part of the MVP, even though the
  record itself is not.
- Mastery state attaches to skills. Levels are how mastery is evidenced.
- The Year 2 record ships as a read of a data model that already exists.

## D5 — Placement is inferred, never assessed

**Decision.** No placement test. The first session begins teaching immediately; the placement
engine infers position from performance on early items and adjusts silently, biased toward
starting too easy.

**Why.** Our user is a child who already knows they are behind and has been repeatedly measured
by adults. An assessment as the first experience is the highest-risk screen in the product. The
bias direction is asymmetric: starting too easy costs a few minutes of boredom; starting too hard
loses the child permanently and we never learn why.

**Consequences.**

- Placement quality is measured by week-two continuation, not by placement accuracy.
- The engine must be able to advance quickly when a child is clearly ahead, so "too easy" does not
  become its own retention failure.

## D6 — The only free-tier network path is consented cohort measurement

**Decision.** One narrow exception to D1. A parent in the recruited MVP cohort enters a code we
issue. That unlocks a batched, weekly upload of aggregate counters — sessions started, skills
reached, days since first open — under a device-generated random participant token with no name,
no account, and no device identifier. It is off by default, visible, and revocable.

**Why.** We deleted our own instrumentation on purpose, and the gate the entire MVP exists to
answer is a retention number. Measuring it requires either breaking D1 for everyone or building a
narrow, consented path for a few dozen families. The second is the only one compatible with the
product.

**Consequences.**

- Cohort upload is MVP-scope backend work: one authenticated-by-code Function, one write-only
  collection, deny-by-default rules, no read path from the client.
- The consent artifact is a real document the parent signs, not a checkbox.
- The token is meaningless outside the cohort study and is destroyed with it.

## D7 — Personal information enters at the parent account, and not one step earlier

**Decision.** Accounts, verifiable parental consent, Firebase Auth, Firestore sync and StoreKit
purchase all arrive together in the post-MVP record phase. Sign in with Apple is the identity
provider. There is no account, no email capture, no waitlist, and no "save your progress" prompt
in the MVP.

**Why.** Verifiable parental consent is expensive and legally exacting, and it is only required
once personal information is collected. Collecting nothing until there is something worth
protecting means the MVP carries none of that burden, and the consent flow is built once, at the
moment the law actually attaches, against a real value exchange the parent already wants.

**Consequences.**

- The MVP has no backend for learners at all. Firebase in the MVP serves the marketing site and
  the cohort endpoint, nothing else.
- Sign in with Apple's private relay is the default, so we hold a relay address rather than a real
  one.
- Whether StoreKit purchase satisfies verifiable parental consent is an open question for counsel
  and it changes the upgrade flow materially. It does not block anything in the MVP.
- Local-to-cloud progress migration is a designed, tested path, not an afterthought — the child
  has months of local history at the moment the parent first signs up.

## D8 — The web is a static export with no learner surface until Year 3

**Decision.** The web app is reduced from 53 routes to five static pages: what it is, who it is
for, why it is free, how a parent knows it is safe, and support. No authentication, no Firestore
reads, no portal, no instructor operations. `output: 'export'` on Firebase Hosting, as today.

**Why.** 54% of the current routes are instructor operations for a business we are not in, and
none of them serve a learner. Keeping them costs security surface, test time, and review
attention on every change, for a product nobody uses. The parent surface arrives with the record;
the learner surface arrives in Year 3 when the library computer and the school Chromebook become
the access story.

**Consequences.**

- A large deletion is MVP-scope work, and the Firestore rules and Functions that served those
  routes are deleted with them.
- The trust page is a real content deliverable, not boilerplate: it is what a teacher reads before
  recommending us and what a parent reads before handing over a phone.

## D9 — Clean Architecture boundaries, enforced by the module graph

**Decision.** Three layers with a one-way dependency rule, per Cure standards:
`Domain` (pure Swift, no imports beyond Foundation) → `Data` (persistence, bundle loading,
the one network client) → `Presentation` (SwiftUI + TCA). The engines — tracing, blending,
word building, placement, pacing — live in Domain and are pure.

**Why.** The engines encode the pedagogy and are the part that must be provably correct; pure
functions over value types are testable without a simulator, a device, or a running app, and the
80% coverage standard is otherwise unreachable on a SwiftUI codebase. It also makes D1
structurally enforceable: exactly one type in Data may open a socket, and a test asserts nothing
else can.

**Consequences.**

- Domain has no Firebase, no SwiftData, no SwiftUI import. Enforced by a build-phase check.
- A pedagogy change is a Domain change with unit tests and no UI work.

## D10 — SwiftData for local persistence, with an explicit schema version

**Decision.** SwiftData, with a stamped schema version on every persisted record and a migration
path written before the second schema ever ships.

**Why.** The child accumulates months of irreplaceable local history that exists in exactly one
place, with no server copy by design. A botched local migration is unrecoverable data loss for a
real family. The repository already has a migration runner with checkpointing, quarantine and
idempotency for Firestore; local persistence gets the same discipline rather than less.

**Consequences.**

- Expand-migrate-contract applies locally too. No destructive local migration, ever.
- An export-to-file escape hatch exists before the first migration ships, so a parent can rescue
  a record if a migration fails.

---

## What this means for the MVP, in one table

| Concern | MVP | Post-MVP (the record) |
| --- | --- | --- |
| Learner identity | none | Sign in with Apple, parent-held |
| Learner data location | device only | device, synced after consent |
| Network from a child's device | none, except consented cohort upload | authenticated sync |
| Content delivery | app bundle | app bundle |
| Crash / diagnostics | MetricKit | MetricKit |
| Payments | none | StoreKit 2, $49/yr |
| Backend | marketing site + one cohort endpoint | Functions v2, Firestore, deny-by-default |
| Web | 5 static pages | parent record and export |

## Open questions, owned and dated

| # | Question | Owner | Blocks |
| --- | --- | --- | --- |
| Q1 | Does StoreKit purchase satisfy verifiable parental consent? | counsel | upgrade flow design, post-MVP |
| Q2 | Did the 2025 COPPA amendments add a notice requirement to the internal-operations exception? | counsel | nothing; confirms D1 |
| Q3 | Does on-device-only speech processing constitute "collection"? | counsel | any future read-aloud check |
| Q4 | Does stroke data from the tracing canvas qualify as a biometric identifier? | counsel | nothing under D1; matters if D1 is ever relaxed |

None of these block MVP engineering. All four should be answered before the record phase begins.
