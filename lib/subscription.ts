/**
 * Historical tutoring-subscription contract.
 *
 * New tutoring purchases and client-side scheduling are retired. These types
 * remain so staff can interpret subscription records that Stripe webhooks must
 * continue to process for historical or in-flight customers. The Functions
 * build mirrors the backend-safe subset in functions/src/subscription-types.ts.
 */

import type { Timestamp } from 'firebase/firestore'

// ─── Historical tiers + pricing ────────────────────────────────────────────

export type SubscriptionTier = 'weekly' | 'twice-weekly'

/**
 * Stripe-mirrored subscription status. We only persist a subset of Stripe's
 * possible statuses; map anything unexpected to 'incomplete' on ingest.
 */
export type SubscriptionStatus =
  | 'active'
  | 'past_due'
  | 'paused'
  | 'canceled'
  | 'incomplete'

export const TUTORING_PRICING = {
  weekly: { monthly: 460, perSession: 115, sessionsPerCycle: 4 },
  twiceWeekly: { monthly: 880, perSession: 110, sessionsPerCycle: 8 },
} as const

// ─── Persisted state (Firestore: users/{uid}.subscription) ──────────────────

/**
 * Mirror of the relevant Stripe subscription fields plus the historical
 * session counter. Lives at users/{uid}.subscription. Stripe webhook handlers
 * are the authoritative writers.
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

  sessionsAllowedPerCycle: number
  sessionsUsedThisCycle: number

  /** True if the customer has cancelled but the period hasn't ended. */
  cancelAtPeriodEnd: boolean

  createdAt: Timestamp | string
  updatedAt: Timestamp | string
}

// ─── Staff-facing display helpers ──────────────────────────────────────────

/** Sessions remaining this cycle (clamped to 0). */
export function sessionsRemaining(sub: SubscriptionState | null | undefined): number {
  if (!sub) return 0
  return Math.max(0, sub.sessionsAllowedPerCycle - sub.sessionsUsedThisCycle)
}

/** Human label for a tier. */
export function tierLabel(tier: SubscriptionTier): string {
  return tier === 'weekly' ? 'Weekly' : 'Twice-Weekly'
}
