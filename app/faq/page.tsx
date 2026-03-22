import FAQ from '@/components/sections/FAQ'
import Link from 'next/link'

export const metadata = {
  title: 'FAQ | IEP & Thrive',
  description:
    'Common questions about IEP & Thrive summer intensive programs — enrollment, cohort grouping, deposits, location, progress reports, and more.',
}

const faqJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Does my child need to have an IEP to enroll?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Students with active IEPs, 504 Plans, or documented learning differences are all welcome. We\'ll discuss the right fit on your discovery call.',
      },
    },
    {
      '@type': 'Question',
      name: 'How are cohorts grouped?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We group by learning profile and primary intervention need — not just grade level. A 3rd and 4th grader with similar reading goals will have a better experience together than two 3rd graders with very different needs.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the deposit and refund policy?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A 25% non-refundable deposit holds your spot. The remaining balance is due 2 weeks before program start. If we cancel a session due to an emergency, we credit or reschedule.',
      },
    },
    {
      '@type': 'Question',
      name: 'Where is the program located?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We operate out of a dedicated community space on Long Island (Nassau/Suffolk). Exact location provided upon enrollment. We are not a home-based program.',
      },
    },
    {
      '@type': 'Question',
      name: 'Will the progress reports help at my child\'s IEP meeting?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes — that\'s by design. Weekly reports track goal attainment using the same language and format districts use. The final report gives you documented summer progress data that schools must consider.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I use FSA or HSA funds?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Educational therapy for a diagnosed learning disability may qualify as a medical expense. We recommend confirming with your benefits administrator. We provide itemized receipts for all payments.',
      },
    },
    {
      '@type': 'Question',
      name: 'What if my child needs 1:1 support?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Our group program is designed for students who can work in small groups (2–6 peers). If your child requires 1:1 instruction, we offer a limited number of individual sessions — ask about availability on your discovery call.',
      },
    },
    {
      '@type': 'Question',
      name: 'When does Summer 2026 enrollment close?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Early enrollment closes April 30, 2026. Cohorts typically fill by May. We recommend reserving early — once a cohort reaches 6 students, it is closed and families go to a waitlist.',
      },
    },
  ],
}

export default function FAQPage() {
  return (
    <main id="main">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
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
