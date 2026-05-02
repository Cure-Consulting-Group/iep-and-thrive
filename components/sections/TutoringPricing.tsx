import PricingCard from '@/components/ui/PricingCard'
import IEPReviewBanner from '@/components/ui/IEPReviewBanner'
import SectionHeader from '@/components/ui/SectionHeader'
import { TUTORING_PRICING } from '@/lib/subscription'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'

export default function TutoringPricing() {
  // Source-of-truth pricing pulled from lib/subscription.ts.
  const dropIn = TUTORING_PRICING.dropIn
  const weekly = TUTORING_PRICING.weekly
  const twiceWeekly = TUTORING_PRICING.twiceWeekly

  return (
    <>
      <section
        id="pricing"
        className="bg-cream px-8 py-16 md:px-20 md:py-24"
        aria-labelledby="pricing-heading"
      >
        <div className="mx-auto max-w-6xl">
          <SectionHeader
            eyebrow="Plans"
            title="Three ways to work together — pick the one that fits."
            subtitle="Subscribe for predictable monthly support, or try a single session to meet the practitioner first. No long-term contract — cancel or pause anytime."
            align="center"
            titleClassName="text-[clamp(1.8rem,3vw,2.6rem)] font-bold tracking-[-0.025em] leading-[1.18] text-text"
          />

          {/* 3-card pricing grid. On mobile we reorder to put Weekly (featured) first. */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {/* Drop-in — order-2 on mobile so Weekly leads */}
            <div id="pricing-drop-in" className="order-2 md:order-1">
              <PricingCard
                variant="default"
                title="Single session"
                description="Try the practitioner. No subscription, no commitment."
                priceLabel={dropIn.label}
                priceUnit="60-min session"
                rateCopy="Pay per session · book within 30 days"
                features={[
                  '1-on-1 with founder',
                  '60-minute session',
                  'IEP-aligned',
                  'Zoom or LI in-person',
                ]}
                ctaLabel="Book a single session →"
                ctaAriaLabel={`Book a single session, ${dropIn.label}`}
                ctaHref={`${CLOUD_FUNCTIONS.tutoringDropIn}?product=drop-in`}
                fineCopy="One-time charge. 24-hour cancellation policy."
                analyticsKey="tutoring-drop-in"
              />
            </div>

            {/* Weekly (featured) — order-1 on mobile, middle on desktop */}
            <div id="pricing-weekly" className="order-1 md:order-2">
              <PricingCard
                variant="featured"
                tag="Most popular"
                title={weekly.title}
                description={weekly.description}
                priceLabel={weekly.label}
                priceUnit={weekly.unit}
                rateCopy={weekly.rateCopy}
                features={[
                  `${weekly.sessionsPerCycle} × 60-min/mo`,
                  'Same time slot weekly',
                  'Pause/cancel anytime',
                  'Cohort-aligned curriculum',
                ]}
                ctaLabel={`Start weekly — ${weekly.label}/mo →`}
                ctaAriaLabel={`Start weekly subscription, ${weekly.label} per month`}
                ctaHref={`${CLOUD_FUNCTIONS.tutoringSubscription}?plan=weekly`}
                fineCopy="Monthly recurring. Sessions don't roll over. 24h cancel."
                analyticsKey="tutoring-weekly"
              />
            </div>

            {/* Twice-Weekly */}
            <div id="pricing-twice-weekly" className="order-3">
              <PricingCard
                variant="default"
                tag="For acute support"
                title={twiceWeekly.title}
                description={twiceWeekly.description}
                priceLabel={twiceWeekly.label}
                priceUnit={twiceWeekly.unit}
                rateCopy={twiceWeekly.rateCopy}
                features={[
                  `${twiceWeekly.sessionsPerCycle} × 60-min/mo`,
                  'Priority slot',
                  'Pause/cancel anytime',
                  'Optional CSE-prep block',
                ]}
                ctaLabel="Start twice-weekly →"
                ctaAriaLabel={`Start twice-weekly subscription, ${twiceWeekly.label} per month`}
                ctaHref={`${CLOUD_FUNCTIONS.tutoringSubscription}?plan=twice-weekly`}
                fineCopy="Monthly recurring. Sessions don't roll over. 24h cancel."
                analyticsKey="tutoring-twice-weekly"
              />
            </div>
          </div>
        </div>
      </section>

      {/* IEP Review add-on banner immediately after pricing */}
      <IEPReviewBanner />
    </>
  )
}
