# MVP epics

These ten epics are the complete MVP boundary. Together they create a lawful, truthful,
on-device decoding product, enough instruction to reach week eight, and a measurement path that
can answer the retention question without turning the free path into a telemetry product.

## EPIC-M1 — Lawful posture

The free path must be capable of running without third-party telemetry while satisfying the
age-range, parental-gate, Kids Category, and written-policy obligations that apply to a child-
directed app. This epic implements ADR-000 D1, D6, and D7's boundary around personal information.

Tickets: [001](TASK-MVP-001.md), [002](TASK-MVP-002.md), [003](TASK-MVP-003.md),
[004](TASK-MVP-004.md), [005](TASK-MVP-005.md).

Dependencies: ADR-000 and current app configuration; ticket 001 is the technical prerequisite for
the age and gate decisions. It has no dependency on the teaching engines.

Definition of done: a cold free-path launch makes no third-party telemetry request; the declared
age signal is used and deleted; the numeric gate is covered by tests; Kids Category submission
metadata is recorded; and both written policies are approved, versioned, and linked from the
release package.

## EPIC-M2 — A truthful app

The child must see a real learning path immediately, with no automatic access interruption and no
level that claims to teach an engine the app does not have. This epic implements the product brief's
agency thesis and ADR-000 D2, D5, and D9 consequences where the current UI misrepresents behavior.

Tickets: [006](TASK-MVP-006.md), [007](TASK-MVP-007.md), [008](TASK-MVP-008.md),
[009](TASK-MVP-009.md), [010](TASK-MVP-010.md).

Dependencies: 001 for the launch boundary; 011 and 012 later validate that future content cannot
reintroduce phantom levels.

Definition of done: a child can complete any bundled free level without an automatic commerce or
access interruption; the six non-engine-backed entries are absent; first launch reaches the first
learning item; tracer geometry is stable across supported canvas sizes; and the warning token meets
the recorded contrast threshold.

## EPIC-M3 — Content platform

Curriculum becomes versioned data, validated before it can ship, with skills separate from level
encounters. This is the implementation of ADR-000 D3 and D4 and is the contract that lets an
educator author the remaining sequence without changing Swift source.

Tickets: [011](TASK-MVP-011.md), [012](TASK-MVP-012.md), [013](TASK-MVP-013.md),
[014](TASK-MVP-014.md), [015](TASK-MVP-015.md).

Dependencies: 001 and the existing Swift curriculum. Curriculum authoring tickets 016–021 can
start against the published schema as soon as 011 is reviewed; 015 is the migration checkpoint.

Definition of done: the corpus has a published schema, validator, CI gate, skill taxonomy, and
zero production level literals in `CurriculumClient`; invalid, unreachable, engine-missing, or
audio-missing entries fail the build before an archive is produced.

## EPIC-M4 — Curriculum authoring

An educator authors roughly 90 new level definitions against the existing 98-row scope and
sequence, taking the app to about 120 engine-backed levels. The work covers digraphs, blends,
vowel teams, r-controlled vowels, closed syllables, and open syllables; it is content work, not
engineering.

Tickets: [016](TASK-MVP-016.md), [017](TASK-MVP-017.md), [018](TASK-MVP-018.md),
[019](TASK-MVP-019.md), [020](TASK-MVP-020.md), [021](TASK-MVP-021.md).

Dependencies: 011 and 014 for the authoring contract; 026–027 must exist before authored entries
can reference blending or word-building engines. This work runs in parallel from sprint 2 and does
not wait for repair completion.

Definition of done: the educator has reviewed each batch, each batch has the required skills,
engine, grapheme/word examples, sequencing position, and audio IDs, and the full corpus validates
with about 120 reachable levels and no additions outside the approved decoding scope.

## EPIC-M5 — Audio production

Instructional audio is recorded once in a consistent voice and room: roughly 44 phoneme or
grapheme sounds, 120 example words, and the instruction and encouragement lines. This implements
ADR-000 D2, including a retained player with a real stop operation so a child can interrupt audio.

Tickets: [022](TASK-MVP-022.md), [023](TASK-MVP-023.md), [024](TASK-MVP-024.md),
[025](TASK-MVP-025.md).

Dependencies: 011 for audio IDs and 026–028 for the engine call sites. Recording runs in parallel
from sprint 2 and does not wait for repair completion.

Definition of done: every referenced MVP audio ID maps to one bundled asset, the production log
records one voice and room, missing assets fail validation, synthesis is absent from instructional
playback, and `stop()` interrupts active playback with a passing unit test.

## EPIC-M6 — Teaching engines

The app gains the two minimum interactions that tracing cannot provide: blending and word building
with Elkonin boxes. Engines are pure Domain value types under ADR-000 D9, so pedagogy is testable
without SwiftUI, persistence, Firebase, or a network.

Tickets: [026](TASK-MVP-026.md), [027](TASK-MVP-027.md), [028](TASK-MVP-028.md).

Dependencies: 014 for skill IDs, 022–025 for audio contracts, and 015 for corpus loading. 029–032
consume the engine events.

Definition of done: both engines have deterministic input/output contracts, edge cases and invalid
inputs are tested at 80% or better new-code coverage, and a real literacy session can render the
engine state, accept a response, record the result, and exit without a network.

## EPIC-M7 — Adaptive core

Placement infers a starting point from early performance without an assessment and is deliberately
biased toward too easy. Pacing records skill mastery, schedules spaced review, skips narration on
request, and permits a clean exit at any moment; this implements ADR-000 D4, D5, D9, and D10.

Tickets: [029](TASK-MVP-029.md), [030](TASK-MVP-030.md), [031](TASK-MVP-031.md),
[032](TASK-MVP-032.md).

Dependencies: 015, 026–028, and the SwiftData model. 033 consumes the stable session and skill
events. This epic is on the critical path to a trustworthy week-eight answer.

Definition of done: deterministic fixtures show easy-biased placement, mastery plus scheduled
review, skipped narration, and clean exits; skill evidence survives relaunch with a schema version;
and no failure path forces a remedial lecture before the child can continue or leave.

## EPIC-M8 — Measurement

Measurement is aggregate, visible, off by default, and limited to a consented recruited cohort.
It implements ADR-000 D6 while preserving D1 for every non-consented free-path user: on-device
counters, one authenticated-by-code write-only Function, the signed consent artifact, plan, and
30–50-child cohort.

Tickets: [033](TASK-MVP-033.md), [034](TASK-MVP-034.md), [035](TASK-MVP-035.md),
[036](TASK-MVP-036.md), [037](TASK-MVP-037.md).

Dependencies: 032 for stable skill/session events, 001 for the network boundary, and 033–036 in
sequence for enrollment and recruitment. This epic starts only after the measurement contract is
reviewed and is the critical path to the May answer.

Definition of done: an unenrolled device records locally and sends nothing; an enrolled device
uploads only the approved aggregate counters on the weekly batch; consent is revocable; the
Function has validated inputs, deny-by-default rules, no read path, and no secrets in source; and
the cohort roster, plan, and analysis-ready export are complete for 30–50 children.

## EPIC-M9 — Web reduction

The legacy web surface is reduced to five static pages that explain the product, audience, free
core, safety posture, and support. This implements ADR-000 D8 by removing learner, account,
operations, and data-service surface that does not support the MVP experiment.

Tickets: [038](TASK-MVP-038.md), [039](TASK-MVP-039.md), [040](TASK-MVP-040.md).

Dependencies: 038's approved information architecture, then 039 before 040. This work can proceed
in parallel with teaching and does not block the on-device lesson loop until release packaging.

Definition of done: a static export contains exactly five approved pages, hosting serves those
pages without client data reads, removed route code and client services are gone, and rules and
Functions no longer expose deleted operations.

## EPIC-M10 — Release

Release evidence makes the MVP claim durable: the free path is proven network-silent, engines are
protected by golden files, local records can migrate and recover, and the App Store package passes
the gates. This implements ADR-000 D1, D9, and D10 and closes the March 2027 release milestone.

Tickets: [041](TASK-MVP-041.md), [042](TASK-MVP-042.md), [043](TASK-MVP-043.md),
[044](TASK-MVP-044.md).

Dependencies: all product-critical tickets, especially 001, 013, 015, 025, 028, 032, 035, 040,
and 041–043 before submission. The release candidate is the final critical-path handoff.

Definition of done: the invariant, golden-file, and migration/export suites pass in CI and on a
release candidate; the archive is signed and submitted with Kids Category and policy evidence; the
March ship gate is recorded; and the May measurement readout date and owner are on the release
checklist.
