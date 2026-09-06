# IEP & Thrive — repository handoff

## Start here

1. Read only the **Current handoff** section at the top of [STATE.md](STATE.md).
2. For backlog review, read [the audit overview](docs/audits/2026-09-05/product-direction/README.md) and [sequencing](docs/audits/2026-09-05/product-direction/sequencing.md).
3. For implementation, read the selected `docs/tasks/learning-product/TASK-LP-NNN.md`, its dependencies, and linked source/evidence. Do not load all 76 tickets or repeat the full audit by default.
4. Check `git status` and the current branch before editing. Distinguish historical observations from current code and deployed behavior.

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

After meaningful work, update the current section of `STATE.md` with the ticket/decision, exact verification and limits, remaining work, and the next useful action. Keep that section concise; link detailed evidence instead of copying it. Mark implementation, local verification, staging verification and deployment separately. Preserve historical audit evidence and label later corrections.
