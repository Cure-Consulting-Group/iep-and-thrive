# TASK-MVP-038 — Reduce the web to five static pages

| Field | Value |
| --- | --- |
| Epic | EPIC-M9 — Web reduction |
| Priority / release gate | P1 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Web engineer + product writer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-001 |
| Design | design-studio — static five-page information architecture and wireframes, 5 pages |

## Problem and intended outcome

The existing web app carries many dynamic routes and services unrelated to the focused reading MVP.
Reduce it to five static pages: what it is, who it is for, why it is free, how it is safe, and
support.

## Implementation scope

1. Implement the approved five-page information architecture as a static export with no learner
   surface, authentication, database reads, or client data writes.
2. Preserve accessible semantics, metadata, support contact path, and truthful product claims from
   the approved brief; do not introduce new commercial or institutional flows.
3. Configure Firebase Hosting/export output and add route inventory tests that fail on any extra
   dynamic page.

## Acceptance criteria

- **Given** a production export, **when** the route inventory runs, **then** exactly the five
  approved static pages are present and no page performs a client data read or write.
- **Given** a visitor opens each page with JavaScript disabled, **when** the static files load,
  **then** the page content, navigation, metadata, and support path are usable.
- **Given** a page describes the MVP, **when** content review runs, **then** its claims match the
  product brief and safety artifacts without unsupported mastery or retention claims.

## Validation and evidence

Run static export, route inventory, link checker, accessibility audit, and JavaScript-disabled smoke
tests. Attach design QA and a five-page URL map.

## Rollout, migration, and recovery

Build the static pages before deleting routes. Keep the last valid export available for hosting
rollback; do not preserve removed dynamic behavior as hidden rewrites.

## Source evidence

- [ADR-000 D8](../../architecture/ADR-000-mvp-architecture-decisions.md#d8--the-web-is-a-static-export-with-no-learner-surface-until-year-3)
- [product brief](../../research/2026-09-06-product-brief.md)

## Definition of done

Code review is approved; new code has at least 80% coverage where applicable; inputs and routes are
validated; no secrets are hardcoded; five-page export and accessibility evidence pass; and design
QA signs off.
