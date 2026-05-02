'use client'

import { useState } from 'react'
import { trackStripeCheckoutClick } from '@/lib/analytics'

const checkIcon = (
  <svg
    className="w-4 h-4 text-forest-light flex-shrink-0 mt-0.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const checkIconWhite = (
  <svg
    className="w-4 h-4 text-sage flex-shrink-0 mt-0.5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2.5}
    aria-hidden="true"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

export interface PricingCardProps {
  /** Visual variant: default (white card) or featured (forest card) */
  variant?: 'default' | 'featured'
  /** Optional tag pill, e.g. "Most popular" or "For acute support" */
  tag?: string
  /** Plan name (h4) */
  title: string
  /** Short 1-2 line description */
  description: string
  /** Headline price label, e.g. "$125", "$460" */
  priceLabel: string
  /** Unit text after price, e.g. "/ session", "/ month" */
  priceUnit: string
  /** Effective rate microcopy, e.g. "$115 per session · save $40/mo vs. drop-in" */
  rateCopy: string
  /** Feature bullets (typically 4) */
  features: string[]
  /** CTA button label */
  ctaLabel: string
  /** Destination URL for the CTA */
  ctaHref: string
  /** Fine-print microcopy below CTA */
  fineCopy: string
  /** Analytics product key, e.g. 'tutoring-drop-in' / 'tutoring-weekly' */
  analyticsKey: string
  /** Aria label for the CTA — should include price ("Start weekly subscription, $460 per month") */
  ctaAriaLabel?: string
}

export default function PricingCard({
  variant = 'default',
  tag,
  title,
  description,
  priceLabel,
  priceUnit,
  rateCopy,
  features,
  ctaLabel,
  ctaHref,
  fineCopy,
  analyticsKey,
  ctaAriaLabel,
}: PricingCardProps) {
  const [loading, setLoading] = useState(false)
  const featured = variant === 'featured'
  const headingId = `pricing-${analyticsKey}`

  const handleClick = () => {
    setLoading(true)
    trackStripeCheckoutClick(analyticsKey)
    // Allow the click to proceed; the anchor target performs the navigation.
    // We don't preventDefault — Stripe checkout endpoints either return JSON
    // (handled by future T-2 wiring) or 302 redirect, both of which work via
    // a top-level navigation. Re-enable in 5s as a safety net.
    setTimeout(() => setLoading(false), 5000)
  }

  return (
    <article
      aria-labelledby={headingId}
      className={`relative flex flex-col rounded-[20px] p-6 md:p-8 transition-all duration-200 motion-safe:hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(27,67,50,0.10)] ${
        featured ? 'bg-forest text-white' : 'bg-white text-text border border-border'
      }`}
    >
      {featured && <span className="sr-only">Most popular plan.</span>}

      {/* Tag */}
      {tag && (
        <span
          className={`inline-block self-start text-[11px] font-semibold tracking-[0.1em] uppercase px-3 py-1 rounded-full mb-4 ${
            featured ? 'bg-white/15 text-sage' : 'bg-sage-pale text-forest'
          }`}
        >
          {tag}
        </span>
      )}

      {/* Title */}
      <h4
        id={headingId}
        className={`font-display text-[1.25rem] font-bold mb-3 ${
          featured ? 'text-white' : 'text-text'
        }`}
      >
        {title}
      </h4>

      {/* Description */}
      <p
        className={`text-[15px] leading-relaxed mb-6 ${
          featured ? 'text-white/70' : 'text-warm-gray'
        }`}
      >
        {description}
      </p>

      {/* Divider */}
      <div className={`border-t mb-6 ${featured ? 'border-white/10' : 'border-border'}`} />

      {/* Price */}
      <div className="mb-2">
        <span
          className={`font-display text-[1.6rem] font-bold ${
            featured ? 'text-sage' : 'text-forest'
          }`}
          data-testid={`pricing-price-${analyticsKey}`}
        >
          {priceLabel}
        </span>
        <span
          className={`text-[13px] ml-2 ${
            featured ? 'text-white/60' : 'text-text-muted'
          }`}
        >
          {priceUnit}
        </span>
      </div>

      {/* Rate copy */}
      <p
        className={`text-[13px] mb-6 ${
          featured ? 'text-white/65' : 'text-text-muted'
        }`}
      >
        {rateCopy}
      </p>

      {/* Features */}
      <ul className="space-y-3 mb-8 flex-1">
        {features.map((f) => (
          <li key={f} className="flex items-start gap-2.5 text-[15px] leading-snug">
            {featured ? checkIconWhite : checkIcon}
            <span className={featured ? 'text-white/85' : 'text-text'}>{f}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a
        href={ctaHref}
        onClick={handleClick}
        aria-label={ctaAriaLabel ?? ctaLabel}
        aria-busy={loading || undefined}
        className={`block text-center font-body font-semibold text-[15px] h-14 leading-[3.5rem] rounded-full transition-colors duration-200 ${
          featured
            ? 'bg-white text-forest hover:bg-sage-pale'
            : 'bg-forest text-white hover:bg-forest-mid'
        } ${loading ? 'opacity-70 cursor-wait' : ''}`}
      >
        {loading ? 'Redirecting…' : ctaLabel}
      </a>

      {/* Fine print */}
      <p
        className={`mt-3 text-[12px] leading-relaxed text-center ${
          featured ? 'text-white/55' : 'text-text-muted'
        }`}
      >
        {fineCopy}
      </p>
    </article>
  )
}
