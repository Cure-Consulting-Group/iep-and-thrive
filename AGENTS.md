# IEP & Thrive — repository handoff

## Required session startup

Follow this procedure at the start of every new session and after context loss, without waiting for the user to name these files or provide a special resume prompt:

1. Read the **Current handoff** section at the top of [STATE.md](STATE.md), stopping at the next level-two heading. It is the current checkpoint; the sprint history below is historical.
2. Check the current branch and `git status`. Preserve uncommitted work. If the checkout differs from the handoff branch, inspect the difference before assuming work is missing; do not switch branches or discard work blindly.
3. Recover the active objective, completed work, remaining work, authorization boundary, and next action from that checkpoint. Treat “continue” or “resume” as a request to continue that recorded work; do not ask the user to recap information already recorded.
4. Load only the selected ticket, its necessary dependencies, and linked source/evidence. For a backlog-review checkpoint, read the audit overview and sequencing first. Do not load every ticket, historical guide, or evidence log, or repeat the full audit by default.
5. Proceed with the next authorized action. If the checkpoint is awaiting user review, present the concrete review decisions and recommended order; do not silently start implementing the proposed backlog. Ask only for genuinely missing information that prevents progress.

The latest user instruction controls scope. These startup steps establish context; they do not authorize deployment, merging, purchases, or additional implementation.

## Durable context

- `STATE.md`: current checkpoint, implemented versus proposed work, verification, and next action.
- `docs/audits/2026-09-05/product-direction/`: 44 findings, 10 epics, architecture proposals, sequencing, evidence and ticket indexes.
- `docs/tasks/learning-product/`: 76 detailed tickets with acceptance criteria and dependencies.
- `docs/audits/2026-09-05/repair-progress.md`: A01/A02 security-repair evidence and outstanding operational checks.

These tracked files are the shared project memory. Conversation history, local assistant memory, credentials, dependencies and running emulators are not supplied by a Git checkout. Save decisions and verification here rather than relying on a previous conversation.

## Current direction and boundaries

The recommendation under review is an independent focused reading product backed by educator expertise, with tutoring retained as a separate service and feedback channel. A school remains optional. The audit and backlog are complete for review; the new tickets are proposals, not authorization to implement every ticket. Existing A01/A02 repairs are implemented and tested locally, not deployed. Keep learning evidence distinct from rewards/completion and avoid unsupported mastery claims.

Use feature/hotfix branches and the repository review workflow. Pushing a branch is not a deployment. Keep debug logs, credentials and real family records out of commits. Consult actual source/configuration over obsolete stack and readiness statements in historical guides.

## Handoff maintenance

Before ending a meaningful work session, update the current section of `STATE.md` with the active branch, objective, ticket/decision, completed work, exact verification and limits, remaining work, authorization boundary, and the next executable action. Keep that section concise; link detailed evidence instead of copying it. Mark implementation, local verification, staging verification and deployment separately. Preserve historical audit evidence and label later corrections.
