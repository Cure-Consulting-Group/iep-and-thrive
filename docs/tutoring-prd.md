# PRD — Year-Round Tutoring Booking & Subscription

**Feature:** `/tutoring` marketing page + 3-tier paid offering (drop-in, weekly, twice-weekly subscription) + IEP review add-on, bookable via existing Firestore booking system, billed via Stripe one-time + subscription.

**Launch target:** 2–3 weeks (alongside cohort enrollment close 2026-05-30).

**Author:** PM brief · 2026-05-02
**Status:** Approved (founder), pricing confirmed at $125/hr baseline

---

## 1. Recommendation

Ship a tightly-scoped year-round tutoring offering as the second revenue line: a single one-page marketing surface, three product cards, and bookings that reuse the existing `/book` + `availableSlots/` + `bookings/` infra. Use Stripe subscription mode (new) for recurring tiers + existing one-time mode for drop-in.

**Why now:**
- Founder is already delivering tutoring informally — productizing it into the website unlocks pipeline and predictable MRR.
- Cohort enrollment closes May 30 → next ~5 weeks of marketing traffic has nowhere to convert if not cohort-fit. Tutoring captures "not ready for 6-week intensive" leads.
- Year-2 backlog ticket F3 (school-year Saturday tutoring, recurring billing) was already on the roadmap — pulling it forward into Cohort 1 timeframe at low marginal cost.

**What we're building (MVP):**
1. `/tutoring` one-pager: positioning, who it's for, what's included, instructor credibility, FAQ, three pricing cards + IEP review add-on
2. Three Stripe products with pricing below
3. Booking flow: subscriber-gated calendar, drop-in checkout-then-book
4. Parent portal "My subscription" surface (manage, pause, cancel via Stripe customer portal)
5. Admin view: subscribers, sessions remaining this month, no-show flag

---

## 2. Positioning

**Tagline:** *"Year-round 1-on-1 tutoring with the same SPED interventionist behind our summer intensive."*

**Audience cuts** (all share base persona — LI/NYC parents of students with IEPs/LDs):

| Segment | Why they buy tutoring (not cohort) |
|---|---|
| Cohort alumni | Maintain summer gains during school year |
| Cohort-curious but cautious | Lower-commitment trial of the practitioner before $4K cohort decision |
| Wrong calendar fit | Family travel / camp / sport blocks summer commitment |
| Acute mid-year need | School year regression, upcoming CSE meeting, IEP rewrite season |
| Sibling overflow | One sibling in cohort, another needs lighter touch |

**Differentiation vs. generic LI tutors ($60–90/hr):**
- NYS Certified SPED + 8 yrs NYC DOE + Orton-Gillingham trained
- IEP-aligned curriculum, not workbook-driven
- CSE-meeting prep as a discrete add-on
- Same instructor delivering the well-positioned summer cohort (cross-trust)

**Differentiation vs. premium private specialists ($150–175/hr):**
- Subscription packaging (predictable monthly cost vs. la carte hourly)
- Same tier of credential at a more accessible $125/hr baseline
- Tightly integrated with cohort program (continuity of relationship + data)

---

## 3. Packaging & Pricing

| Tier | Price | Cadence | Effective $/session | Save vs drop-in |
|---|---|---|---|---|
| **Drop-in / Single session** | **$125** | 1-hr, one-time | $125 | — |
| **Weekly** ⭐ | **$460 / mo** | 4 × 1-hr / mo (1×/wk) | $115 | $40/mo |
| **Twice-Weekly** | **$880 / mo** | 8 × 1-hr / mo (2×/wk) | $110 | $120/mo |
| **IEP Review** *(add-on, anyone)* | **$250** one-time | 75-min review + written summary | — | — |

**Pricing rationale:**
- Drop-in priced exactly at the founder's existing baseline ($125/hr) — sets the anchor.
- Weekly subscription discounts to $115/session — rewards 4-session commitment, $40/mo savings communicates clearly.
- Twice-weekly modest additional discount to $110/session — rewards 8-session commitment for higher-need families without devaluing.
- IEP review priced as a productized service ($250 for 75 min + written summary) — premium reflects founder's CSE-meeting expertise that generic tutors can't match.

**Subscription mechanics:**
- Monthly recurring billing via Stripe.
- Sessions don't roll over month-to-month (avoids stockpile gaming + capacity risk).
- 24-hour cancellation window: same-day cancels forfeit the session.
- Pause/cancel anytime via Stripe customer portal — no "call to cancel" friction.

---

## 4. Success Metrics

### Primary (lead, 30 days post-launch)
- **# active paid subscriptions** — Target: 5
- **# completed drop-in sessions** — Target: 10

### Primary (lag, 90 days post-launch)
- **Tutoring MRR** — Target: $2,300 (5 × Weekly base) → $4,500 stretch (mix of tiers + IEP reviews)

### Funnel
- `/tutoring` page view → CTA click rate — Target: ≥ 12%
- CTA click → Stripe checkout open — Target: ≥ 60%
- Stripe checkout open → subscription/payment success — Target: ≥ 40%
- Subscription start → first session booked within 14 days — Target: ≥ 90%

### Guardrails (must not regress)
- **Month-2 subscriber retention** ≥ 80%
- **Founder weekly utilization** ≤ 85% (slot booking cap enforces this)
- **Cohort enrollment count** does not drop vs. pre-tutoring weekly baseline (cannibalization watch)
- **No-show rate** ≤ 10%

### North star contribution
North star: **active paying customers** (cohort + tutoring combined). Tutoring expected to grow this 3–5× over the next 12 mo by extending the relationship beyond the 6-week summer window.

---

## 5. Scope (User Story Map — MVP)

```
Discover tutoring → Visit /tutoring → R1 — One-pager with 3 cards + IEP add-on
                  → Read FAQ        → R1 — 6-question accordion
                  → See instructor  → R1 — Reuse founder block

Pick a plan → Click "Start Weekly"        → R1 — Stripe subscription checkout
            → Click "Try a session"       → R1 — Stripe one-time checkout
            → Click "Book IEP review"     → R1 — Stripe one-time checkout

Book session → Calendar of slots     → R1 — Reuses /book infra,
                                            gated by subscription/credit
             → Confirm booking       → R1 — Existing onBookingCreated
             → Reminder 24h before   → R1 — Reuse sendBookingReminders

Manage plan → /portal/subscription   → R1 — Customer portal link + status
            → Pause/cancel           → R1 — Stripe customer portal
            → See sessions used      → R1 — Read from bookings/

Admin → /admin/subscribers           → R1 — List + filters
      → Mark no-show                 → R1 — Existing booking update flow

DEFERRED (R2+):
  Multi-student family bundles
  Group small-pod tutoring (2-3 students)
  Sliding scale / scholarship tier
  Sub-rolling sessions across months
  Pre/post benchmark in subscription tier
  In-portal session video recordings
  Parent → instructor messaging (already on backlog as D8)
  Annual prepay discount
```

---

## 6. Non-Goals (explicit `no` list)

- ❌ **Hourly contractor model** — we're packaging into subscriptions, not selling time
- ❌ **Group classes** — solo founder, would dilute capacity
- ❌ **Curriculum customization beyond OG framework** — leverage existing assets
- ❌ **In-home tutoring** — fixed location/Zoom only
- ❌ **Discount/coupon system** — no promo infra in V1
- ❌ **Multi-instructor capacity** — sole-founder ceiling is the design constraint
- ❌ **Annual billing** — monthly only; reduces churn observability and refund complexity
- ❌ **A new auth flow** — reuse Firebase Auth (parent must be logged in to book gated slots)

---

## 7. Assumptions (must be true)

| # | Assumption | Confidence | If false → |
|---|---|---|---|
| A1 | Founder has 12–15 tutoring slots/wk available outside cohort weeks | High | Reduce subscriber cap |
| A2 | Stripe subscription mode integrates cleanly with existing webhook | High | 2-day rework spike |
| A3 | Existing `availableSlots/` schema can carry a `type: 'tutoring'` flag without breaking discovery-call booking | High | Schema migration |
| A4 | Parents will accept "no rollover" sessions policy | Medium | Add 1-month grace; expect retention dip |
| A5 | Zoom is acceptable delivery for ≥ 60% of demand | Medium | Add in-person LI surcharge |
| A6 | Tutoring won't cannibalize cohort enrollment > 10% | Medium | Re-position tutoring as "while you decide" |

---

## 8. Open Questions (founder, soft deadline 2026-05-09)

| # | Question |
|---|---|
| Q1 | Cohort pause policy: do cohort enrollees get tutoring at a discount? |
| Q2 | Zoom-only or Zoom + in-person LI option in V1? |
| Q3 | Do we cap subscribers (e.g., 12 active) and waitlist beyond? |
| Q4 | Founder's weekly available-slot grid (drives `/admin/slots` seeding) |
| Q5 | Days/times during cohort weeks (June–Aug) that are off-limits |
| Q6 | IEP Review session: deliverable scope confirmed as 75-min + written summary? |

---

## 9. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Cannibalizes cohort enrollment | Med | High | Position tutoring as complementary, not substitute. Track cohort weekly inquiries pre/post launch. |
| Founder over-commits capacity | Med | High | Slot cap enforced in `/book` calendar. Subscription waitlist when cap reached. |
| Subscription dunning friction | Low | Med | Use Stripe customer portal for cancellation/payment update — no custom UI. |
| Same-day cancellation gaming | Med | Med | Hard 24h window; missed = forfeit. Surface policy in checkout + reminder email. |
| Cohort + tutoring calendar collision during June–Aug | High | Med | Pause new subscriptions during cohort weeks; existing subscribers reduced cadence. |

---

## 10. Sprint Cut (2-week launch)

### Sprint 1 (Week 1)
- **T1** — `/tutoring` page (one-pager, 3 product cards + IEP add-on, FAQ) — frontend, P0
- **T2** — Stripe products: 4 prices (3 tiers + IEP review) + customer portal config — config, P0
- **T3** — `subscriptionCheckout` Cloud Function for recurring mode — backend, P0
- **T4** — Subscription state model in Firestore (`users/{uid}.subscription = { tier, status, currentPeriodEnd, sessionsUsedThisCycle, sessionsAllowedPerCycle }`) — schema, P0
- **T5** — Stripe webhook handler extension for `customer.subscription.*` + `invoice.*` events — backend, P0

### Sprint 2 (Week 2)
- **T6** — Booking gate: `availableSlots/{type: 'tutoring'}` only bookable by active subscribers (decrements `sessionsUsedThisCycle`) OR drop-in flow (paid checkout-then-book) — frontend + rules, P0
- **T7** — `/portal/subscription` page (status + Customer Portal link + sessions counter) — frontend, P0
- **T8** — Admin `/admin/subscribers` view — frontend, P1
- **T9** — Email templates: subscription start, monthly receipt, "session forfeited" reminder — Cloud Functions, P1
- **T10** — Slot seeding tool / runbook for founder to populate her weekly grid — internal, P0
- **T11** — Playwright e2e: drop-in flow + subscription checkout flow + subscriber booking flow — tests, P0

### Cut from MVP (defer to V2)
- Group tutoring
- Family bundles
- Promo codes
- Annual billing
- Auto-rebook recurring time slot ("same Tuesday 4pm every week")

---

## 11. Definition of Done

- [ ] All 11 tickets shipped + tested
- [ ] Stripe products live in production (not test mode)
- [ ] First real subscriber can pay → book → attend → retain through second month
- [ ] Founder can manage her availability via admin without engineering support
- [ ] `/tutoring` page passes Lighthouse perf + a11y same bar as cohort site
- [ ] Analytics events fire for: page view, CTA click, checkout open, subscription created, first session booked
