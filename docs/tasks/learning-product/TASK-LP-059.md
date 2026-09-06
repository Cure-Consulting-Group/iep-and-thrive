# TASK-LP-059 — Validate backups and rehearse whole-system recovery

| Field | Value |
| --- | --- |
| Epic | [EPIC-LP-08](../../audits/2026-09-05/product-direction/epics.md#epic-lp-08) |
| Priority / release gate | P0 / G0: protect existing users |
| Status | Proposed — review required |
| Proposed owner | Infrastructure + data + privacy |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Findings | [F28](../../audits/2026-09-05/product-direction/findings.md#f28), [F39](../../audits/2026-09-05/product-direction/findings.md#f39) |
| Dependencies | [TASK-LP-054](TASK-LP-054.md), [TASK-LP-058](TASK-LP-058.md) |

## Problem and intended outcome

Firestore export/restore runbooks exist, but current backup freshness and recovery were not verified. Auth identities, Storage documents, content versions, and deletion state are outside a simple Firestore export.

## Implementation scope

1. Define approved RPO/RTO per data class and a recovery inventory covering Firestore, Auth configuration/identity mapping, Storage, content, secrets/config, and release artifacts.
2. Verify scheduled exports, completion/freshness, retention, access, and alerting; correct cost estimates using retained-copy volume and export/read charges.
3. Rehearse restore into an isolated synthetic environment with file/document consistency, access rules, event/replay suppression, and deletion-manifest reapplication.
4. Document partial recovery, orphan reconciliation, point-in-time limitations, and safe service resumption without resending historical messages/payments.

## Acceptance criteria

- **Given** the newest backup is missing or incomplete, **when** freshness monitoring runs, **then** the owner receives an actionable alert.

- **Given** a restore completes, **when** consistency checks run, **then** identities/files/consent/deletions align before access and side effects resume.

## Validation and evidence

Dated restore drill with measured timings, counts/hashes, denied cross-family reads, deleted-user checks, and duplicate-message suppression. Production exports are not copied into development during this audit.

## Rollout, migration, and recovery

Keep restore evidence synthetic and document authorized handling for real records. Never restore vulnerable rules or bypass deletion obligations to meet recovery targets.

## Source evidence

- [docs/runbooks/firestore-backups.md:67](../../../docs/runbooks/firestore-backups.md#L67)
- [docs/runbooks/firestore-restore.md:79](../../../docs/runbooks/firestore-restore.md#L79)
- [scripts/verify-firestore-backup.sh:1](../../../scripts/verify-firestore-backup.sh#L1)

## Definition of done

Apply the [shared completion requirements](../../audits/2026-09-05/product-direction/README.md#completion-requirements), including independent review, linked evidence, relevant failure-path tests, migration verification, updated contracts/runbooks, and UI accessibility review where applicable. A completed implementation is not a production-verified release until its release evidence is recorded.
