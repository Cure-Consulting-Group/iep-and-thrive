import type { Metadata } from 'next'
import Link from 'next/link'
import TutoringHero from '@/components/sections/TutoringHero'
import TutoringHowItWorks from '@/components/sections/TutoringHowItWorks'
import TutoringFAQ from '@/components/sections/TutoringFAQ'
import AboutFounder from '@/components/sections/AboutFounder'

export const metadata: Metadata = {
  title: 'Year-Round 1-on-1 Tutoring | IEP & Thrive',
  description:
    'Year-round 1-on-1 tutoring with the same NYC SPED interventionist behind our summer intensive. Contact us to discuss fit and availability in Long Island or on Zoom.',
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
      'The same SPED expertise — every week of the year. Contact us to discuss your child and current availability.',
    url: 'https://iepandthrive.com/tutoring',
    siteName: 'IEP & Thrive',
    locale: 'en_US',
    type: 'website',
  },
}

export default function TutoringPage() {
  // Describe the service without advertising an online purchase or scheduling offer.
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
              Let&apos;s talk about what your child needs.
            </h2>
            <p className="text-[16px] leading-[1.7] text-white/70 mb-8">
              Share your child&apos;s goals, learning profile, and preferred format.
              We&apos;ll follow up directly about fit and current availability.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center rounded-full bg-white px-6 py-3 text-forest text-[15px] font-semibold transition-colors duration-200 hover:bg-sage-pale"
            >
              Ask about tutoring →
            </Link>
          </div>
        </section>
      </main>
    </>
  )
}
