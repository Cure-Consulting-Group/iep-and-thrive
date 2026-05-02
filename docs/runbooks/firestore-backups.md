# Firestore Backups Runbook

> Owner: Founder. Last reviewed: 2026-05-02.

## Overview

IEP & Thrive runs scheduled Firestore exports to a dedicated GCS bucket on the same project. Two schedules:

| Job | Cron (America/New_York) | GCS prefix | Retention |
|---|---|---|---|
| firestore-daily-backup   | 0 3 * * *    | gs://iep-and-thrive-firestore-backups/daily/   | 30 days  |
| firestore-monthly-backup | 30 3 1 * *   | gs://iep-and-thrive-firestore-backups/monthly/ | 365 days |

Both call the Firestore Admin REST endpoint databases/(default):exportDocuments authenticated as the App Engine default service account.

## Why this configuration

- Daily, 30 days: covers the most common recovery scenarios (accidental admin write, bad migration, single-day corruption). 30 days is long enough that a parent escalation surfaces inside the window even when the founder is offline for travel.
- Monthly snapshots, 365 days: post-cohort archival reference (CSE meetings in September, year-over-year program audits). Cheap insurance.
- us-east4 matches the Firestore database location — same-region restore is fastest and free of egress.
- Object versioning on the bucket protects against accidental policy edits or clock drift at the lifecycle boundary; the most recent monthly snapshot survives even if a malformed lifecycle rule races a delete.

## Setup (one-time, founder workstation)

```bash
gcloud auth login
gcloud config set project iep-and-thrive
gcloud services enable firestore.googleapis.com cloudscheduler.googleapis.com appengine.googleapis.com storage.googleapis.com
# Cloud Scheduler requires an App Engine app in the project. If absent:
gcloud app create --region=us-east4 || true

bash scripts/setup-firestore-backups.sh
```

The script is idempotent — re-running it is the supported way to enforce config drift.

## Verification

### Day-1 (after first scheduled run)

```bash
gcloud scheduler jobs list --location=us-east4 --project=iep-and-thrive
gcloud scheduler jobs run firestore-daily-backup --location=us-east4 --project=iep-and-thrive  # force one immediate run
gsutil ls gs://iep-and-thrive-firestore-backups/daily/
```

### Ongoing freshness check

```bash
npm run verify:backups
# or directly:
bash scripts/verify-firestore-backup.sh
```

Exits 0 if the newest export under daily/ is < 36 hours old; non-zero otherwise. Wire into CI (E14 follow-up) or a manual weekly cadence until then.

## Failure modes

| Symptom | Likely cause | Action |
|---|---|---|
| Scheduler job logs show 403 | SA missing datastore.importExportAdmin | Re-run setup script — IAM grant is idempotent |
| Scheduler job logs show 403 on bucket write | SA missing storage.admin on bucket | Re-run setup script |
| verify-firestore-backup.sh exits 1 with "no exports found" | First run never executed, or bucket name typo | Run `gcloud scheduler jobs run firestore-daily-backup --location=us-east4` and re-verify |
| Daily exports succeed but bucket grows past 1 GB | Lifecycle rule never applied | `gcloud storage buckets describe gs://iep-and-thrive-firestore-backups --format=json` and inspect lifecycle.rule[]; re-run setup script if missing |
| App Engine app missing | Project never created App Engine app | `gcloud app create --region=us-east4` |

## Cost expectation

At Cohort 1 scale (parent + student + reports + emailLog ~ < 5 GB total Firestore data):

- Storage: ~$0.10 / month (us-east4 STANDARD ~$0.020/GB-mo, daily exports retained 30d)
- Operations: ~$0.05 / month (Class A writes during nightly export)
- Egress on restore: $0 (same-region)
- Total: < $1 / month at Cohort 1 scale.

Revisit after Year 1 once the monthly archive accumulates 12 snapshots. If portfolio media in Storage gets folded into backups, the math changes — track separately.

## Related

- Restore procedure: ./firestore-restore.md
- Setup script: ../../scripts/setup-firestore-backups.sh
- Verifier: ../../scripts/verify-firestore-backup.sh
