import Link from 'next/link'

export const metadata = {
  title: 'Privacy Policy | IEP & Thrive',
  description:
    'Privacy policy for the IEP & Thrive website — how we collect, use, and protect your personal information.',
  robots: 'noindex',
}

export default function PrivacyPage() {
  return (
    <main id="main">
      <section className="bg-cream py-16 px-4 md:px-20">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-4">Legal</p>
          <h1 className="font-display text-text mb-8">Privacy Policy</h1>
          <p className="text-warm-gray text-sm mb-6">
            Last updated: March 20, 2026
          </p>

          <div className="prose-custom space-y-6 text-warm-gray text-[15px] leading-relaxed">
            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                1. Information We Collect
              </h2>
              <p>
                When you use our enrollment form or contact form, we collect the
                information you provide: name, email, phone number, child&apos;s
                grade, program interest, and any additional notes. We also
                collect standard web analytics data (page views, device type)
                through Vercel Analytics.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                2. How We Use Your Information
              </h2>
              <p>
                We use your information solely to respond to enrollment
                inquiries, communicate about program availability, and process
                deposits via Stripe. We do not sell, rent, or share your
                personal information with third parties for marketing purposes.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                3. Third-Party Services
              </h2>
              <p>
                We use the following third-party services to operate our
                website:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1">
                <li>
                  <strong>Stripe</strong> — for secure payment processing
                </li>
                <li>
                  <strong>Resend</strong> — for transactional email delivery
                </li>
                <li>
                  <strong>Calendly</strong> — for scheduling discovery calls
                </li>
                <li>
                  <strong>Vercel</strong> — for website hosting and analytics
                </li>
              </ul>
              <p className="mt-2">
                Each service has its own privacy policy governing how they
                handle your data.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                4. Data Security
              </h2>
              <p>
                We implement industry-standard security measures to protect your
                personal information, including encrypted HTTPS connections and
                secure API handling. Payment information is processed directly
                by Stripe and is never stored on our servers.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                5. Children&apos;s Privacy
              </h2>
              <p>
                Our website is designed for parents and guardians of children
                with IEPs. We do not knowingly collect personal information
                directly from children under 13. All information submitted
                through our forms is provided by parents or guardians.
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                6. Your Rights
              </h2>
              <p>
                You may request access to, correction of, or deletion of your
                personal information at any time by emailing us at{' '}
                <a
                  href="mailto:hello@iepandthrive.com"
                  className="text-forest-mid hover:underline"
                >
                  hello@iepandthrive.com
                </a>
                .
              </p>
            </div>

            <div>
              <h2 className="font-display text-text text-lg font-bold mb-2">
                7. Contact
              </h2>
              <p>
                If you have questions about this privacy policy, please contact
                us at{' '}
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
