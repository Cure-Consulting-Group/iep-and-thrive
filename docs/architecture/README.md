# IEP & Thrive architecture

This directory turns the ten accepted decisions in
[ADR-000](ADR-000-mvp-architecture-decisions.md) into an implementable design. ADR-000 remains
the authority: if a document here conflicts with it, follow ADR-000 and record the conflict before
writing code. Product intent lives in [PRD-LP-001](../research/2026-09-06-product-brief.md), the
[product vision](../research/2026-09-06-product-vision.md), and the
[growth timeline](../research/2026-09-06-growth-timeline.md); these documents do not repeat them.

## Reading order

A new engineer should read ADR-000 first, then `system-overview.md`. Read the client, data,
content, and flow documents before taking an iOS ticket. Read privacy before adding a dependency,
transport, identifier, diagnostic, or age-related behavior. Read the backend and web documents
before changing Firebase or Next.js. Finish with the testing strategy, because every component
described here has a corresponding release gate.

| Order | Document | What it makes implementable | ADR-000 decisions |
| --- | --- | --- | --- |
| 0 | [ADR-000](ADR-000-mvp-architecture-decisions.md) | Binding constraints and rejected alternatives | D1-D10 |
| 1 | [System overview](system-overview.md) | MVP and post-MVP boundaries, actors, containers, and network topology | D1, D6-D9 |
| 2 | [iOS client architecture](ios-client-architecture.md) | Module boundaries, pure teaching engines, TCA feature ownership, and structured-concurrency rules | D1-D5, D7, D9-D10 |
| 3 | [Data model](data-model.md) | Skill-indexed domain model, SwiftData schema, cloud schema, sync classification, and migrations | D4, D6-D7, D10 |
| 4 | [Content pipeline](content-pipeline.md) | Versioned level and taxonomy JSON, educator workflow, validator, and CI contract | D2-D4 |
| 5 | [Flows](flows.md) | Failure-aware runtime sequences for first launch, teaching, placement, cohort upload, and record upgrade | D1-D7, D10 |
| 6 | [Privacy architecture](privacy-architecture.md) | Enforced no-network boundary, data classes, MetricKit posture, child-app controls, and counsel interfaces | D1-D2, D6-D7, D9-D10 |
| 7 | [Backend architecture](backend-architecture.md) | The single MVP ingest contract and the post-MVP parent-record backend | D6-D8, D10 |
| 8 | [Web architecture](web-architecture.md) | Exact 53-to-5 route reduction and deletion boundary | D7-D8 |
| 9 | [Testing strategy](testing-strategy.md) | Test pyramid, 80% new-code standard, golden files, migration tests, and release gates | D1-D5, D9-D10 |

## Phase boundary

The MVP is an on-device teaching app whose default free path opens no socket. Its only network
exception is the separate, off-by-default consented cohort path in D6. The parent account,
personal information, Firestore learning-record sync, Sign in with Apple, and StoreKit purchase
belong to the post-MVP record phase and must not leak into an MVP ticket. The diagrams use
`MVP` and `post-MVP record` labels to keep that boundary visible.

## How to use these documents

An implementation ticket should cite the relevant subsection and its ADR decision, name the
schema or interface it changes, and copy the applicable test gate into its acceptance criteria.
If implementation needs a structural choice not derivable from ADR-000, add it as an open
question in the relevant document and resolve it through a successor ADR. Do not let an
implementation detail silently become a new architecture decision.
