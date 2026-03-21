import FAQ from '@/components/sections/FAQ'
import Link from 'next/link'

export const metadata = {
  title: 'FAQ | IEP & Thrive',
  description:
    'Common questions about IEP & Thrive summer intensive programs — enrollment, cohort grouping, deposits, location, progress reports, and more.',
}

export default function FAQPage() {
  return (
    <main id="main">
      {/* Intro */}
      <section className="bg-cream py-16 px-4 md:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-4">Frequently Asked Questions</p>
          <h1 className="font-display text-text mb-4">
            We know you have questions.
          </h1>
          <p className="text-warm-gray text-base leading-relaxed max-w-xl mx-auto">
            Here are the most common things parents ask before enrolling. If you
            don&apos;t see your question, book a discovery call and we&apos;ll
            answer anything.
          </p>
        </div>
      </section>

      {/* Accordion */}
      <FAQ />

      {/* CTA */}
      <section className="bg-sage-pale py-12 px-4 text-center">
        <div className="max-w-lg mx-auto">
          <h2 className="font-display text-forest text-xl font-bold mb-3">
            Still have questions?
          </h2>
          <p className="text-warm-gray text-sm mb-6">
            We&apos;re happy to talk through anything that&apos;s on your mind.
            Book a free 20-minute call or send us a message.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/contact"
              className="inline-block bg-forest text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest-mid transition-colors duration-200"
            >
              Contact Us →
            </Link>
            <Link
              href="/enroll"
              className="inline-block border-2 border-forest text-forest font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest hover:text-white transition-colors duration-200"
            >
              Reserve a Spot
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
