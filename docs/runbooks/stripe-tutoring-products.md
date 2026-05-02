# Stripe — Tutoring Products & Subscriptions Runbook

> Owner: Founder. Audience: Founder (non-technical). Last reviewed: 2026-05-02.

This runbook covers the manual Stripe Dashboard work required to wire up the
year-round tutoring offering (Drop-in / Weekly / Twice-Weekly / IEP Review).
Engineering has already implemented the code; the items below cannot be
managed in code and must be done in the Stripe Dashboard.

Total time: ~30 minutes in test mode, then ~10 minutes to mirror in live mode
on launch day.

---

## Prerequisites

- You're signed in to the Stripe Dashboard at https://dashboard.stripe.com
- You're operating in the **Cure Consulting Group** Stripe account (the same
  account that already hosts the cohort deposit products)
- Toggle in the top-left says **"Test mode"** while you do the initial setup.
  We'll switch to Live at the very end (Step 6).

---

## Step 1 — Create the 4 tutoring products

Go to: **Products** → **Add product** (https://dashboard.stripe.com/test/products)

Create each of the following four products. The price-ID column will be
populated when you save each product — copy the price IDs into a temporary
note (Notes app, sticky note, anywhere). You'll paste them into env config
in Step 2.

### Product 1 — Tutoring · Single session (drop-in)

| Field | Value |
|---|---|
| Name | `Tutoring — Single session` |
| Description | `One 60-minute 1-on-1 tutoring session with our SPED interventionist. No commitment.` |
| Image | (optional — re-use cohort product image) |
| Pricing model | **Standard pricing** |
| Price | `$125.00 USD` |
| Billing period | **One-time** |
| Tax behaviour | Inclusive of tax (or whatever default the rest of the account uses) |

Click **Save product**, then on the resulting page copy the price ID from the
top-right of the **Pricing** section. It looks like `price_1PxxxxxxKF7ECoyb7H...`.

→ Store as: **`STRIPE_TUTORING_DROPIN_PRICE_ID`**

### Product 2 — Tutoring · Weekly (recurring)

| Field | Value |
|---|---|
| Name | `Tutoring — Weekly` |
| Description | `Four 60-minute sessions per month. One session per week. Pause or cancel anytime.` |
| Pricing model | **Standard pricing** |
| Price | `$460.00 USD` |
| Billing period | **Recurring · Monthly** |

Save, then copy the price ID.

→ Store as: **`STRIPE_TUTORING_WEEKLY_PRICE_ID`**

### Product 3 — Tutoring · Twice-Weekly (recurring)

| Field | Value |
|---|---|
| Name | `Tutoring — Twice-Weekly` |
| Description | `Eight 60-minute sessions per month. Two sessions per week. Priority slot. Pause or cancel anytime.` |
| Pricing model | **Standard pricing** |
| Price | `$880.00 USD` |
| Billing period | **Recurring · Monthly** |

Save, then copy the price ID.

→ Store as: **`STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID`**

### Product 4 — Tutoring · IEP Review (one-time add-on)

| Field | Value |
|---|---|
| Name | `Tutoring — IEP Review` |
| Description | `One-time 60-minute IEP review session. Review your child's current IEP, identify gaps, and prepare for the next CSE meeting.` |
| Pricing model | **Standard pricing** |
| Price | `$250.00 USD` |
| Billing period | **One-time** |

Save, then copy the price ID.

→ Store as: **`STRIPE_TUTORING_IEP_REVIEW_PRICE_ID`**

> **Sanity check:** at the end of Step 1 you should have a Notes-app entry that
> looks like:
>
> ```
> STRIPE_TUTORING_DROPIN_PRICE_ID=price_1Pxxx...
> STRIPE_TUTORING_WEEKLY_PRICE_ID=price_1Pxxx...
> STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID=price_1Pxxx...
> STRIPE_TUTORING_IEP_REVIEW_PRICE_ID=price_1Pxxx...
> ```

---

## Step 2 — Add the 4 price IDs to env config

The variable names above must match exactly — the code in `lib/subscription.ts`
(`stripePriceIdEnvVar()`) and the Cloud Function checkout handlers look them
up by name.

### 2a. Local dev (`.env.local`)

Open the project repo and edit `.env.local` (create if it doesn't exist):

```env
# Tutoring — added 2026-05-02
STRIPE_TUTORING_DROPIN_PRICE_ID=price_1Pxxx...
STRIPE_TUTORING_WEEKLY_PRICE_ID=price_1Pxxx...
STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID=price_1Pxxx...
STRIPE_TUTORING_IEP_REVIEW_PRICE_ID=price_1Pxxx...
```

Restart the Next.js dev server so the new vars load.

### 2b. Firebase Functions config (production)

The Cloud Functions read these from Firebase Functions params (gen 2) /
runtime config (gen 1). Use the Firebase CLI:

```bash
# From the repo root, with firebase-tools installed and logged in:
firebase functions:secrets:set STRIPE_TUTORING_DROPIN_PRICE_ID
# (paste the price_1Pxxx... value when prompted)

firebase functions:secrets:set STRIPE_TUTORING_WEEKLY_PRICE_ID
firebase functions:secrets:set STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID
firebase functions:secrets:set STRIPE_TUTORING_IEP_REVIEW_PRICE_ID
```

Then redeploy the affected functions:

```bash
firebase deploy --only functions:stripeCheckout,functions:subscriptionCheckout,functions:stripeWebhook
```

> If the `subscriptionCheckout` function name doesn't exist yet, that's
> because it ships in ticket H3. Re-run the deploy after H3 lands.

---

## Step 3 — Configure the Stripe Customer Portal

The Customer Portal is where parents manage their own subscription
(cancel / pause / update payment method) without contacting the founder.

Navigate to: **Settings** → **Billing** → **Customer portal**
(https://dashboard.stripe.com/test/settings/billing/portal)

Configure each section as follows:

### Business information

- **Headline:** `Manage your IEP & Thrive tutoring subscription`
- **Privacy policy URL:** `https://iepandthrive.com/privacy`
- **Terms of service URL:** `https://iepandthrive.com/terms`

### Branding

- **Icon / Logo:** upload the IEP & Thrive logo (same one used elsewhere)
- **Primary brand color:** `#1B4332` (the forest token)
- **Accent color:** `#40916C` (the forest-light token)

### Customer information

- **Allow customers to update:** ✅ Email · ✅ Billing address · ✅ Phone
  *(do NOT allow name updates — we use Firebase Auth display name)*

### Payment methods

- ✅ **Allow customers to update payment method**

### Invoice history

- ✅ **Allow customers to view their invoice history**

### Cancellations

- ✅ **Allow customers to cancel subscriptions**
- **Mode:** **Cancel at end of billing period** *(NOT immediately — this is
  important; the parent keeps remaining sessions in the cycle they paid for)*
- **Reason collection:** Optional — turn ON. Reasons surface in Stripe and
  inform our churn analysis.

### Subscription pause

- ✅ **Allow customers to pause subscriptions**
- **Behavior:** **Mark uncollectible** *(no charges while paused)*
- **Resume:** **Customer can resume anytime**
- **Maximum pause length:** `3 months` *(forces a check-in if they pause
  longer; founder can manually extend)*

### Subscription updates

- ❌ **Do NOT enable plan switching in the portal.** Tier changes flow through
  the founder so we can re-validate slot availability. Parents asking to
  switch tiers email `hello@iepandthrive.com`.

### Default redirect URL

- **Return URL:** `https://iepandthrive.com/portal/subscription`

  *(In test mode you can set `https://localhost:3000/portal/subscription` —
  switch to the production URL when you flip to Live in Step 6.)*

Click **Save changes** at the top of the page. There's no preview link in
test mode by default, but the next time the `customerPortal` Cloud Function
mints a session URL it will use this config.

---

## Step 4 — Configure the webhook endpoint

The webhook is how Stripe tells our backend "this subscription changed" —
without it, parent-facing state in `users/{uid}.subscription` will go stale.

The webhook endpoint already exists for cohort deposits. We're going to
**add new event subscriptions** to that same endpoint.

Navigate to: **Developers** → **Webhooks**
(https://dashboard.stripe.com/test/webhooks)

### 4a. Find the existing endpoint

Look for the endpoint pointing at the deployed `stripeWebhook` Cloud Function.
URL will look like:

```
https://us-east4-iep-and-thrive.cloudfunctions.net/stripeWebhook
```

(or `https://stripewebhook-{hash}-uc.a.run.app` if it's a gen 2 function URL).

If you don't see it, you skipped the original Stripe setup. See
`docs/runbooks/firestore-backups.md` for the analogous setup pattern, or
contact engineering — that one-time deposit flow should already be live.

Click into the endpoint to edit it.

### 4b. Add new events

Click **+ Select events** at the bottom. The following events must be
subscribed (some may already be subscribed for the cohort flow — that's
fine, just confirm they're checked):

**New subscriptions to add:**

- ✅ `customer.subscription.created`
- ✅ `customer.subscription.updated`
- ✅ `customer.subscription.deleted`
- ✅ `invoice.payment_failed`

**Verify already subscribed (cohort flow needs these):**

- ✅ `checkout.session.completed`
- ✅ `invoice.paid`

> Total: **6 events** when you're done. If you see a warning that
> `invoice.paid` and `invoice.payment_succeeded` are duplicates — keep
> `invoice.paid` (Stripe's preferred name).

Click **Update endpoint** at the bottom.

### 4c. Confirm the signing secret hasn't rotated

The webhook signing secret (`STRIPE_WEBHOOK_SECRET` env var) is project-wide,
not per-endpoint, but **adding new events** does not rotate it. You should
NOT need to change `STRIPE_WEBHOOK_SECRET`. Confirm by sending a test event:

1. On the endpoint detail page, click **Send test webhook**
2. Choose `customer.subscription.created`
3. Click **Send test webhook**
4. Open Firebase Functions logs:

   ```bash
   firebase functions:log --only stripeWebhook --lines 50
   ```

   You should see a successful 200 response and a log entry from the new
   handler. If you see a 401 / signature-mismatch error, the secret has
   drifted — re-run:

   ```bash
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
   ```

   and paste the **Signing secret** from the endpoint detail page.

---

## Step 5 — Run an end-to-end test (Test mode)

Before flipping to Live, verify the full loop works:

1. **Start a test subscription:**
   - Go to https://iepandthrive.com (or your local dev URL)
   - Sign in with a test parent account (see `scripts/test-accounts.md`)
   - Visit `/tutoring`, click **Start Weekly — $460/mo**
   - At the Stripe Checkout page, use the test card `4242 4242 4242 4242`
     with any future expiry, any CVC, any ZIP
   - Submit. You should be redirected to `/portal/subscription?welcome=1`

2. **Verify the data:**
   - In Firebase Console, open the `users/{uid}` doc for the test parent
   - Confirm a `subscription` map exists with:
     - `tier: "weekly"`
     - `status: "active"`
     - `sessionsAllowedPerCycle: 4`
     - `sessionsUsedThisCycle: 0`
     - `currentPeriodEnd: <future date>`

3. **Verify the email:**
   - Check the Gmail inbox — a "Welcome to weekly tutoring" email should
     have arrived
   - Check `emailLog/` in Firestore for the audit row

4. **Test cancellation through the customer portal:**
   - Visit `/portal/subscription` → click **Manage subscription**
   - In the Stripe portal, click **Cancel subscription**
   - Confirm. Stripe should respond "Subscription will end on [date]"
   - Back in Firestore, the `users/{uid}.subscription.cancelAtPeriodEnd`
     should now be `true`. Status remains `"active"` until the period ends.

5. **Test failed payment recovery:**
   - On the Stripe Dashboard, find the test subscription → **Actions**
     → **Update default payment method** → use card `4000 0000 0000 0341`
     (Stripe's "card declines on first attempt" test card)
   - Force a renewal (Stripe Dashboard → Subscription → Actions →
     **Advance test clock** to next period end)
   - Webhook fires `invoice.payment_failed`
   - Verify `users/{uid}.subscription.status` flips to `"past_due"`
   - The `/portal/subscription` page should now show the past-due banner

If any step fails, fix before moving to Step 6.

---

## Step 6 — Flip to Live mode

When test mode is verified end-to-end:

1. **Toggle to Live mode** (top-left of Stripe Dashboard)
2. **Repeat Step 1** in Live mode — create the 4 products with identical
   names, descriptions, and prices. *Live products are separate entities
   from test products; you can't promote them.* Capture the 4 new live
   price IDs.
3. **Repeat Step 2** with the live price IDs:
   - Update `.env.local` (only if your local dev hits live Stripe, which
     it normally shouldn't — keep test IDs locally)
   - **Critical:** update Firebase Functions secrets with the LIVE price IDs:
     ```bash
     firebase functions:secrets:set STRIPE_TUTORING_DROPIN_PRICE_ID  # paste LIVE id
     firebase functions:secrets:set STRIPE_TUTORING_WEEKLY_PRICE_ID
     firebase functions:secrets:set STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID
     firebase functions:secrets:set STRIPE_TUTORING_IEP_REVIEW_PRICE_ID
     ```
   - Redeploy:
     ```bash
     firebase deploy --only functions:stripeCheckout,functions:subscriptionCheckout,functions:stripeWebhook
     ```
4. **Repeat Step 3** in Live mode — Customer Portal config is also
   separate per-mode. Use the same settings, but the Return URL is the
   production URL (`https://iepandthrive.com/portal/subscription`).
5. **Repeat Step 4** in Live mode — add the same 6 events to the live
   webhook endpoint. Confirm `STRIPE_WEBHOOK_SECRET` matches the live
   endpoint's signing secret (these ARE per-endpoint and DO differ between
   test and live):
   ```bash
   firebase functions:secrets:set STRIPE_WEBHOOK_SECRET  # paste LIVE secret
   firebase deploy --only functions:stripeWebhook
   ```
6. **Smoke test in Live mode** with a real card you control (charge $125
   for a drop-in, then immediately refund from the Stripe Dashboard).
   Verify the booking page lets you book a slot, then refund.

---

## Step 7 — Tell engineering / mark the runbook done

Once Live mode is verified:

- Slack / email engineering: "Tutoring Stripe products live, env vars deployed"
- Update STATE.md with the live price IDs (last 4 chars only — not the full
  IDs) for the audit trail
- Mark backlog ticket **H2** as complete in `scripts/backlog.yml`

---

## Reference — env var contract

The env var names below are not arbitrary — they're emitted by
`lib/subscription.ts stripePriceIdEnvVar()` and consumed by the Cloud
Functions. **Do not rename them** without updating both.

| Tier | Env var name | Mode |
|---|---|---|
| Drop-in | `STRIPE_TUTORING_DROPIN_PRICE_ID` | one-time |
| Weekly | `STRIPE_TUTORING_WEEKLY_PRICE_ID` | recurring monthly |
| Twice-Weekly | `STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID` | recurring monthly |
| IEP Review | `STRIPE_TUTORING_IEP_REVIEW_PRICE_ID` | one-time |

## Reference — webhook event contract

| Event | Handler in code | Effect |
|---|---|---|
| `customer.subscription.created` | `stripeWebhook` | Writes `users/{uid}.subscription`, sends welcome email |
| `customer.subscription.updated` | `stripeWebhook` | Patches status / periodEnd / cancelAtPeriodEnd |
| `customer.subscription.deleted` | `stripeWebhook` | `status='canceled'`, sends cancellation email |
| `invoice.paid` | `stripeWebhook` | Resets `sessionsUsedThisCycle` to 0; sends monthly receipt |
| `invoice.payment_failed` | `stripeWebhook` | `status='past_due'`, sends payment-update email |
| `checkout.session.completed` | `stripeWebhook` | (existing — handles cohort deposits) |

---

## Troubleshooting

**Q: Webhook deliveries are failing in the Stripe Dashboard "Recent events" tab.**

Check the response body. Common causes:
- `Webhook signature mismatch` → `STRIPE_WEBHOOK_SECRET` is stale; re-run
  `firebase functions:secrets:set STRIPE_WEBHOOK_SECRET` and redeploy.
- `5xx error` → check Cloud Functions logs for an unhandled exception in
  the new subscription handlers.

**Q: Parent reports they paid but `/portal/subscription` shows empty state.**

Check `users/{uid}.subscription` in Firestore. If absent, the
`customer.subscription.created` webhook didn't process. Look for the event
in the Stripe Dashboard's webhook log; resend it manually with **Resend
selected events** if needed.

**Q: I created the products in Live mode but the marketing page still shows "$0".**

You likely missed Step 2b — Firebase Functions secrets weren't updated and
the live deploy is still pointing at test price IDs. Re-run Step 2b for
Live mode.

---

## Change log

| Date | Author | Change |
|---|---|---|
| 2026-05-02 | Initial draft (H2) | First version covering tutoring product setup |
