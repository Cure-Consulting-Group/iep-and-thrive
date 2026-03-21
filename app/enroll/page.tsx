import EnrollmentForm from '@/components/sections/EnrollmentForm'
import Link from 'next/link'

export const metadata = {
  title: 'Enroll | IEP & Thrive',
  description:
    "Reserve your child's spot in the IEP & Thrive SPED summer intensive. Cohorts limited to 6 students. Submit your enrollment inquiry today.",
}

export default function EnrollPage() {
  return (
    <main id="main">
      {/* Intro */}
      <section className="bg-cream py-16 px-4 md:px-20">
        <div className="max-w-3xl mx-auto text-center">
          <p className="eyebrow mb-4">Summer 2026 Enrollment</p>
          <h1 className="font-display text-text mb-4">
            Reserve your child&apos;s spot.
          </h1>
          <p className="text-warm-gray text-base leading-relaxed max-w-xl mx-auto mb-6">
            Fill out the inquiry form below and our team will reach out within
            24 hours to discuss program fit, scheduling, and next steps. A 25%
            deposit is required to hold a spot.
          </p>
          <div className="flex flex-wrap gap-6 justify-center text-sm text-warm-gray">
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sage" />
              Cohorts limited to 6
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sage" />
              6-week intensive
            </span>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sage" />
              IEP-goal aligned
            </span>
          </div>
        </div>
      </section>

      {/* Form */}
      <EnrollmentForm />

      {/* Post-form trust strip */}
      <section className="bg-cream py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h3 className="font-display text-text text-lg font-bold mb-3">
            Not ready to enroll yet?
          </h3>
          <p className="text-warm-gray text-sm mb-5">
            That&apos;s okay. Book a free discovery call and we&apos;ll walk
            through your child&apos;s IEP together — no commitment required.
          </p>
          <Link
            href="/contact"
            className="inline-block border-2 border-forest text-forest font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest hover:text-white transition-colors duration-200"
          >
            Book a Free Discovery Call →
          </Link>
        </div>
      </section>
    </main>
  )
}
