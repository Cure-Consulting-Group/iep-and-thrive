#!/usr/bin/env bash
#
# H2 — Create the 4 Stripe tutoring products + prices via the Stripe REST API.
# Outputs an env-snippet at the bottom you append to functions/.env.
#
# Auth: pass STRIPE_API_KEY in the environment. Either:
#   - Pull from GCP Secret Manager:
#       STRIPE_API_KEY=$(gcloud secrets versions access latest \
#         --secret=STRIPE_SECRET_KEY --project=iep-and-thrive) \
#         bash scripts/create-stripe-tutoring-products.sh
#   - Or paste a one-time Restricted Key with `products:write` + `prices:write`:
#       STRIPE_API_KEY=rk_live_xxx bash scripts/create-stripe-tutoring-products.sh
#
# Idempotency:
#   The Stripe API doesn't dedupe by name. Re-running creates duplicates.
#   If you already ran this once, archive duplicates from Dashboard or skip.
#
# After running:
#   1. Append the printed STRIPE_TUTORING_*_PRICE_ID lines to functions/.env
#   2. Redeploy functions: firebase deploy --only functions
#   3. Verify in Stripe Dashboard → Products that all 4 are visible & active.

set -euo pipefail

if [[ -z "${STRIPE_API_KEY:-}" ]]; then
  echo "ERROR: STRIPE_API_KEY env var not set." >&2
  echo "" >&2
  echo "Try:" >&2
  echo "  STRIPE_API_KEY=\$(gcloud secrets versions access latest \\" >&2
  echo "    --secret=STRIPE_SECRET_KEY --project=iep-and-thrive) \\" >&2
  echo "    bash scripts/create-stripe-tutoring-products.sh" >&2
  exit 1
fi

if [[ ! "$STRIPE_API_KEY" =~ ^(sk|rk)_ ]]; then
  echo "ERROR: STRIPE_API_KEY does not look like a Stripe key (expected sk_ or rk_ prefix)." >&2
  exit 1
fi

# Stripe REST API helper. Stays in process; never echoes the key.
post() {
  local endpoint="$1" ; shift
  local response
  response=$(curl -s --fail-with-body -u "$STRIPE_API_KEY:" \
    "https://api.stripe.com/v1/$endpoint" "$@")
  echo "$response"
}

extract_id() {
  python3 -c "import sys, json; d=json.load(sys.stdin); print(d.get('id') or sys.exit('Stripe error: ' + d.get('error',{}).get('message','unknown')))"
}

echo "[H2] Creating tutoring products..."

# 1. Drop-in / single session — $125 one-time
echo "[H2] (1/4) Drop-in single session"
DROPIN_PRODUCT=$(post "products" \
  -d "name=Tutoring — Single Session" \
  --data-urlencode "description=One 60-minute 1-on-1 tutoring session with the IEP & Thrive founder. No subscription required. Zoom or Long Island in-person." \
  | extract_id)
DROPIN_PRICE=$(post "prices" \
  -d "product=$DROPIN_PRODUCT" -d "unit_amount=12500" -d "currency=usd" \
  | extract_id)
echo "    product=$DROPIN_PRODUCT  price=$DROPIN_PRICE"

# 2. Weekly subscription — $460/month recurring
echo "[H2] (2/4) Weekly subscription"
WEEKLY_PRODUCT=$(post "products" \
  -d "name=Tutoring — Weekly" \
  --data-urlencode "description=4 × 60-minute 1-on-1 tutoring sessions per month. \$115/session. Pause or cancel anytime. Sessions don't roll over." \
  | extract_id)
WEEKLY_PRICE=$(post "prices" \
  -d "product=$WEEKLY_PRODUCT" -d "unit_amount=46000" -d "currency=usd" \
  -d "recurring[interval]=month" \
  | extract_id)
echo "    product=$WEEKLY_PRODUCT  price=$WEEKLY_PRICE"

# 3. Twice-weekly subscription — $880/month recurring
echo "[H2] (3/4) Twice-Weekly subscription"
TWICE_PRODUCT=$(post "products" \
  -d "name=Tutoring — Twice-Weekly" \
  --data-urlencode "description=8 × 60-minute 1-on-1 tutoring sessions per month. \$110/session. For acute regression sprints + CSE prep. Pause or cancel anytime." \
  | extract_id)
TWICE_PRICE=$(post "prices" \
  -d "product=$TWICE_PRODUCT" -d "unit_amount=88000" -d "currency=usd" \
  -d "recurring[interval]=month" \
  | extract_id)
echo "    product=$TWICE_PRODUCT  price=$TWICE_PRICE"

# 4. IEP review — $250 one-time
echo "[H2] (4/4) IEP Review session"
IEP_PRODUCT=$(post "products" \
  -d "name=Tutoring — IEP Review" \
  --data-urlencode "description=75-minute IEP review with the founder. Includes a written summary you can share with your child's school team. CSE-meeting ready." \
  | extract_id)
IEP_PRICE=$(post "prices" \
  -d "product=$IEP_PRODUCT" -d "unit_amount=25000" -d "currency=usd" \
  | extract_id)
echo "    product=$IEP_PRODUCT  price=$IEP_PRICE"

cat <<ENVEOF

════════════════════════════════════════════════════════════
✅ All 4 products created. Append to functions/.env:
════════════════════════════════════════════════════════════

# Tutoring (Epic H — see docs/runbooks/stripe-tutoring-products.md)
STRIPE_TUTORING_DROPIN_PRICE_ID=$DROPIN_PRICE
STRIPE_TUTORING_WEEKLY_PRICE_ID=$WEEKLY_PRICE
STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID=$TWICE_PRICE
STRIPE_TUTORING_IEP_REVIEW_PRICE_ID=$IEP_PRICE

Then redeploy functions:
  firebase deploy --only functions --project=iep-and-thrive

Don't forget the H2 runbook's other steps:
  - Enable webhook events: customer.subscription.created/updated/deleted,
    invoice.paid, invoice.payment_failed
  - Configure Customer Portal: cancel at period end + pause + payment update
════════════════════════════════════════════════════════════
ENVEOF
