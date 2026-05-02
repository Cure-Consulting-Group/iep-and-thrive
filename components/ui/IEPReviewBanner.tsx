'use client'

import { useState } from 'react'
import { TUTORING_PRICING } from '@/lib/subscription'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'
import { trackStripeCheckoutClick } from '@/lib/analytics'

const checkIcon = (
  <svg
    className="w-4 h-4 text-forest-light flex-shrink-0"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

export default function IEPReviewBanner() {
  const [loading, setLoading] = useState(false)
  const ctaHref = `${CLOUD_FUNCTIONS.tutoringIepReview}?product=iep-review`

  const handleClick = () => {
    setLoading(true)
    trackStripeCheckoutClick('tutoring-iep-review')
    setTimeout(() => setLoading(false), 5000)
  }

  const inlineRow = ['75-minute review', 'Written summary', 'CSE-ready notes']

  return (
    <section
      id="iep-review"
      aria-labelledby="iep-review-heading"
      className="bg-sage-pale px-6 py-12 md:px-20 md:py-16"
    >
      <div className="mx-auto flex max-w-[1080px] flex-col items-stretch gap-8 rounded-[20px] bg-white p-6 md:flex-row md:items-center md:p-8">
        {/* Left — content */}
        <div className="flex-1">
          <p className="eyebrow mb-3">Add-on · Anyone can book</p>
          <h3
            id="iep-review-heading"
            className="font-display text-[1.5rem] font-bold leading-tight text-text mb-3"
          >
            IEP Review session
          </h3>
          <p className="text-[15px] leading-[1.7] text-warm-gray mb-4">
            75 minutes with the founder to review your child&apos;s IEP, identify
            gaps, and prepare you for the next CSE meeting. Includes a written
            summary you can share with the school.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-[14px] text-text">
            {inlineRow.map((item) => (
              <li key={item} className="flex items-center gap-2">
                {checkIcon}
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Right — price + CTA */}
        <div className="flex-shrink-0 md:w-[260px] flex flex-col items-start md:items-end gap-3 md:text-right">
          <div>
            <span
              className="font-display text-[1.8rem] font-bold text-forest"
              data-testid="pricing-price-iep-review"
            >
              {TUTORING_PRICING.iepReview.label}
            </span>
            <p className="text-[13px] text-text-muted mt-1">
              One-time · No subscription required
            </p>
          </div>
          <a
            href={ctaHref}
            onClick={handleClick}
            aria-label={`Book IEP review, ${TUTORING_PRICING.iepReview.label} one-time`}
            aria-busy={loading || undefined}
            className={`inline-flex items-center justify-center w-full md:w-auto rounded-full bg-forest px-6 py-3.5 text-[15px] font-semibold text-white transition-colors duration-200 hover:bg-forest-mid ${
              loading ? 'opacity-70 cursor-wait' : ''
            }`}
          >
            {loading ? 'Redirecting…' : 'Book IEP review →'}
          </a>
        </div>
      </div>
    </section>
  )
}
