import type { Metadata } from 'next'
import Link from 'next/link'
import TutoringHero from '@/components/sections/TutoringHero'
import TutoringPricing from '@/components/sections/TutoringPricing'
import TutoringHowItWorks from '@/components/sections/TutoringHowItWorks'
import TutoringFAQ from '@/components/sections/TutoringFAQ'
import AboutFounder from '@/components/sections/AboutFounder'
import { TUTORING_PRICING } from '@/lib/subscription'

export const metadata: Metadata = {
  title: 'Year-Round 1-on-1 Tutoring | IEP & Thrive',
  description:
    'Year-round 1-on-1 tutoring with the same NYC SPED interventionist behind our summer intensive. Drop-in $125, Weekly $460/mo, Twice-Weekly $880/mo. Long Island + Zoom.',
  keywords: [
    'SPED tutor Long Island',
    'IEP tutoring NYC',
    'dyslexia tutor Nassau County',
    'Orton-Gillingham tutor Long Island',
    'CSE prep tutoring',
  ],
  openGraph: {
    title: 'Year-Round 1-on-1 Tutoring · IEP & Thrive',
    description:
      'The same SPED expertise — every week of the year. Subscribe monthly or try a single session.',
    url: 'https://iepandthrive.com/tutoring',
    siteName: 'IEP & Thrive',
    locale: 'en_US',
    type: 'website',
  },
}

export default function TutoringPage() {
  // Schema.org Service JSON-LD with offer catalog reflecting the 4 pricing tiers.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'IEP & Thrive — 1-on-1 Tutoring',
    serviceType: 'Educational tutoring',
    description:
      'Year-round 1-on-1 tutoring with a NYS-certified SPED interventionist. IEP-aligned, Orton-Gillingham framework, Zoom or in-person Long Island.',
    provider: {
      '@type': 'EducationalOrganization',
      name: 'IEP & Thrive',
      url: 'https://iepandthrive.com',
    },
    areaServed: {
      '@type': 'Place',
      name: 'Long Island, NY',
    },
    offers: [
      {
        '@type': 'Offer',
        name: 'Drop-in single session',
        price: TUTORING_PRICING.dropIn.amount,
        priceCurrency: 'USD',
      },
      {
        '@type': 'Offer',
        name: 'Weekly subscription',
        price: TUTORING_PRICING.weekly.monthly,
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          billingDuration: 'P1M',
          price: TUTORING_PRICING.weekly.monthly,
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'Offer',
        name: 'Twice-weekly subscription',
        price: TUTORING_PRICING.twiceWeekly.monthly,
        priceCurrency: 'USD',
        priceSpecification: {
          '@type': 'UnitPriceSpecification',
          billingDuration: 'P1M',
          price: TUTORING_PRICING.twiceWeekly.monthly,
          priceCurrency: 'USD',
        },
      },
      {
        '@type': 'Offer',
        name: 'IEP Review session',
        price: TUTORING_PRICING.iepReview.amount,
        priceCurrency: 'USD',
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main id="main">
        <TutoringHero />
        <TutoringHowItWorks />
        <TutoringPricing />
        <AboutFounder />
        <TutoringFAQ />

        {/* Bottom CTA */}
        <section
          aria-labelledby="tutoring-bottom-cta-heading"
          className="bg-forest text-white px-8 py-16 md:px-20 md:py-20"
        >
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sage text-[11px] font-semibold uppercase tracking-[0.1em] mb-4">
              Ready to start?
            </p>
            <h2
              id="tutoring-bottom-cta-heading"
              className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-bold text-white mb-4"
            >
              Pick a plan or try a single session.
            </h2>
            <p className="text-[16px] leading-[1.7] text-white/70 mb-8">
              Cancel or pause anytime. No setup fees, no contracts. The same
              practitioner who delivers the summer intensive — every week of the
              year.
            </p>
            <div className="flex flex-wrap justify-center items-center gap-3">
              <a
                href="#pricing"
                className="inline-flex items-center rounded-full bg-white px-6 py-3 text-forest text-[15px] font-semibold transition-colors duration-200 hover:bg-sage-pale"
              >
                See plans →
              </a>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border-2 border-white/40 px-6 py-3 text-white text-[15px] font-semibold transition-colors duration-200 hover:bg-white hover:text-forest"
              >
                Talk to the founder first
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
