# Design Spec — Tutoring Booking & Subscription

**Companion to:** `docs/tutoring-prd.md`
**Platform:** Web (Next.js 14 SSG) · WCAG AA · 8px grid
**Tokens:** existing IEP & Thrive system (forest/sage/cream/amber + Playfair/DM Sans) — no new tokens

---

## 1. `/tutoring` — Page anatomy & section order

```
1.  Nav (existing — add "Tutoring" link)
2.  TutoringHero        [copy left | "Included" panel right · forest bg]
3.  Trust Strip         [3 stats · forest bg · white text]
4.  Who This Is For     [4-card audience grid · cream-deep]
5.  Pricing             [3 PricingCards · cream]
6.  IEPReviewBanner     [horizontal add-on · sage-pale bg]
7.  How It Works        [3 steps · cream]
8.  About the Founder   [reuse AboutFounder, condensed copy]
9.  FAQ                 [reuse FAQ atom, 6 tutoring-specific Qs]
10. Bottom CTA          [forest bg · "Ready to start?" + CTA]
11. Footer (existing — add "Tutoring" entry)
```

### Hero copy
- Eyebrow pill (sage-pale + forest): `🌱 1-ON-1 TUTORING · YEAR-ROUND · LONG ISLAND + ZOOM`
- H1: *"The same SPED expertise — every week of the year."* ("every week" italic, --forest-mid)
- Subhead: "1-hour sessions with the credentialed NYC SPED interventionist behind our summer intensive. Subscribe monthly for predictable support, or try a single session."
- Primary CTA: "See plans →" (--forest bg pill, scroll to #pricing)
- Secondary: "Book a single session" (outline pill, scroll to drop-in card)

### Right panel (--forest bg, 20px radius)
Label "INCLUDED IN EVERY SESSION" (sage uppercase) + checklist:
- 1-on-1 with founder (no associates)
- Aligned to your child's IEP goals
- Orton-Gillingham framework
- Weekly progress notes
- CSE-meeting prep on request
- Zoom or in-person Long Island

### Trust Strip (3 stats)
- `$125` Baseline per session
- `1-on-1` Solo founder, no associates
- `NYS Cert` SPED Interventionist + 8 yrs NYC DOE

### Who This Is For (4 cards)
- 📚 Cohort alumni — "Maintain summer gains during the school year."
- 🤔 Cohort-curious — "Try the practitioner before the 6-week commitment."
- 📅 Calendar conflict — "Camp, sports, travel block summer — we tutor year-round."
- 🎯 Mid-year crisis — "Regression, CSE meeting, IEP rewrite — we move fast."

---

## 2. `PricingCard` — Component

### Anatomy
- Tag pill (featured only)
- H4 plan name
- 2-line description
- Divider
- Price (Playfair 1.6rem) + unit
- Effective rate microcopy
- Feature list (4 items, sage/forest-light ✓)
- Single CTA (pill, full-width, 56px tall)
- Fine print microcopy

### Variants
| Variant | Background | Text | Use |
|---|---|---|---|
| `default` | white | --text | Drop-in (left), Twice-Weekly (right) |
| `featured` | --forest | white | Weekly (middle, "Most popular") |

### States
- **default** — static
- **hover** — `transform: translateY(-3px)` + `box-shadow: 0 8px 32px rgba(27,67,50,0.10)` + `transition: 0.2s ease`
- **focus** — hover + `outline: 2px solid var(--forest-mid)`
- **CTA loading** — pill spinner during Stripe redirect

### Spacing
- Padding: 32px desktop / 24px mobile
- Radius: 20px
- Section gap: 20px
- CTA: full-width, height 56px, radius 100px

### Card content (final)

**Card 1 — Drop-in (default):**
- Plan: "Single session"
- Desc: "Try the practitioner. No subscription, no commitment."
- Price: `$125`  / 60-min session
- Rate: "Pay per session · book within 30 days"
- Features: 1-on-1 founder · 60-min · IEP-aligned · Zoom or LI in-person
- CTA: "Book a single session →" → `/api/stripe/checkout?product=drop-in`
- Fine: "One-time charge. 24-hour cancellation policy."

**Card 2 — Weekly (featured):**
- Tag: "Most popular"
- Plan: "Weekly"
- Desc: "One session per week. Predictable support all year."
- Price: `$460` (--sage) / month
- Rate: "$115 per session · save $40/mo vs. drop-in"
- Features: 4 × 60-min/mo · same time slot weekly · pause/cancel anytime · cohort-aligned curriculum
- CTA: "Start weekly — $460/mo →" (white bg, forest text) → `/api/stripe/subscription-checkout?plan=weekly`
- Fine: "Monthly recurring. Sessions don't roll over. 24h cancel."

**Card 3 — Twice-Weekly (default):**
- Tag: "For acute support"
- Plan: "Twice-Weekly"
- Desc: "Two sessions per week. For regression sprints + CSE prep."
- Price: `$880` / month
- Rate: "$110 per session · save $120/mo vs. drop-in"
- Features: 8 × 60-min/mo · priority slot · pause/cancel · optional CSE-prep block
- CTA: "Start twice-weekly →" → `/api/stripe/subscription-checkout?plan=twice-weekly`
- Fine: "Monthly recurring. Sessions don't roll over. 24h cancel."

### A11y
- Each card is `<article aria-labelledby="...">`
- CTA `aria-label` includes price ("Start weekly subscription, $460 per month")
- Featured: visually-hidden "Most popular plan" before heading
- Color never sole signal — featured has the pill text + bg differentiation

---

## 3. `IEPReviewBanner` — Add-on (after pricing)

```
Section bg --sage-pale · padding 4rem 5rem
Card-within-section: white bg, 20px radius, padding 32px, max-width 1080px

LEFT (60%):
  Eyebrow:     "ADD-ON · ANYONE CAN BOOK"
  H3:          "IEP Review session"
  Body:        "75 minutes with the founder to review your child's IEP,
                identify gaps, and prepare you for the next CSE meeting.
                Includes a written summary you can share with the school."
  Inline row:  ✓ 75-minute review  ✓ Written summary  ✓ CSE-ready notes

RIGHT (40%):
  Price:       $250 (Playfair 700, 1.8rem, --forest)
  Microcopy:   "One-time · No subscription required"
  CTA pill:    "Book IEP review →" → /api/stripe/checkout?product=iep-review
```

Mobile: stacks 1-column, CTA full-width.

---

## 4. How It Works (3 steps)

```
01 / Subscribe or book a session
     "Pick weekly, twice-weekly, or single. Pay via Stripe."

02 / Pick your slot
     "Subscribers see a calendar in your portal. Drop-ins
      get a booking link by email."

03 / Meet & continue
     "Zoom or in-person. Sessions reset monthly. Cancel anytime."
```

---

## 5. FAQ — 6 tutoring-specific questions

Reuses `FAQ` atom from cohort page. Implementation agent fills final answers; questions are:

1. Do you tutor in person or only via Zoom?
2. What happens if my child can't make a session?
3. Can sessions roll over to next month?
4. How is this different from your summer cohort?
5. Do you handle CSE meeting prep?
6. What if I need to pause my subscription?

---

## 6. Booking Gate UX (`/book?type=tutoring`)

Existing `/book` handles discovery-call booking. Extend with `SegmentedControl` at top to switch booking type:

```
[ Discovery call (free) | Tutoring session | Drop-in ]
   ^ existing                ^ subscriber-gated     ^ paid one-time
```

Default: "Discovery call" (preserves current behavior).

### State Matrix for "Tutoring session" segment

| User state | UI |
|---|---|
| **A. Anonymous** | `BookingGate`: "Sign in" CTA + plan comparison link |
| **B. Signed in, no sub** | `BookingGate`: "No active subscription" + 3 plan CTAs + drop-in fallback |
| **C. Signed in, active sub, sessions remaining** | `SessionsCounter` chip + standard slot calendar |
| **D. Signed in, active sub, sessions exhausted** | `SessionsCounter` (0 remaining) + dimmed calendar + drop-in CTA + "Resets {date}" |
| **E. Signed in, sub paused/past_due** | `BookingGate`: "Subscription {status}" + customer portal link |

### `BookingGate` copy

**A. Anonymous**
- Headline: "Sign in to book a tutoring session"
- Body: "Already a subscriber? Sign in to see your booking calendar. New here? See plans starting at $115/session."
- Primary: "Sign in" → `/login?redirect=/book?type=tutoring`
- Secondary: "See plans →" → `/tutoring#pricing`

**B. No subscription**
- Headline: "No active tutoring subscription"
- Body: "You'll need an active subscription, or you can book a single session for $125."
- Primary: "See subscription plans →" → `/tutoring#pricing`
- Secondary: "Book a single session" → drop-in checkout

**E. Paused / past_due**
- Headline: "Your subscription is {status}"
- Body: "Manage your subscription in the customer portal to resume booking."
- Primary: "Open customer portal →"
- Secondary: "Or book a single session"

### `SessionsCounter` chip (states C and D)

```
State C (>0 remaining):
  ◉ 3 of 4 sessions remaining · Resets May 31
  forest dot · --forest text · --sage-pale bg · 100px radius

State D (0 remaining):
  ◉ 0 of 4 sessions remaining · Resets May 31 →
  --amber dot · --amber-light bg · --amber text
```

`role="status" aria-live="polite"` so it announces when bookings decrement count.

### Calendar disabled overlay (state D)

```
[Calendar dimmed at 50% opacity]
  ┌────────────────────────────────────┐
  │ All sessions used this cycle        │
  │ Your next 4 sessions unlock May 31. │
  │ Need a session sooner?              │
  │ [Book a single session — $125]      │
  └────────────────────────────────────┘
```

### Policy block (always visible below calendar in C/D)

```
ⓘ  Sessions don't roll over to the next month.
   Cancel a session at least 24 hours before for a credit;
   same-day cancellations forfeit the session.
```

(--text-muted 13px, --border 1px top divider)

---

## 7. `/portal/subscription` — Screen

Mirrors `/portal/profile` and `/portal/bookings` layout (existing portal nav, single-column 720px max-width).

### Anatomy

```
PORTAL NAV (existing — add "Subscription" entry between Bookings and Reports)

CONTENT (max-width 720px, 24px gap between cards):

┌──────────────────────────────────────────────────────┐
│  Card 1 — Plan summary                              │
│  ──                                                  │
│  ACTIVE SUBSCRIPTION (eyebrow)                      │
│  H3:        Weekly · $460/month                     │
│  Status:    Active (--forest-light dot)             │
│  Renews:    June 2, 2026                            │
│  Charge:    $460                                    │
│  CTA:       Manage subscription in customer portal →│
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Card 2 — Sessions tracker                          │
│  ──                                                  │
│  THIS BILLING CYCLE (eyebrow)                       │
│  Big number: 3 / 4   (Playfair 2.4rem, --forest)    │
│  Sub:        sessions remaining                     │
│  Progress bar (sage-pale track, forest fill)        │
│  Detail:     Cycle ends May 31 · Sessions don't roll│
│  CTA:        Book your next session →               │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Card 3 — Recent sessions (last 5)                  │
│  ──                                                  │
│  date · time · status badge (Completed/Upcoming/Missed)│
│  CTA: See all sessions →                            │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│  Card 4 — Policy reminder (--cream-deep bg)         │
│  ──                                                  │
│  Subscription policies                              │
│  • Sessions don't roll over to the next cycle      │
│  • Cancel sessions ≥ 24h before for a credit       │
│  • Same-day cancels forfeit the session            │
│  • Pause or cancel anytime in the customer portal  │
└──────────────────────────────────────────────────────┘
```

### Empty state (no subscription)

Single replacement card: "No active tutoring subscription" + [See plans →] / [Book single session]

### Past-due / Paused states
- Card 1 shows status badge: warm-gray for cancelled, amber for past_due
- past_due also gets a banner above all cards: "⚠ Your most recent payment failed. Update payment to keep your subscription active. [Update payment →]"

### Loading state
Skeleton: 4 stacked white cards with shimmering bars (40px headline + 16px×3 body + 56px CTA), `aria-busy="true"`

### Responsive
- Desktop (>1024): 720px, centered
- Tablet (768–1024): 90% width
- Mobile (<768): full width, padding 16px

---

## 8. Email touchpoints (visual outline only)

Reuses `email-templates.ts` G1 layout (`kind: 'transactional'` for receipts, `kind: 'lifecycle'` for nudges).

| Trigger | Subject | Visual blocks |
|---|---|---|
| `customer.subscription.created` | "Welcome to weekly tutoring" | Hero · plan summary · "Book your first session" CTA · policy block |
| `invoice.paid` (recurring) | "Your monthly receipt — IEP & Thrive" | Receipt detail · sessions remaining · "Book this month" CTA |
| Same-day cancellation forfeit | "Heads up — session forfeited" | Empathetic copy · policy reminder · "Book another for next week" CTA |
| Sub paused | "Subscription paused" | Confirm · "Resume anytime" CTA |
| Sub cancelled | "Subscription cancelled — sessions through {date}" | Confirm · last-session reminder · "Come back anytime" |

---

## 9. Responsive + a11y checklist

- All sections collapse to 1-column at md (768px)
- Pricing cards reorder mobile: Weekly first
- Hero h1 reduces to 2.2rem at <768px
- All CTAs ≥ 44×44px touch target
- All color combos meet 4.5:1 (verified for cream/forest, sage-pale/forest, amber/white)
- SegmentedControl: keyboard-arrow navigable (radiogroup pattern)
- SessionsCounter: `role=status aria-live=polite`
- BookingGate states each have unique `<h3>` for screen reader landmarks
- Skip-to-main-content link
- Reduced-motion: hover translateY removed if `prefers-reduced-motion: reduce`

---

## 10. Implementation handoff — file map

### New files

```
app/tutoring/page.tsx                            — /tutoring marketing page
app/portal/subscription/page.tsx                 — subscriber portal
components/sections/TutoringHero.tsx             — hero block
components/sections/TutoringPricing.tsx          — 3-card grid + IEP banner
components/sections/TutoringFAQ.tsx              — 6 questions, reuses FAQ atom
components/sections/TutoringHowItWorks.tsx       — 3 steps
components/ui/PricingCard.tsx                    — variant: default | featured
components/ui/IEPReviewBanner.tsx                — horizontal add-on banner
components/ui/SegmentedControl.tsx               — radiogroup, arrow-key navigation
components/portal/SessionsCounter.tsx            — chip + role=status
components/portal/BookingGate.tsx                — A/B/E state wrapper
components/portal/SubscriptionStatusCard.tsx     — Card 1 of /portal/subscription
components/portal/SessionsTrackerCard.tsx        — Card 2 of /portal/subscription
```

### Existing files to modify

```
app/book/page.tsx                                — add SegmentedControl + state branches
app/portal/page.tsx                              — surface subscription tile if active
app/portal/layout.tsx (or nav config)            — add "Subscription" entry
components/layout/Nav.tsx                        — add /tutoring link
components/layout/Footer.tsx                     — add /tutoring + Subscription columns
firestore.rules                                  — subscriptions read rule
firestore.indexes.json                           — possibly (uid, status)
```

### Reused (no changes)

```
components/sections/AboutFounder.tsx
components/ui/FAQ.tsx
components/ui/Button.tsx
components/ui/Card.tsx
components/ui/SectionHeader.tsx
```

---

## 11. Coordination contracts (locked before agent dispatch)

**Single source of truth:** `lib/subscription.ts` — committed to main BEFORE agent dispatch so all worktrees branch from the same shape.

Defines:
- `SubscriptionTier` type
- `SubscriptionStatus` type
- `SubscriptionState` interface
- `canBookSession(sub)` helper
- `sessionsRemaining(sub)` helper
- `tierLabel(tier)` and `tierPrice(tier)` helpers
- `TUTORING_PRICING` const (single source of truth for all prices)

All agents import from `@/lib/subscription` rather than inline-defining their own version.

**SessionsCounter is prop-driven** — does its own Firestore read OR receives `{ used, allowed, cycleEnd }` as props. Prefer prop-driven for purity; both `/book` and `/portal/subscription` pages pass the data in.

**BookingGate state shape** matches `SubscriptionState` exactly.

**Stripe price IDs** — env-var-named (e.g. `STRIPE_TUTORING_WEEKLY_PRICE_ID`). Founder fills real values after creating Stripe products.
