#!/usr/bin/env bash
#
# H2 — Create the 4 Stripe tutoring products + prices via Stripe CLI.
# Outputs a .env-snippet at the bottom with the price IDs to copy into
# functions runtime config.
#
# Prerequisites:
#   - `stripe` CLI installed and logged in to the IEP & Thrive (Cure
#     Consulting) account: `stripe login`
#   - You're running in LIVE mode (the cohort products are live; we
#     match). To test first, replace `--live` with `--test` everywhere.
#   - This script is IDEMPOTENT-by-name: re-running creates duplicate
#     products. If you've already run it once, archive duplicates from
#     the Stripe Dashboard or skip rows you've already created.
#
# Run:
#   bash scripts/create-stripe-tutoring-products.sh
#
# After running:
#   - Copy the env snippet into Firebase Functions runtime config
#     (Cloud Run console -> functions -> Edit & deploy revision -> env)
#     or run:
#       firebase functions:secrets:set STRIPE_TUTORING_DROPIN_PRICE_ID
#       (etc., one per env var)
#   - Verify in Stripe Dashboard -> Products that all 4 are visible
#     and active.

set -euo pipefail

MODE="${MODE:---live}"

extract_id() {
  python3 -c "import sys, json; d=json.load(sys.stdin); print(d['id'])"
}

echo "[H2] Creating tutoring products in $MODE mode..."

# 1. Drop-in / single session — $125 one-time
echo "[H2] (1/4) Drop-in single session"
DROPIN_PRODUCT=$(stripe products create $MODE \
  --name="Tutoring — Single Session" \
  --description="One 60-minute 1-on-1 tutoring session with the IEP & Thrive founder. No subscription required. Zoom or Long Island in-person." \
  | extract_id)
DROPIN_PRICE=$(stripe prices create $MODE \
  --product="$DROPIN_PRODUCT" \
  --unit-amount=12500 \
  --currency=usd \
  | extract_id)
echo "    product=$DROPIN_PRODUCT  price=$DROPIN_PRICE"

# 2. Weekly subscription — $460/month recurring
echo "[H2] (2/4) Weekly subscription"
WEEKLY_PRODUCT=$(stripe products create $MODE \
  --name="Tutoring — Weekly" \
  --description="4 × 60-minute 1-on-1 tutoring sessions per month. \$115/session. Pause or cancel anytime. Sessions don't roll over." \
  | extract_id)
WEEKLY_PRICE=$(stripe prices create $MODE \
  --product="$WEEKLY_PRODUCT" \
  --unit-amount=46000 \
  --currency=usd \
  -d "recurring[interval]=month" \
  | extract_id)
echo "    product=$WEEKLY_PRODUCT  price=$WEEKLY_PRICE"

# 3. Twice-weekly subscription — $880/month recurring
echo "[H2] (3/4) Twice-Weekly subscription"
TWICE_PRODUCT=$(stripe products create $MODE \
  --name="Tutoring — Twice-Weekly" \
  --description="8 × 60-minute 1-on-1 tutoring sessions per month. \$110/session. For acute regression sprints + CSE prep. Pause or cancel anytime." \
  | extract_id)
TWICE_PRICE=$(stripe prices create $MODE \
  --product="$TWICE_PRODUCT" \
  --unit-amount=88000 \
  --currency=usd \
  -d "recurring[interval]=month" \
  | extract_id)
echo "    product=$TWICE_PRODUCT  price=$TWICE_PRICE"

# 4. IEP review — $250 one-time
echo "[H2] (4/4) IEP Review session"
IEP_PRODUCT=$(stripe products create $MODE \
  --name="Tutoring — IEP Review" \
  --description="75-minute IEP review with the founder. Includes a written summary you can share with your child's school team. CSE-meeting ready." \
  | extract_id)
IEP_PRICE=$(stripe prices create $MODE \
  --product="$IEP_PRODUCT" \
  --unit-amount=25000 \
  --currency=usd \
  | extract_id)
echo "    product=$IEP_PRODUCT  price=$IEP_PRICE"

cat <<ENVEOF

════════════════════════════════════════════════════════════
✅ All 4 products created. Copy these env vars to Firebase Functions:
════════════════════════════════════════════════════════════

STRIPE_TUTORING_DROPIN_PRICE_ID=$DROPIN_PRICE
STRIPE_TUTORING_WEEKLY_PRICE_ID=$WEEKLY_PRICE
STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID=$TWICE_PRICE
STRIPE_TUTORING_IEP_REVIEW_PRICE_ID=$IEP_PRICE

Set them via:
  firebase functions:secrets:set STRIPE_TUTORING_WEEKLY_PRICE_ID
  firebase functions:secrets:set STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID
  (drop-in + iep-review are reused via the existing stripeCheckout
  function and may not need separate secrets — see lib/functions-config.ts)

Then redeploy functions:
  firebase deploy --only functions --project=iep-and-thrive

════════════════════════════════════════════════════════════
ENVEOF
