# Firestore Restore Runbook

> Owner: Founder. Last reviewed: 2026-05-02.
> WARNING: A Firestore import REPLACES collections it touches. Read this entire document before running any `gcloud firestore import`.

## When to use this

You suspect Firestore data is corrupt, deleted, or was overwritten by a bad migration / admin action. Recover from a recent backup created by E1 (`scripts/setup-firestore-backups.sh`).

Before restoring:
1. Stop the bleeding. If the cause is an active script or function, disable it first (`firebase functions:delete <name>` or comment out and redeploy).
2. Snapshot the current state. Run an ad-hoc export so the broken state is recoverable:
   ```bash
   gcloud firestore export gs://iep-and-thrive-firestore-backups/incident-$(date -u +%Y%m%dT%H%M%S) --project=iep-and-thrive
   ```
3. Identify the right backup. List daily exports newest-first:
   ```bash
   gsutil ls gs://iep-and-thrive-firestore-backups/daily/
   ```
   The folder name is an ISO timestamp (UTC). Pick the latest one that predates the incident.

## Step 1 — Dry-run on a sandbox project (STRONGLY RECOMMENDED)

Production Firestore imports are destructive at the collection level. Test the restore on a sandbox project before touching production data.

```bash
# One-time: create or pick a sandbox project, enable Firestore.
SANDBOX=iep-and-thrive-restore-sandbox
gcloud projects create $SANDBOX || true
gcloud services enable firestore.googleapis.com --project=$SANDBOX

# Grant the source bucket read access to the sandbox's default service account.
SANDBOX_SA=$SANDBOX@appspot.gserviceaccount.com
gcloud storage buckets add-iam-policy-binding gs://iep-and-thrive-firestore-backups --member=serviceAccount:$SANDBOX_SA --role=roles/storage.objectViewer

# Import the chosen backup into the sandbox.
BACKUP=gs://iep-and-thrive-firestore-backups/daily/2026-05-02T07:00:00_12345  # replace with actual
gcloud firestore import $BACKUP --project=$SANDBOX
```

Inspect the sandbox via the Firebase Console or a small read script. Confirm the data shape matches expectation before proceeding.

## Step 2 — Restore to production (full database)

```bash
BACKUP=gs://iep-and-thrive-firestore-backups/daily/2026-05-02T07:00:00_12345  # replace
gcloud firestore import $BACKUP --project=iep-and-thrive
```

Caveats:
- The import operation IS destructive for documents in collections present in the export. Documents in a collection that is in the import will be replaced; documents in collections NOT in the export are left alone.
- An import does NOT delete documents that exist in production but did not exist at backup time. If recent (post-backup) writes are present, those documents persist. For full point-in-time recovery you need to delete the affected collection(s) before importing — see Step 3.

## Step 3 — Restoring a single collection (point-in-time)

For a single damaged collection (e.g., `progressReports`) where you want exact restoration:

```bash
BACKUP=gs://iep-and-thrive-firestore-backups/daily/2026-05-02T07:00:00_12345

# Optional: drop the current collection first if you need exact point-in-time state.
# This is destructive — only do this after Step 2 sandbox confirmation.
# gcloud firestore databases delete-fields ... is NOT a thing; use a deletion script.

gcloud firestore import $BACKUP --collection-ids=progressReports --project=iep-and-thrive
```

## Step 4 — Post-restore checklist

- [ ] Verify a sample of documents read correctly via the parent portal (use test cohort accounts E13).
- [ ] Re-run `scripts/verify-firestore-backup.sh` to confirm backup pipeline is still healthy.
- [ ] Force a fresh export so the post-restore state is captured: `gcloud scheduler jobs run firestore-daily-backup --location=us-east4 --project=iep-and-thrive`.
- [ ] Update the incident log in `docs/incidents/` with the date, root cause, backup used, and any data loss.
- [ ] If the cause was a bug, file a ticket and write a regression test before re-enabling the affected code path.

## Rollback considerations

- A Firestore import cannot be "undone" — but the snapshot you took at Step 0 above can be re-imported to restore the broken state if the recovery path itself goes wrong.
- Auth users, Storage objects, and Cloud Functions are NOT covered by Firestore exports. Plan recovery for those separately if implicated.
- emailLog is event-sourced (append-only) — restoring it back-in-time means losing the record of emails sent post-backup. Document the gap; do not silently overwrite.

## References

- Setup runbook: ./firestore-backups.md
- Firestore docs: https://firebase.google.com/docs/firestore/manage-data/export-import
- gcloud firestore import: https://cloud.google.com/sdk/gcloud/reference/firestore/import
