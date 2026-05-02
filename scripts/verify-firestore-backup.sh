#!/usr/bin/env bash
#
# E1 - Verify the most recent Firestore daily backup is fresh.
# Exit codes:
#   0 - Most recent daily backup is < 36 hours old
#   1 - No backup found, or newest is >= 36 hours old (failure)
#
# Run on demand or wire into a Cloud Scheduler health check.
# Wire CI: `npm run verify:backups`

set -euo pipefail

BUCKET="iep-and-thrive-firestore-backups"
PREFIX="daily"
MAX_AGE_HOURS=36

if ! command -v gsutil >/dev/null 2>&1; then
  if ! command -v gcloud >/dev/null 2>&1; then
    echo "[verify] ERROR: neither gsutil nor gcloud found in PATH." >&2
    exit 2
  fi
fi

echo "[verify] Listing gs://$BUCKET/$PREFIX/ ..."

# Use gsutil ls -l to list with timestamps. Newest export is the largest
# YYYY-MM-DDTHH:MM:SS_NNNNN/ prefix; we extract that and parse its
# embedded date for portability.
NEWEST=$(gsutil ls -d "gs://$BUCKET/$PREFIX/*/" 2>/dev/null | sort | tail -n 1 || true)

if [ -z "$NEWEST" ]; then
  echo "[verify] FAIL: no exports found under gs://$BUCKET/$PREFIX/" >&2
  exit 1
fi

echo "[verify] Newest export: $NEWEST"

# Extract the YYYY-MM-DDTHH:MM:SS_NNNNN segment from the URL.
STAMP=$(basename "$NEWEST")
# Convert YYYY-MM-DDTHH:MM:SS_xxxxx to YYYY-MM-DDTHH:MM:SS
EXPORT_ISO=$(echo "$STAMP" | sed -E "s/_[0-9]+$//")

# Compute age in hours, portable across BSD (macOS) and GNU date.
NOW_TS=$(date -u +%s)
if date -u -d "$EXPORT_ISO" +%s >/dev/null 2>&1; then
  EXPORT_TS=$(date -u -d "$EXPORT_ISO" +%s)
else
  # BSD date (macOS)
  EXPORT_TS=$(date -u -j -f "%Y-%m-%dT%H:%M:%S" "$EXPORT_ISO" +%s)
fi

AGE_S=$(( NOW_TS - EXPORT_TS ))
AGE_H=$(( AGE_S / 3600 ))

echo "[verify] Newest export age: $AGE_H hours (max allowed: $MAX_AGE_HOURS)"

if [ "$AGE_H" -ge "$MAX_AGE_HOURS" ]; then
  echo "[verify] FAIL: newest daily backup is stale (>= $MAX_AGE_HOURS hours)." >&2
  exit 1
fi

echo "[verify] OK: backup is fresh."
