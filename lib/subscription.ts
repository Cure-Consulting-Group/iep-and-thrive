/**
 * Tutoring subscription contract — shared across:
 *   - components/portal/SessionsCounter.tsx
 *   - components/portal/BookingGate.tsx
 *   - components/portal/SubscriptionStatusCard.tsx
 *   - components/portal/SessionsTrackerCard.tsx
 *   - app/book/page.tsx (booking gate state)
 *   - app/portal/subscription/page.tsx
 *   - functions/src/subscription-checkout.ts (Stripe Checkout in subscription mode)
 *   - functions/src/stripe-webhook.ts (extends to handle customer.subscription.* + invoice.*)
 *
 * Banked to main BEFORE Epic H agent dispatch so all worktrees branch from
 * the same shape. Don't add app-specific fields here — keep this thin.
 *
 * See docs/tutoring-prd.md and docs/tutoring-design.md.
 */

import type { Timestamp } from 'firebase/firestore'

// ─── Tiers + Pricing (single source of truth) ───────────────────────────────

/** Subscription tiers. Drop-in and IEP review are NOT subscriptions. */
export type SubscriptionTier = 'weekly' | 'twice-weekly'

/**
 * Stripe-mirrored subscription status. We only persist a subset of Stripe's
 * possible statuses; map anything unexpected to 'incomplete' on ingest.
 */
export type SubscriptionStatus =
  | 'active'        // bookable, paid up
  | 'past_due'      // last invoice failed; allow customer-portal payment update
  | 'paused'        // founder-initiated or family-initiated pause
  | 'canceled'      // cancelled but may still be in current period
  | 'incomplete'    // Stripe needs more info; treat as not-active

export const TUTORING_PRICING = {
  // One-time products (existing Stripe checkout in payment mode)
  dropIn: { amount: 125, label: '$125', unit: '/ session' },
  iepReview: { amount: 250, label: '$250', unit: 'one-time' },
  // Recurring products (new Stripe checkout in subscription mode)
  weekly: {
    monthly: 460,
    perSession: 115,
    sessionsPerCycle: 4,
    label: '$460',
    unit: '/ month',
    rateCopy: '$115 per session · save $40/mo vs. drop-in',
    title: 'Weekly',
    description: 'One session per week. Predictable support all year.',
  },
  twiceWeekly: {
    monthly: 880,
    perSession: 110,
    sessionsPerCycle: 8,
    label: '$880',
    unit: '/ month',
    rateCopy: '$110 per session · save $120/mo vs. drop-in',
    title: 'Twice-Weekly',
    description: 'Two sessions per week. For regression sprints + CSE prep.',
  },
} as const

// ─── Persisted state (Firestore: users/{uid}.subscription) ──────────────────

/**
 * Mirror of the relevant Stripe subscription fields plus our own session
 * counter. Lives at users/{uid}.subscription. The Stripe webhook is the
 * authoritative writer; the booking flow is the only client-side decrementer
 * of sessionsUsedThisCycle (via a transaction in app/book/page.tsx).
 *
 * `null` (or absent) means the parent has never had a subscription.
 */
export interface SubscriptionState {
  tier: SubscriptionTier
  status: SubscriptionStatus
  stripeCustomerId: string
  stripeSubscriptionId: string

  /** Start of current billing period (ISO string OR Firestore Timestamp). */
  currentPeriodStart: Timestamp | string
  /** End of current billing period — when sessionsUsedThisCycle resets to 0. */
  currentPeriodEnd: Timestamp | string

  sessionsAllowedPerCycle: number   // 4 (weekly) or 8 (twice-weekly)
  sessionsUsedThisCycle: number     // increments on booking, resets on invoice.paid

  /** True if the customer has cancelled but the period hasn't ended. */
  cancelAtPeriodEnd: boolean

  createdAt: Timestamp | string
  updatedAt: Timestamp | string
}

// ─── Helpers (pure, browser + node safe) ────────────────────────────────────

/** Is the subscription currently bookable? */
export function canBookSession(sub: SubscriptionState | null | undefined): boolean {
  if (!sub) return false
  if (sub.status !== 'active') return false
  return sub.sessionsUsedThisCycle < sub.sessionsAllowedPerCycle
}

/** Sessions remaining this cycle (clamped to 0). */
export function sessionsRemaining(sub: SubscriptionState | null | undefined): number {
  if (!sub) return 0
  return Math.max(0, sub.sessionsAllowedPerCycle - sub.sessionsUsedThisCycle)
}

/** Human label for a tier. */
export function tierLabel(tier: SubscriptionTier): string {
  return tier === 'weekly' ? 'Weekly' : 'Twice-Weekly'
}

/** Pricing detail for a tier. */
export function tierPrice(tier: SubscriptionTier): {
  monthly: number
  perSession: number
  sessionsPerCycle: number
} {
  return tier === 'weekly'
    ? {
        monthly: TUTORING_PRICING.weekly.monthly,
        perSession: TUTORING_PRICING.weekly.perSession,
        sessionsPerCycle: TUTORING_PRICING.weekly.sessionsPerCycle,
      }
    : {
        monthly: TUTORING_PRICING.twiceWeekly.monthly,
        perSession: TUTORING_PRICING.twiceWeekly.perSession,
        sessionsPerCycle: TUTORING_PRICING.twiceWeekly.sessionsPerCycle,
      }
}

/** Map a tier to its Stripe price-ID env var name. Founder fills real values. */
export function stripePriceIdEnvVar(tier: SubscriptionTier): string {
  return tier === 'weekly'
    ? 'STRIPE_TUTORING_WEEKLY_PRICE_ID'
    : 'STRIPE_TUTORING_TWICE_WEEKLY_PRICE_ID'
}

// ─── Booking-gate state machine (UI consumers) ──────────────────────────────

/**
 * Discriminated state used by app/book/page.tsx and components/portal/BookingGate.tsx.
 * Implementation agents derive this from { authUser, subscription } in a
 * single helper to keep render branches tidy.
 */
export type BookingGateState =
  | { kind: 'anonymous' }
  | { kind: 'no-subscription' }
  | { kind: 'active-bookable'; sub: SubscriptionState; remaining: number }
  | { kind: 'active-exhausted'; sub: SubscriptionState; cycleEnd: Timestamp | string }
  | { kind: 'paused'; sub: SubscriptionState }
  | { kind: 'past-due'; sub: SubscriptionState }
  | { kind: 'canceled'; sub: SubscriptionState }

export function bookingGateState(args: {
  authUid: string | null | undefined
  subscription: SubscriptionState | null | undefined
}): BookingGateState {
  if (!args.authUid) return { kind: 'anonymous' }
  const sub = args.subscription
  if (!sub) return { kind: 'no-subscription' }
  if (sub.status === 'paused') return { kind: 'paused', sub }
  if (sub.status === 'past_due') return { kind: 'past-due', sub }
  if (sub.status === 'canceled') return { kind: 'canceled', sub }
  // active or incomplete -> treat incomplete as no-subscription
  if (sub.status !== 'active') return { kind: 'no-subscription' }
  const remaining = sessionsRemaining(sub)
  if (remaining <= 0) {
    return { kind: 'active-exhausted', sub, cycleEnd: sub.currentPeriodEnd }
  }
  return { kind: 'active-bookable', sub, remaining }
}
