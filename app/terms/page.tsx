import Link from 'next/link'

export const metadata = {
  title: 'Terms of Service | IEP & Thrive',
  description:
    'Terms of service for the IEP & Thrive website and SPED summer intensive program.',
  robots: 'noindex',
}

export default function TermsPage() {
  return (
    <main id="main">
      <section className="bg-cream py-16 px-4 md:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Legal</p>
          <h1 className="font-display text-text mb-8">Terms of Service</h1>
          <p className="text-warm-gray text-sm mb-6">
            Last updated: March 20, 2026
          </p>

          <div className="prose-custom space-y-6 text-warm-gray text-[15px] leading-relaxed">
            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                1. Program Services
              </h2>
              <p>
                IEP &amp; Thrive is a SPED summer intensive operated by Cure
                Consulting Group. Our program provides structured academic
                instruction for students with IEPs and learning differences.
                Enrollment is subject to program availability and suitability
                assessment.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                2. Enrollment &amp; Deposits
              </h2>
              <p>
                Submitting an enrollment inquiry does not guarantee a spot in the
                program. A 25% deposit is required to reserve a spot and is
                collected via Stripe. Deposits are non-refundable unless the
                program is cancelled by IEP &amp; Thrive.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                3. Program Schedule &amp; Location
              </h2>
              <p>
                Program schedules, locations, and cohort groupings are
                determined by IEP &amp; Thrive based on enrollment and student
                needs. We reserve the right to adjust schedules or combine
                cohorts if enrollment requires it.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                4. Cancellation &amp; Refunds
              </h2>
              <p>
                Full tuition balance is due before the first day of instruction.
                Cancellations made 14+ days before the program start date are
                eligible for a tuition refund (less the deposit). Cancellations
                within 14 days are non-refundable.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                5. Limitation of Liability
              </h2>
              <p>
                IEP &amp; Thrive provides supplemental academic instruction and
                is not a substitute for school-based special education services.
                We do not provide medical, therapeutic, or diagnostic services.
                Progress is not guaranteed.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                6. Website Use
              </h2>
              <p>
                This website is provided for informational purposes and
                enrollment inquiries. All content is the property of Cure
                Consulting Group. Unauthorized reproduction or distribution is
                prohibited.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                7. Contact
              </h2>
              <p>
                For questions about these terms, contact us at{' '}
                <a
                  href="mailto:hello@iepandthrive.com"
                  className="text-forest-mid hover:underline"
                >
                  hello@iepandthrive.com
                </a>
                .
              </p>
            </div>
          </div>

          <div className="mt-12 pt-8 border-t border-border">
            <Link
              href="/"
              className="text-forest-mid text-sm hover:underline"
            >
              ← Back to Homepage
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
