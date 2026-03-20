import Link from 'next/link'

export const metadata = {
  title: 'Thank You | IEP & Thrive',
  description: 'Your enrollment inquiry has been submitted. We\'ll be in touch within 24 hours.',
}

export default function SuccessPage() {
  return (
    <main id="main">
      <section className="bg-cream min-h-[70vh] flex items-center justify-center py-20 px-4">
        <div className="max-w-lg text-center">
          <div className="w-16 h-16 rounded-full bg-sage-pale flex items-center justify-center mx-auto mb-6">
            <svg
              className="w-8 h-8 text-forest"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>

          <h1 className="font-display text-text mb-4">
            Thank you!
          </h1>

          <p className="text-warm-gray text-base leading-relaxed mb-4">
            Your enrollment inquiry has been submitted. We&apos;ll review your
            information and reach out within 24 hours to discuss next steps and
            confirm program fit.
          </p>

          <p className="text-warm-gray text-sm mb-8">
            Check your email for a confirmation. If you don&apos;t see it,
            check your spam folder or contact us at{' '}
            <a
              href="mailto:hello@iepandthrive.com"
              className="text-forest-mid hover:underline"
            >
              hello@iepandthrive.com
            </a>
            .
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="inline-block bg-forest text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest-mid transition-colors duration-200"
            >
              Back to Homepage
            </Link>
            <Link
              href="/faq"
              className="inline-block border-2 border-forest text-forest font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest hover:text-white transition-colors duration-200"
            >
              View FAQ
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
