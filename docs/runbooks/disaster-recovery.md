# Runbook — disaster recovery

Covers **TASK-LP-059**. Extends [firestore-backups.md](firestore-backups.md) and
[firestore-restore.md](firestore-restore.md), which handle Firestore only.

**The central point:** a Firestore export is not a backup of this system. It contains
documents. It does not contain Auth identities, Storage objects, secrets, or the
release artifact. Restoring it alone yields a database keyed to uids that no longer
resolve and referencing files that no longer exist.

---

## 1. Recovery inventory and targets

RPO — how much data we accept losing. RTO — how long recovery may take. **These are
proposed and need owner approval**; nothing here has been agreed, and nothing has
been rehearsed.

| Data class | Where it lives | Covered today | RPO | RTO | Notes |
| --- | --- | --- | --- | --- | --- |
| Firestore documents | `(default)` database | **Yes** — daily export | 24h | 4h | The only class with automation |
| Auth identities | Firebase Auth | **No** | 24h | 4h | Not in a Firestore export. Without it every restored uid is orphaned |
| Storage objects | IEP docs, signed agreements, signatures | **Partial** — object versioning only | 0 (versioned) | 8h | Versioning is not a backup; a bucket-level loss is unrecoverable |
| Secrets / config | Secret Manager, Functions config | **No** | n/a | 2h | Values must be re-provisioned by an operator, not restored |
| Release artifact | Web export from the Release workflow | **Yes** — 14 days | n/a | 1h | Rolling back Hosting depends on it |
| Deletion manifest | *does not exist* | **No** | n/a | n/a | See §4. This is a privacy obligation |

Run the automated portion:

```bash
./scripts/verify-recovery-readiness.sh iep-and-thrive
```

It reports per class and exits non-zero when any is missing or stale. The
`recovery-check` workflow runs it daily; a failing scheduled run is the alert.

---

## 2. What is not covered, stated plainly

- **Auth identities have no export.** This is the largest gap. A full Firestore restore
  today would produce documents referencing uids nobody can authenticate as. Fix with a
  scheduled `firebase auth:export` into the backup bucket before relying on any restore.
- **Storage has versioning, not backup.** Versioning recovers an overwritten or deleted
  object. It does not survive bucket deletion or a lifecycle rule that ages objects out.
- **Point-in-time recovery is not enabled.** The daily export is the granularity. Anything
  written since the last export is lost, which is what the 24h RPO above means in practice.
- **No restore has ever been rehearsed.** Until §3 is executed, treat every recovery
  estimate here as a guess.

---

## 3. Restore rehearsal

Run against an isolated synthetic project. Never against production, and never against
staging while staging is being used for anything else.

### 3a. Prepare

```bash
export REHEARSAL_PROJECT=iep-recovery-rehearsal   # must not be production
gcloud projects describe "$REHEARSAL_PROJECT" >/dev/null || echo "create it first"
```

### 3b. Suppress side effects BEFORE importing

This is the step people skip, and it is the one that emails your entire customer list a
year of historical notifications.

- Disable every scheduled function in the rehearsal project.
- Point email to a sink, or leave the provider key unset so sends fail closed.
- Ensure Stripe keys are absent or test-mode. A restored webhook-claim collection plus a
  live key can re-apply historical billing transitions.
- Confirm the rehearsal project has no production Stripe webhook endpoint registered.

### 3c. Import

```bash
gcloud firestore import "gs://iep-and-thrive-firestore-backups/daily" \
  --project="$REHEARSAL_PROJECT"
# Auth, once an export exists:
# firebase auth:import users.json --project "$REHEARSAL_PROJECT"
```

### 3d. Consistency checks — the acceptance criterion

A restore is not complete when the import succeeds. It is complete when these hold:

- [ ] **Identity alignment.** Every `users/{uid}` document has a matching Auth user.
      Sample at least 20, and check that the count matches. Orphans mean the Auth export
      was older than the Firestore export.
- [ ] **File references resolve.** Every `iepDocumentUrl` / signed-agreement reference
      points at an object that exists. Broken references mean Storage and Firestore were
      captured at different times.
- [ ] **Consent state.** Marketing suppression and unsubscribe flags survived. A restore
      that resurrects consent someone withdrew is a privacy incident, not a data problem.
- [ ] **Deletions reapplied.** See §4.
- [ ] **Rules deployed.** Import does not restore rules. Deploy them from the reviewed
      commit *before* granting any access, or the restored data sits under whatever rules
      that project last had.
- [ ] **Admin claims re-provisioned.** Custom claims are Auth state, not Firestore.
      Run `scripts/provision-admin-claims.mjs` against the rehearsal project.
- [ ] **No side effects fired.** Check the email ledger and webhook-claim collections for
      records created *during* the rehearsal. Any is a §3b failure.

Record the wall-clock time from decision to verified. That number is the real RTO;
replace the estimate in §1 with it.

---

## 4. Deletion manifest — an open obligation

There is no record of what has been deleted at a family's request. So a restore silently
resurrects it, and the more faithfully we restore, the worse the violation.

Until a manifest exists (TASK-LP-021 delivers deletion and export), any production restore
must be preceded by a manual reconciliation against whatever deletion requests are on
record. Note it here as an accepted risk with an owner, or do not restore.

---

## 5. Partial recovery

Full restore is rarely the right first move.

- **One collection.** See [firestore-restore.md](firestore-restore.md) §3. Prefer this.
- **One family's data.** Restore into the rehearsal project, extract the documents, write
  them back deliberately. Do not import a full export over live production to recover one
  record.
- **Storage object.** Use object versioning; no import needed.
- **Hosting.** Roll back to the retained `web-export-<sha>` artifact. Do not rebuild —
  the artifact is what was verified.

---

## 6. Safe resumption

After any restore, before re-enabling traffic:

1. Rules and indexes deployed from the reviewed commit.
2. Admin claims re-provisioned and verified with `provision-admin-claims.mjs audit`.
3. Scheduled functions re-enabled **last**, and only after confirming the email ledger and
   webhook-claim state will not re-send or re-apply history.
4. Announce the recovery window to affected families if any data was lost. The RPO above
   means up to 24h of writes can vanish, and people should be told rather than discovering it.
