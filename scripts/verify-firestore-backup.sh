#!/usr/bin/env bash
#
# E1 — Verify the most recent Firestore daily backup is fresh.
# Exit codes:
#   0 — Most recent daily backup is < MAX_AGE_HOURS old
#   1 — No backup found, or newest is >= MAX_AGE_HOURS old
#   2 — Required tooling not found
#
# Run on demand or wire into a CI health check (`npm run verify:backups`).

set -euo pipefail

PROJECT_ID="iep-and-thrive"
BUCKET="iep-and-thrive-firestore-backups"
PREFIX="daily"
# The Firestore export lands `daily.overall_export_metadata` directly under
# the prefix (no per-date subdir, since each scheduler run uses the same
# outputUriPrefix). Object versioning + lifecycle keeps prior runs.
METADATA_OBJECT="$PREFIX/daily.overall_export_metadata"
MAX_AGE_HOURS=36

if ! command -v gcloud >/dev/null 2>&1; then
  echo "[verify] ERROR: gcloud not found in PATH." >&2
  exit 2
fi

echo "[verify] Checking gs://$BUCKET/$METADATA_OBJECT ..."

# `gcloud storage objects describe` URL-encodes "/" inside the object name
# and 404s. `gcloud storage ls -l` works reliably; parse its timestamp out.
UPDATED=$(gcloud storage ls -l "gs://$BUCKET/$PREFIX/" --project="$PROJECT_ID" 2>/dev/null \
  | awk -v target="gs://$BUCKET/$METADATA_OBJECT" '$0 ~ target {print $2; exit}')

if [ -z "$UPDATED" ]; then
  echo "[verify] FAIL: no export metadata at gs://$BUCKET/$METADATA_OBJECT" >&2
  echo "[verify] Has the daily scheduler run yet?" >&2
  echo "[verify]   gcloud scheduler jobs run firestore-daily-backup --location=us-east4 --project=$PROJECT_ID" >&2
  exit 1
fi

echo "[verify] Newest export updated: $UPDATED"

# `gcloud storage objects describe --format=value(updated)` emits ISO 8601
# (e.g. 2026-05-02T16:18:23.456789+00:00). Strip fractional seconds + tz to
# something both BSD and GNU date can parse.
ISO_CLEAN=$(echo "$UPDATED" | sed -E 's/\.[0-9]+//; s/\+[0-9:]+$//; s/Z$//')

NOW_TS=$(date -u +%s)
if date -u -d "$ISO_CLEAN" +%s >/dev/null 2>&1; then
  # GNU date (Linux)
  EXPORT_TS=$(date -u -d "$ISO_CLEAN" +%s)
else
  # BSD date (macOS)
  EXPORT_TS=$(date -u -j -f "%Y-%m-%dT%H:%M:%S" "$ISO_CLEAN" +%s)
fi

AGE_S=$(( NOW_TS - EXPORT_TS ))
AGE_H=$(( AGE_S / 3600 ))
AGE_M=$(( (AGE_S % 3600) / 60 ))

echo "[verify] Newest export age: ${AGE_H}h ${AGE_M}m (max allowed: ${MAX_AGE_HOURS}h)"

if [ "$AGE_H" -ge "$MAX_AGE_HOURS" ]; then
  echo "[verify] FAIL: newest daily backup is stale (>= ${MAX_AGE_HOURS}h)." >&2
  exit 1
fi

echo "[verify] OK: backup is fresh."
