# TASK-MVP-039 — Delete removed web routes and client services

| Field | Value |
| --- | --- |
| Epic | EPIC-M9 — Web reduction |
| Priority / release gate | P1 / Stage 2 gate |
| Status | Proposed — review required |
| Proposed owner | Web engineer |
| Estimate | 5 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-038 |
| Design | None |

## Problem and intended outcome

Static export is not complete while removed route components, client data services, and dynamic
rewrites remain in the repository. Delete the unused surface so later changes cannot accidentally
re-enable it.

## Implementation scope

1. Inventory route files, client services, providers, middleware, rewrites, and tests not used by
   the five approved static pages.
2. Delete those files and references; update build configuration, imports, and route tests so the
   export remains deterministic.
3. Preserve only the support contact mechanism and static content dependencies required by 038.

## Acceptance criteria

- **Given** the repository after cleanup, **when** a route/service inventory runs, **then** only
  dependencies of the five static pages remain.
- **Given** a production static build, **when** it is served without backend credentials, **then**
  all five pages load and no client service attempts a data request.
- **Given** a removed route URL, **when** it is requested, **then** it returns the documented static
  fallback and does not reach a deleted handler.

## Validation and evidence

Run typecheck, static build, route inventory, dead-reference search, and JavaScript-disabled smoke
tests. Attach the deletion manifest and build output.

## Rollout, migration, and recovery

Keep the five-page export and a tagged pre-deletion build for rollback. Do not restore deleted code
unless a release gate identifies a documented support dependency.

## Source evidence

- [next config](../../../next.config.mjs)
- [app routes](../../../app)
- [lib](../../../lib)

## Definition of done

Code review is approved; new code has at least 80% coverage where applicable; inputs are validated;
no secrets are hardcoded; dead references are gone; and the static build passes without credentials.
