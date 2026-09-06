#!/usr/bin/env bash
#
# Recovery readiness check across every data class — TASK-LP-059.
#
# `verify-firestore-backup.sh` checks one thing: that a Firestore export is
# fresh. That is necessary and nowhere near sufficient. A Firestore export does
# not contain Auth identities, Storage objects, secrets, or the release
# artifact — so restoring it alone produces a database full of documents keyed
# to uids that no longer exist, referencing files that are gone.
#
# This checks each data class and reports per class, so "are we recoverable"
# has an answer rather than an assumption.
#
# STRICTLY READ-ONLY.
#
# Exit codes:
#   0 — every class is covered and fresh
#   1 — at least one class is missing, stale, or unverifiable  (ACTIONABLE)
#   2 — required tooling not found
#
# Usage:
#   ./scripts/verify-recovery-readiness.sh [project-id]

set -uo pipefail

PROJECT_ID="${1:-iep-and-thrive}"
BACKUP_BUCKET="iep-and-thrive-firestore-backups"
MAX_AGE_HOURS="${MAX_AGE_HOURS:-36}"

command -v gcloud >/dev/null 2>&1 || { echo "ERROR: gcloud not found" >&2; exit 2; }

FAILURES=0
declare -a REPORT

record() {                       # class, status, detail
  REPORT+=("$1|$2|$3")
  [ "$2" = "FAIL" ] && FAILURES=$((FAILURES + 1))
  return 0
}

age_hours_of() {                 # ISO timestamp -> whole hours, or empty
  local ts="$1" epoch now
  ts="${ts%%.*}"; ts="${ts%%+*}"; ts="${ts%Z}"
  epoch=$(date -u -j -f "%Y-%m-%dT%H:%M:%S" "$ts" "+%s" 2>/dev/null \
       || date -u -d "$ts" "+%s" 2>/dev/null) || return 1
  now=$(date -u "+%s")
  echo $(( (now - epoch) / 3600 ))
}

echo "Recovery readiness — project $PROJECT_ID"
echo "Threshold: backups must be younger than ${MAX_AGE_HOURS}h"
echo "════════════════════════════════════════════════════════════"

# ── 1. Firestore documents ──────────────────────────────────────────────────
UPDATED=$(gcloud storage ls -l "gs://$BACKUP_BUCKET/daily/" --project="$PROJECT_ID" 2>/dev/null \
  | awk '/overall_export_metadata/ {print $2; exit}')
if [ -z "$UPDATED" ]; then
  record "Firestore documents" "FAIL" "no export metadata in gs://$BACKUP_BUCKET/daily/"
else
  AGE=$(age_hours_of "$UPDATED") || AGE=""
  if [ -z "$AGE" ]; then
    record "Firestore documents" "FAIL" "export present but timestamp unparseable ($UPDATED)"
  elif [ "$AGE" -ge "$MAX_AGE_HOURS" ]; then
    record "Firestore documents" "FAIL" "newest export is ${AGE}h old"
  else
    record "Firestore documents" "OK" "newest export ${AGE}h old"
  fi
fi

# ── 2. Auth identities ──────────────────────────────────────────────────────
# Not covered by a Firestore export at all. Without it, restored documents
# reference uids that no longer resolve to anyone and nobody can sign in.
AUTH_EXPORT=$(gcloud storage ls -l "gs://$BACKUP_BUCKET/auth/" --project="$PROJECT_ID" 2>/dev/null \
  | awk '/\.json|\.csv/ {print $2; exit}')
if [ -z "$AUTH_EXPORT" ]; then
  record "Auth identities" "FAIL" \
    "no export under gs://$BACKUP_BUCKET/auth/ — restore would orphan every uid"
else
  AGE=$(age_hours_of "$AUTH_EXPORT") || AGE=""
  if [ -n "$AGE" ] && [ "$AGE" -lt "$MAX_AGE_HOURS" ]; then
    record "Auth identities" "OK" "export ${AGE}h old"
  else
    record "Auth identities" "FAIL" "export stale or unparseable (${AGE:-?}h)"
  fi
fi

# ── 3. Storage objects ──────────────────────────────────────────────────────
# IEP documents, signed agreements, signatures. Object versioning is the
# recovery mechanism; without it a deletion is unrecoverable.
BUCKETS=$(gcloud storage buckets list --project="$PROJECT_ID" --format='value(name)' 2>/dev/null)
if [ -z "$BUCKETS" ]; then
  record "Storage objects" "FAIL" "could not list buckets (permissions?)"
else
  UNVERSIONED=""
  while read -r b; do
    [ -z "$b" ] && continue
    v=$(gcloud storage buckets describe "gs://$b" --project="$PROJECT_ID" \
          --format='value(versioning.enabled)' 2>/dev/null)
    [ "$v" = "True" ] || UNVERSIONED="$UNVERSIONED $b"
  done <<< "$BUCKETS"
  if [ -n "$UNVERSIONED" ]; then
    record "Storage objects" "FAIL" "versioning disabled on:$UNVERSIONED"
  else
    record "Storage objects" "OK" "versioning enabled on all buckets"
  fi
fi

# ── 4. Secrets and configuration ────────────────────────────────────────────
SECRETS=$(gcloud secrets list --project="$PROJECT_ID" --format='value(name)' 2>/dev/null | wc -l | tr -d ' ')
if [ "$SECRETS" = "0" ]; then
  record "Secrets / config" "FAIL" "no Secret Manager secrets found — where do Functions get theirs?"
else
  record "Secrets / config" "OK" "$SECRETS secrets present (values not read)"
fi

# ── 5. Release artifacts ────────────────────────────────────────────────────
# The Release workflow retains the verified web export for 14 days. Rolling
# back Hosting to a known-good build depends on it existing.
record "Release artifacts" "MANUAL" \
  "confirm the newest Release run has a web-export-<sha> artifact (14d retention)"

# ── 6. Deletion manifest ────────────────────────────────────────────────────
# A restore silently resurrects data a family asked to have deleted unless
# deletions are reapplied. This is a privacy obligation, not housekeeping.
record "Deletion manifest" "MANUAL" \
  "no deletion manifest exists yet — a restore would resurrect deleted records (TASK-LP-021)"

echo
printf '%-22s %-8s %s\n' "DATA CLASS" "STATUS" "DETAIL"
printf '%-22s %-8s %s\n' "----------" "------" "------"
for line in "${REPORT[@]}"; do
  IFS='|' read -r c s d <<< "$line"
  printf '%-22s %-8s %s\n' "$c" "$s" "$d"
done

echo
if [ "$FAILURES" -gt 0 ]; then
  echo "RESULT: $FAILURES data class(es) are not recoverable. See docs/runbooks/disaster-recovery.md."
  exit 1
fi
echo "RESULT: all automatically-checkable classes are covered."
echo "MANUAL rows above still require a human; they are not passes."
exit 0
