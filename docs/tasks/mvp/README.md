# IEP & Thrive MVP backlog

This is the implementable backlog for the smallest honest experiment: whether a child aged
8–11 who opens IEP & Thrive alone, with no adult present, comes back in week eight. The source of
truth is [ADR-000](../../architecture/ADR-000-mvp-architecture-decisions.md), followed by the
product brief, growth timeline, and the current iOS source. Read [epics.md](epics.md) for the
outcome and definition of done for each workstream, then use the ticket index below to open the
one ticket assigned to a sprint.

Every ticket is `Proposed — review required`; points are planning estimates, not delivery
commitments. A ticket is not approved merely because it appears here. Dependencies name ticket
IDs, and a design dependency means the named design-studio handoff must exist before the sprint
that consumes it.

## Ticket index

| ID | Title | Epic | Points | Sprint | Design dependency |
| --- | --- | --- | ---: | ---: | --- |
| [TASK-MVP-001](TASK-MVP-001.md) | Remove third-party telemetry and launch networking from the free path | M1 | 8 | 1 | None |
| [TASK-MVP-002](TASK-MVP-002.md) | Integrate Declared Age Range API with immediate signal deletion | M1 | 5 | 1 | Age-range entry and deletion states |
| [TASK-MVP-003](TASK-MVP-003.md) | Add numeric parental gate and enter Kids Category | M1 | 3 | 2 | Numeric gate and Kids Category entry states |
| [TASK-MVP-004](TASK-MVP-004.md) | Publish the information security programme | M1 | 3 | 1 | None |
| [TASK-MVP-005](TASK-MVP-005.md) | Publish the data retention policy | M1 | 3 | 1 | None |
| [TASK-MVP-006](TASK-MVP-006.md) | Remove the automatic three-mission access interruption | M2 | 5 | 1 | Uninterrupted free-path session flow |
| [TASK-MVP-007](TASK-MVP-007.md) | Remove non-engine-backed literacy entries | M2 | 5 | 1 | Truthful journey states |
| [TASK-MVP-008](TASK-MVP-008.md) | Launch directly into the first learning item | M2 | 5 | 2 | First-session launch flow |
| [TASK-MVP-009](TASK-MVP-009.md) | Correct tracer scale normalization | M2 | 5 | 2 | Tracing surface scale QA |
| [TASK-MVP-010](TASK-MVP-010.md) | Raise the amber token to accessible contrast | M2 | 3 | 2 | Accessible warning-token audit |
| [TASK-MVP-011](TASK-MVP-011.md) | Define the versioned curriculum JSON schema | M3 | 5 | 2 | None |
| [TASK-MVP-012](TASK-MVP-012.md) | Build the curriculum validator | M3 | 8 | 3 | None |
| [TASK-MVP-013](TASK-MVP-013.md) | Fail CI on invalid curriculum content | M3 | 3 | 3 | None |
| [TASK-MVP-014](TASK-MVP-014.md) | Define the first-class skill taxonomy | M3 | 5 | 3 | None |
| [TASK-MVP-015](TASK-MVP-015.md) | Migrate Swift curriculum literals into the corpus | M3 | 8 | 3 | None |
| [TASK-MVP-016](TASK-MVP-016.md) | Author digraph level definitions | M4 | 5 | 4 | None |
| [TASK-MVP-017](TASK-MVP-017.md) | Author blend level definitions | M4 | 5 | 4 | None |
| [TASK-MVP-018](TASK-MVP-018.md) | Author vowel-team level definitions | M4 | 5 | 5 | None |
| [TASK-MVP-019](TASK-MVP-019.md) | Author r-controlled-vowel level definitions | M4 | 5 | 5 | None |
| [TASK-MVP-020](TASK-MVP-020.md) | Author closed-syllable level definitions | M4 | 5 | 6 | None |
| [TASK-MVP-021](TASK-MVP-021.md) | Author open-syllable level definitions | M4 | 5 | 7 | None |
| [TASK-MVP-022](TASK-MVP-022.md) | Record the phoneme and grapheme audio set | M5 | 5 | 2 | None |
| [TASK-MVP-023](TASK-MVP-023.md) | Record the example-word audio set | M5 | 5 | 2 | None |
| [TASK-MVP-024](TASK-MVP-024.md) | Record instruction and encouragement audio | M5 | 3 | 3 | None |
| [TASK-MVP-025](TASK-MVP-025.md) | Replace synthesis with a retained audio player | M5 | 8 | 3 | None |
| [TASK-MVP-026](TASK-MVP-026.md) | Implement the pure BlendingEngine | M6 | 8 | 4 | None |
| [TASK-MVP-027](TASK-MVP-027.md) | Implement the pure WordBuildingEngine | M6 | 8 | 4 | None |
| [TASK-MVP-028](TASK-MVP-028.md) | Connect literacy sessions to teaching engines | M6 | 5 | 5 | Literacy engine state map |
| [TASK-MVP-029](TASK-MVP-029.md) | Implement inferred, easy-biased placement | M7 | 8 | 5 | None |
| [TASK-MVP-030](TASK-MVP-030.md) | Implement mastery and spaced-review pacing | M7 | 8 | 6 | None |
| [TASK-MVP-031](TASK-MVP-031.md) | Add skippable narration and clean session exit | M7 | 5 | 7 | Skippable narration and clean-exit states |
| [TASK-MVP-032](TASK-MVP-032.md) | Persist skill evidence with versioned local records | M7 | 5 | 8 | None |
| [TASK-MVP-033](TASK-MVP-033.md) | Record aggregate on-device measurement counters | M8 | 5 | 9 | None |
| [TASK-MVP-034](TASK-MVP-034.md) | Add the consent artifact and cohort enrollment flow | M8 | 5 | 12 | Cohort consent and code entry |
| [TASK-MVP-035](TASK-MVP-035.md) | Implement the single consented cohort upload Function | M8 | 8 | 12 | None |
| [TASK-MVP-036](TASK-MVP-036.md) | Approve the retention measurement plan | M8 | 3 | 12 | None |
| [TASK-MVP-037](TASK-MVP-037.md) | Recruit and instrument a 30–50-child cohort | M8 | 3 | 13 | None |
| [TASK-MVP-038](TASK-MVP-038.md) | Reduce the web to five static pages | M9 | 8 | 8 | Static five-page information architecture and wireframes |
| [TASK-MVP-039](TASK-MVP-039.md) | Delete removed web routes and client services | M9 | 5 | 9 | None |
| [TASK-MVP-040](TASK-MVP-040.md) | Remove backend rules and Functions for deleted routes | M9 | 5 | 10 | None |
| [TASK-MVP-041](TASK-MVP-041.md) | Enforce the no-network free-path invariant | M10 | 5 | 11 | None |
| [TASK-MVP-042](TASK-MVP-042.md) | Add engine golden-file regression tests | M10 | 5 | 13 | None |
| [TASK-MVP-043](TASK-MVP-043.md) | Verify local migration round-trip and export recovery | M10 | 8 | 13 | None |
| [TASK-MVP-044](TASK-MVP-044.md) | Submit the app and close the release gates | M10 | 8 | 14 | App Store listing screenshots and review-safe metadata |

## Totals by epic

| Epic | Tickets | Points |
| --- | ---: | ---: |
| EPIC-M1 | 5 | 22 |
| EPIC-M2 | 5 | 23 |
| EPIC-M3 | 5 | 29 |
| EPIC-M4 | 6 | 30 |
| EPIC-M5 | 4 | 21 |
| EPIC-M6 | 3 | 21 |
| EPIC-M7 | 4 | 26 |
| EPIC-M8 | 5 | 24 |
| EPIC-M9 | 3 | 18 |
| EPIC-M10 | 4 | 26 |
| **Total** | **44** | **240** |

## Totals by sprint

| Sprint | Dates | Stage | Points |
| ---: | --- | --- | ---: |
| 1 | Sep 14–25, 2026 | Repair | 29 |
| 2 | Sep 28–Oct 9, 2026 | Repair | 31 |
| 3 | Oct 12–23, 2026 | Repair | 35 |
| 4 | Oct 26–Nov 6, 2026 | Teach | 26 |
| 5 | Nov 9–20, 2026 | Teach | 23 |
| 6 | Nov 23–Dec 4, 2026 | Teach | 13 |
| 7 | Dec 7–18, 2026 | Teach | 10 |
| 8 | Dec 21, 2026–Jan 1, 2027 | Teach | 13 |
| 9 | Jan 4–15, 2027 | Teach | 10 |
| 10 | Jan 18–29, 2027 | Teach | 5 |
| 11 | Feb 1–12, 2027 | Teach | 5 |
| 12 | Feb 15–26, 2027 | Measure | 16 |
| 13 | Mar 1–12, 2027 | Measure | 16 |
| 14 | Mar 15–26, 2027 | Measure | 8 |
| **Total** |  |  | **240** |

## Scope rule

No ticket outside EPIC-M1 through EPIC-M10 is in MVP scope. The backlog does not authorize
deployment, merge, or product promises; those require the review and release gates described in
the sprint plan.
