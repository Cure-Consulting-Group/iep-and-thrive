#!/usr/bin/env bash
# =============================================================================
# seed-github-project.sh
# -----------------------------------------------------------------------------
# Purpose:
#   Seed the github.com/Cure-Consulting-Group/iep-and-thrive repository with
#   the canonical IEP & Thrive backlog: priority/effort/epic labels, three
#   horizon milestones (Horizon 0/1/2), and one issue per ticket in
#   scripts/backlog.yml. Optionally creates a GitHub Project (v2) and adds
#   every issue to it.
#
# Prerequisites:
#   - gh CLI installed and authenticated  (run `gh auth status` to verify)
#   - Authenticated user has write access to Cure-Consulting-Group/iep-and-thrive
#   - Run from anywhere — the script does not depend on $PWD other than to
#     resolve scripts/backlog.yml relative to itself
#   - For the optional Project (v2) block: token must include `project` scope.
#     If your token lacks it, run `gh auth refresh -s project` first.
#
# Usage:
#   bash scripts/seed-github-project.sh
#
# WARNING — Idempotency:
#   Labels and milestones are guarded (created only if missing).
#   Issues are NOT idempotent — running this script twice will create
#   DUPLICATE issues. Run it ONCE. If you need to re-run, manually close
#   or delete the duplicates, or extend this script with a title-existence
#   check before each `gh issue create`.
#
# Flags:
#   CREATE_PROJECT=1   Also create a GitHub Project (v2) and add every
#                      created issue to it. Default: 0 (skip).
#   DRY_RUN=1          Echo what would happen without calling gh mutating
#                      commands. Useful for review.
# =============================================================================

set -euo pipefail

REPO="Cure-Consulting-Group/iep-and-thrive"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)"
BACKLOG_YML="${SCRIPT_DIR}/backlog.yml"
CREATE_PROJECT="${CREATE_PROJECT:-0}"
DRY_RUN="${DRY_RUN:-0}"

# -----------------------------------------------------------------------------
# Logging helpers
# -----------------------------------------------------------------------------
log()  { printf '\033[0;36m[seed]\033[0m %s\n' "$*"; }
ok()   { printf '\033[0;32m[ ok ]\033[0m %s\n' "$*"; }
warn() { printf '\033[0;33m[warn]\033[0m %s\n' "$*"; }
err()  { printf '\033[0;31m[err ]\033[0m %s\n' "$*" >&2; }

run() {
  if [[ "${DRY_RUN}" == "1" ]]; then
    printf '\033[0;35m[dry ]\033[0m %s\n' "$*"
  else
    eval "$@"
  fi
}

# -----------------------------------------------------------------------------
# Preflight
# -----------------------------------------------------------------------------
log "Verifying gh CLI auth..."
if ! gh auth status >/dev/null 2>&1; then
  err "gh CLI is not authenticated. Run: gh auth login"
  exit 1
fi
ok "gh authenticated."

log "Verifying access to ${REPO}..."
if ! gh repo view "${REPO}" >/dev/null 2>&1; then
  err "Cannot access ${REPO}. Check permissions or repo name."
  exit 1
fi
ok "Repo accessible."

if [[ ! -f "${BACKLOG_YML}" ]]; then
  err "backlog.yml not found at ${BACKLOG_YML}"
  exit 1
fi

# python3 is used to parse the YAML — keeps the script dependency-light
# (no yq required). Falls back to error if missing.
if ! command -v python3 >/dev/null 2>&1; then
  err "python3 is required for YAML parsing. Install python3 and retry."
  exit 1
fi

# -----------------------------------------------------------------------------
# Labels — create if missing
# -----------------------------------------------------------------------------
log "Ensuring labels exist..."

# label spec: name|color|description
LABELS=(
  "P0|B60205|Must ship before its horizon — blocks the cohort or compliance."
  "P1|D93F0B|Should ship in its horizon — meaningful quality or risk reduction."
  "P2|FBCA04|Nice to have — defer if pressed."
  "effort:S|C2E0C6|Small — under a day."
  "effort:M|BFD4F2|Medium — 1–3 days."
  "effort:L|FEF2C0|Large — most of a week."
  "effort:XL|F9D0C4|Extra large — multi-week, likely needs decomposition."
  "epic-a|1B4332|Marketing Site Conversion Hardening"
  "epic-b|2D6A4F|Parent Account Onboarding Polish"
  "epic-c|40916C|Curriculum Delivery Infrastructure"
  "epic-d|B7E4C7|Notification & Attention System"
  "epic-e|D4860B|Data, Compliance, Reliability"
  "epic-f|6B6560|Year 2 / Productization"
)

# Cache existing labels once
EXISTING_LABELS="$(gh label list --repo "${REPO}" --limit 200 --json name --jq '.[].name' || true)"

for entry in "${LABELS[@]}"; do
  IFS='|' read -r name color desc <<<"${entry}"
  if grep -Fxq "${name}" <<<"${EXISTING_LABELS}"; then
    ok "label exists: ${name}"
  else
    log "creating label: ${name}"
    run "gh label create '${name}' --repo '${REPO}' --color '${color}' --description '${desc//\'/\'\\\'\'}'"
  fi
done

# -----------------------------------------------------------------------------
# Milestones — create if missing
# -----------------------------------------------------------------------------
# gh has no first-class `milestone create`, so we go through the REST API.
log "Ensuring milestones exist..."

declare -A MILESTONE_NUMBERS=()

ensure_milestone() {
  local title="$1"
  local due="$2"     # YYYY-MM-DD
  local description="$3"

  # List milestones (open + closed) and look for a title match
  local existing_number
  existing_number="$(gh api "repos/${REPO}/milestones?state=all&per_page=100" \
    --jq ".[] | select(.title==\"${title}\") | .number" 2>/dev/null || true)"

  if [[ -n "${existing_number}" ]]; then
    ok "milestone exists: ${title} (#${existing_number})"
    MILESTONE_NUMBERS["${title}"]="${existing_number}"
    return 0
  fi

  log "creating milestone: ${title} (due ${due})"
  if [[ "${DRY_RUN}" == "1" ]]; then
    printf '\033[0;35m[dry ]\033[0m would POST milestone %s\n' "${title}"
    MILESTONE_NUMBERS["${title}"]="DRY"
    return 0
  fi

  local number
  number="$(gh api -X POST "repos/${REPO}/milestones" \
    -f title="${title}" \
    -f state="open" \
    -f description="${description}" \
    -f due_on="${due}T23:59:59Z" \
    --jq '.number')"
  MILESTONE_NUMBERS["${title}"]="${number}"
  ok "created milestone: ${title} (#${number})"
}

ensure_milestone \
  "Horizon 0 — Cohort 1 Launch" \
  "2026-06-23" \
  "Everything that must be true before the first student walks in on July 7."

ensure_milestone \
  "Horizon 1 — Cohort 1 Operate" \
  "2026-08-14" \
  "Live-cohort operations: notifications, weekly digests, parent ↔ instructor channel, attention flags, reliability."

ensure_milestone \
  "Horizon 2 — Year 2 Productization" \
  "2026-12-31" \
  "Multi-cohort, multi-tenancy, recurring school-year products, B2B, and outcomes-driven Year 2 case studies."

# -----------------------------------------------------------------------------
# Tickets — create one issue per backlog entry
# -----------------------------------------------------------------------------
log "Parsing backlog.yml..."

# Emit a TSV stream of tickets:
#   id\tepic\tmilestone\ttitle\tpriority\teffort\tbody_b64
# Body is base64-encoded so newlines survive the TSV transit.
TICKETS_TSV="$(python3 - "${BACKLOG_YML}" <<'PYEOF'
import base64, sys, yaml
with open(sys.argv[1]) as f:
    data = yaml.safe_load(f)
for t in data.get("tickets", []):
    body_b64 = base64.b64encode(t["body"].encode("utf-8")).decode("ascii")
    fields = [
        t["id"],
        t["epic"],
        t["milestone"],
        t["title"].replace("\t", " "),
        t["priority"],
        t["effort"],
        body_b64,
    ]
    print("\t".join(fields))
PYEOF
)"

CREATED_ISSUE_URLS=()
COUNT=0

while IFS=$'\t' read -r id epic milestone title priority effort body_b64; do
  [[ -z "${id:-}" ]] && continue

  COUNT=$((COUNT+1))
  full_title="[${id}] ${title}"
  body="$(printf '%s' "${body_b64}" | base64 --decode)"
  effort_label="effort:${effort}"
  milestone_number="${MILESTONE_NUMBERS[${milestone}]:-}"

  if [[ -z "${milestone_number}" ]]; then
    warn "no milestone number resolved for ${milestone} — issue ${id} will be created without milestone"
  fi

  log "creating issue (${COUNT}): ${full_title}"

  # Write body to a temp file so we don't fight quoting in the gh command
  tmpfile="$(mktemp)"
  printf '%s' "${body}" >"${tmpfile}"

  if [[ "${DRY_RUN}" == "1" ]]; then
    printf '\033[0;35m[dry ]\033[0m would create issue %s with labels %s,%s,%s milestone=%s\n' \
      "${full_title}" "${priority}" "${effort_label}" "${epic}" "${milestone_number}"
    rm -f "${tmpfile}"
    continue
  fi

  if [[ -n "${milestone_number}" ]]; then
    issue_url="$(gh issue create \
      --repo "${REPO}" \
      --title "${full_title}" \
      --body-file "${tmpfile}" \
      --label "${priority}" \
      --label "${effort_label}" \
      --label "${epic}" \
      --milestone "${milestone}")"
  else
    issue_url="$(gh issue create \
      --repo "${REPO}" \
      --title "${full_title}" \
      --body-file "${tmpfile}" \
      --label "${priority}" \
      --label "${effort_label}" \
      --label "${epic}")"
  fi

  rm -f "${tmpfile}"
  CREATED_ISSUE_URLS+=("${issue_url}")
  ok "created: ${issue_url}"
done <<<"${TICKETS_TSV}"

# -----------------------------------------------------------------------------
# Optional: Create GitHub Project (v2) and add issues
# -----------------------------------------------------------------------------
# `gh project` requires the `project` token scope. If your token lacks it
# the block below will fail loudly. Set CREATE_PROJECT=0 (default) to skip.
#
# If `gh project` is gnarly in your environment, leave CREATE_PROJECT unset
# and create the project manually:
#   1. Visit https://github.com/orgs/Cure-Consulting-Group/projects/new
#   2. Choose "Board" template, name it "IEP & Thrive — Cohort 1 to Year 2"
#   3. Add the issues by filtering label:epic-a OR epic-b OR ... in the
#      "Add items" picker.
# -----------------------------------------------------------------------------
if [[ "${CREATE_PROJECT}" == "1" ]]; then
  log "Creating GitHub Project (v2)..."

  ORG="Cure-Consulting-Group"
  PROJECT_TITLE="IEP & Thrive — Cohort 1 to Year 2"

  # Check whether a project with this title already exists at the org.
  existing_project_number="$(gh project list --owner "${ORG}" --format json \
    --jq ".projects[] | select(.title==\"${PROJECT_TITLE}\") | .number" 2>/dev/null || true)"

  if [[ -n "${existing_project_number}" ]]; then
    ok "project exists: #${existing_project_number}"
    PROJECT_NUMBER="${existing_project_number}"
  else
    PROJECT_NUMBER="$(gh project create --owner "${ORG}" --title "${PROJECT_TITLE}" --format json --jq '.number')"
    ok "created project #${PROJECT_NUMBER}"
  fi

  log "Adding ${#CREATED_ISSUE_URLS[@]} issues to project #${PROJECT_NUMBER}..."
  for url in "${CREATED_ISSUE_URLS[@]}"; do
    run "gh project item-add ${PROJECT_NUMBER} --owner '${ORG}' --url '${url}'"
  done
  ok "issues added to project."
else
  warn "Skipping GitHub Project (v2) creation. Set CREATE_PROJECT=1 to enable, or create manually via the web UI."
fi

# -----------------------------------------------------------------------------
# Summary
# -----------------------------------------------------------------------------
echo
echo "================ SEED COMPLETE ================"
echo "Repo:              ${REPO}"
echo "Issues created:    ${COUNT}"
echo "Project created:   $([[ "${CREATE_PROJECT}" == "1" ]] && echo yes || echo no)"
echo "Dry run:           $([[ "${DRY_RUN}" == "1" ]] && echo yes || echo no)"
echo "==============================================="
