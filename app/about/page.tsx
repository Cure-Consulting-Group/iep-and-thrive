import AboutFounder from '@/components/sections/AboutFounder'
import Link from 'next/link'

export const metadata = {
  title: 'About the Founder | IEP & Thrive',
  description:
    'Meet the credentialed NYC SPED interventionist behind IEP & Thrive. 8+ years with the NYC DOE, Orton-Gillingham trained, and dedicated to closing the summer regression gap.',
}

export default function AboutPage() {
  return (
    <main id="main">
      {/* Hero intro */}
      <section className="bg-cream py-16 px-4 md:px-20">
        <div className="max-w-4xl mx-auto text-center">
          <p className="eyebrow mb-4">About IEP &amp; Thrive</p>
          <h1 className="font-display text-text mb-6">
            Built by a teacher who saw the gap&nbsp;firsthand.
          </h1>
          <p className="text-warm-gray text-base leading-relaxed max-w-2xl mx-auto">
            IEP &amp; Thrive was born from years of watching students with IEPs
            lose hard-won progress every summer — and knowing it didn&apos;t
            have to be that way.
          </p>
        </div>
      </section>

      {/* Founder deep-dive (reuses existing component) */}
      <AboutFounder />

      {/* Philosophy section */}
      <section className="bg-cream py-16 px-4 md:px-20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-display text-text text-xl font-bold mb-4">
              Our Teaching Philosophy
            </h2>
            <p className="text-warm-gray text-base leading-relaxed mb-4">
              Every student learns differently — that&apos;s not a limitation,
              it&apos;s a starting point. Our instruction builds on what&apos;s
              already working in your child&apos;s IEP, not around it.
            </p>
            <p className="text-warm-gray text-base leading-relaxed">
              We use evidence-based frameworks like Orton-Gillingham structured
              literacy and multi-sensory math instruction, delivered in cohorts
              of 4–6 students so every child gets the attention they deserve.
            </p>
          </div>
          <div>
            <h2 className="font-display text-text text-xl font-bold mb-4">
              Why Summer Matters
            </h2>
            <p className="text-warm-gray text-base leading-relaxed mb-4">
              Research shows students with learning differences can lose up to
              40% of their academic year gains during summer break. Extended
              School Year (ESY) services often fall short.
            </p>
            <p className="text-warm-gray text-base leading-relaxed">
              IEP &amp; Thrive fills that gap with a 6-week intensive designed
              around your child&apos;s actual IEP goals — not a generic
              curriculum. Every session is structured, purposeful, and measurable.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-sage-pale py-12 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-forest text-xl font-bold mb-3">
            Ready to learn more?
          </h2>
          <p className="text-warm-gray text-sm mb-6">
            Book a free 20-minute discovery call to discuss your child&apos;s
            IEP and program fit.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-forest text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest-mid transition-colors duration-200"
            >
              Book a Discovery Call →
            </Link>
            <Link
              href="/#program"
              className="inline-block border-2 border-forest text-forest font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest hover:text-white transition-colors duration-200"
            >
              View Programs
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
