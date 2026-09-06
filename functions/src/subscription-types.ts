/**
 * Functions-local copy of the subscription contract.
 *
 * The canonical contract lives at `lib/subscription.ts` (repo root, used by
 * all client / Next.js code). Functions can't import from there directly:
 * tsc treats the parent-relative import as a sibling source root and emits
 * `functions/lib/lib/subscription.js` while shifting all other functions
 * output into `functions/lib/functions/src/...` — which breaks
 * `firebase deploy` (it expects `functions/lib/index.js` per package.json).
 *
 * This file mirrors the subset of `lib/subscription.ts` that functions code
 * actually needs (types and tier helpers). Keep
 * in sync manually if either file changes. This backend copy is retained so
 * historical and in-flight Stripe subscription events remain processable.
 */

export type SubscriptionTier = "weekly" | "twice-weekly"

export type SubscriptionStatus =
  | "active"
  | "past_due"
  | "paused"
  | "canceled"
  | "incomplete"

export interface SubscriptionState {
  tier: SubscriptionTier
  status: SubscriptionStatus
  stripeCustomerId: string
  stripeSubscriptionId: string
  currentPeriodStart: FirebaseFirestore.Timestamp | string
  currentPeriodEnd: FirebaseFirestore.Timestamp | string
  sessionsAllowedPerCycle: number
  sessionsUsedThisCycle: number
  cancelAtPeriodEnd: boolean
  createdAt: FirebaseFirestore.Timestamp | string
  updatedAt: FirebaseFirestore.Timestamp | string
}

export const TUTORING_PRICING = {
  weekly: { monthly: 460, perSession: 115, sessionsPerCycle: 4 },
  twiceWeekly: { monthly: 880, perSession: 110, sessionsPerCycle: 8 },
} as const

export function tierLabel(tier: SubscriptionTier): string {
  return tier === "weekly" ? "Weekly" : "Twice-Weekly"
}

export function tierPrice(tier: SubscriptionTier): {
  monthly: number
  perSession: number
  sessionsPerCycle: number
} {
  return tier === "weekly"
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
