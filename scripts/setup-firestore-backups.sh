#!/usr/bin/env bash
#
# E1 - Firestore daily + monthly backup automation
# Idempotent. Safe to re-run.
#
# Provisions on Google Cloud project iep-and-thrive:
#   1. GCS bucket gs://iep-and-thrive-firestore-backups (us-east4, UBLA, versioning)
#   2. Lifecycle rules: delete daily/* after 30 days, monthly/* after 365 days
#   3. IAM:
#      - app-engine default SA gets datastore.importExportAdmin (project)
#      - app-engine default SA gets storage.admin on the backup bucket
#   4. Two Cloud Scheduler HTTP jobs in us-east4:
#      - firestore-daily-backup    @ 03:00 America/New_York
#      - firestore-monthly-backup  @ 03:30 1st-of-month America/New_York
#      Both call firestore.googleapis.com .../databases/(default):exportDocuments
#      authenticated via OAuth as the service account.
#
# Prerequisites (run once):
#   gcloud auth login
#   gcloud config set project iep-and-thrive
#   gcloud services enable firestore.googleapis.com cloudscheduler.googleapis.com appengine.googleapis.com storage.googleapis.com
#   gcloud app create --region=us-east4 || true
#
# Run:
#   bash scripts/setup-firestore-backups.sh

set -euo pipefail

PROJECT_ID="iep-and-thrive"
BUCKET="iep-and-thrive-firestore-backups"
# Bucket location must contain the Firestore (default) database location.
# The database is in us-central; "us" multi-region covers it.
BUCKET_LOCATION="us"
# Cloud Scheduler jobs themselves are regional; us-east4 keeps them close.
SCHEDULER_REGION="us-east4"
SA="iep-and-thrive@appspot.gserviceaccount.com"

echo "[E1] Project:           $PROJECT_ID"
echo "[E1] Bucket:             gs://$BUCKET ($BUCKET_LOCATION)"
echo "[E1] Scheduler region:   $SCHEDULER_REGION"
echo "[E1] Service account:    $SA"

echo "[E1] (1/5) Creating backup bucket if missing..."
gcloud storage buckets create "gs://$BUCKET" --project="$PROJECT_ID" --location="$BUCKET_LOCATION" --uniform-bucket-level-access --default-storage-class=STANDARD || true
gcloud storage buckets update "gs://$BUCKET" --project="$PROJECT_ID" --versioning

echo "[E1] (2/5) Applying lifecycle policy (daily=30d, monthly=365d)..."
LIFECYCLE_FILE=$(mktemp -t iet-lifecycle-XXXXXX.json)
cat > "$LIFECYCLE_FILE" <<JSONEOF
{"lifecycle":{"rule":[{"action":{"type":"Delete"},"condition":{"age":30,"matchesPrefix":["daily/"]}},{"action":{"type":"Delete"},"condition":{"age":365,"matchesPrefix":["monthly/"]}}]}}
JSONEOF
gcloud storage buckets update "gs://$BUCKET" --project="$PROJECT_ID" --lifecycle-file="$LIFECYCLE_FILE"
rm -f "$LIFECYCLE_FILE"

echo "[E1] (3/5) Granting datastore.importExportAdmin on project..."
gcloud projects add-iam-policy-binding "$PROJECT_ID" --member="serviceAccount:$SA" --role="roles/datastore.importExportAdmin" --condition=None --quiet

echo "[E1] (3/5) Granting storage.admin on backup bucket..."
gcloud storage buckets add-iam-policy-binding "gs://$BUCKET" --project="$PROJECT_ID" --member="serviceAccount:$SA" --role="roles/storage.admin"

DAILY_URI="https://firestore.googleapis.com/v1/projects/$PROJECT_ID/databases/(default):exportDocuments"
DAILY_BODY="{\"outputUriPrefix\":\"gs://$BUCKET/daily\"}"
MONTHLY_BODY="{\"outputUriPrefix\":\"gs://$BUCKET/monthly\"}"

echo "[E1] (4/5) Creating/updating daily backup scheduler..."
if gcloud scheduler jobs describe firestore-daily-backup --location="$SCHEDULER_REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud scheduler jobs update http firestore-daily-backup --location="$SCHEDULER_REGION" --project="$PROJECT_ID" --schedule="0 3 * * *" --time-zone="America/New_York" --uri="$DAILY_URI" --http-method=POST --headers="Content-Type=application/json" --oauth-service-account-email="$SA" --oauth-token-scope="https://www.googleapis.com/auth/datastore" --message-body="$DAILY_BODY"
else
  gcloud scheduler jobs create http firestore-daily-backup --location="$SCHEDULER_REGION" --project="$PROJECT_ID" --schedule="0 3 * * *" --time-zone="America/New_York" --uri="$DAILY_URI" --http-method=POST --headers="Content-Type=application/json" --oauth-service-account-email="$SA" --oauth-token-scope="https://www.googleapis.com/auth/datastore" --message-body="$DAILY_BODY" --description="Nightly Firestore export to gs://$BUCKET/daily (E1 retention 30d)"
fi

echo "[E1] (5/5) Creating/updating monthly backup scheduler..."
if gcloud scheduler jobs describe firestore-monthly-backup --location="$SCHEDULER_REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud scheduler jobs update http firestore-monthly-backup --location="$SCHEDULER_REGION" --project="$PROJECT_ID" --schedule="30 3 1 * *" --time-zone="America/New_York" --uri="$DAILY_URI" --http-method=POST --headers="Content-Type=application/json" --oauth-service-account-email="$SA" --oauth-token-scope="https://www.googleapis.com/auth/datastore" --message-body="$MONTHLY_BODY"
else
  gcloud scheduler jobs create http firestore-monthly-backup --location="$SCHEDULER_REGION" --project="$PROJECT_ID" --schedule="30 3 1 * *" --time-zone="America/New_York" --uri="$DAILY_URI" --http-method=POST --headers="Content-Type=application/json" --oauth-service-account-email="$SA" --oauth-token-scope="https://www.googleapis.com/auth/datastore" --message-body="$MONTHLY_BODY" --description="Monthly (1st @ 03:30 ET) Firestore export to gs://$BUCKET/monthly (E1 retention 365d)"
fi

echo "[E1] Done. Verify with:"
echo "  gcloud scheduler jobs list --location=$SCHEDULER_REGION --project=$PROJECT_ID"
echo "  gcloud storage buckets describe gs://$BUCKET"
echo "  bash scripts/verify-firestore-backup.sh"
