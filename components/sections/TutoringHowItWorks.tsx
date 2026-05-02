import SectionHeader from '@/components/ui/SectionHeader'

const steps = [
  {
    number: '01',
    title: 'Subscribe or book a session',
    description:
      'Pick weekly, twice-weekly, or a single session. Pay via Stripe — no setup fees, no contract.',
    tag: 'Stripe secure checkout',
  },
  {
    number: '02',
    title: 'Pick your slot',
    description:
      'Subscribers see a calendar in your portal and book sessions inside your monthly allowance. Drop-ins receive a booking link by email after checkout.',
    tag: 'Zoom or Long Island in-person',
  },
  {
    number: '03',
    title: 'Meet & continue',
    description:
      'Show up, learn, get progress notes after each session. Sessions reset monthly. Pause or cancel anytime through Stripe — no friction.',
    tag: 'Cancel or pause anytime',
  },
]

export default function TutoringHowItWorks() {
  return (
    <section
      id="tutoring-how-it-works"
      className="bg-cream px-8 py-16 md:px-20 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <SectionHeader
          eyebrow="How It Works"
          title="From signup to first session — three steps."
        />

        {/* Audience strip — 4 cards */}
        <div className="mb-14 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: '📚',
              title: 'Cohort alumni',
              body: 'Maintain summer gains during the school year.',
            },
            {
              icon: '🤔',
              title: 'Cohort-curious',
              body: 'Try the practitioner before the 6-week commitment.',
            },
            {
              icon: '📅',
              title: 'Calendar conflict',
              body: 'Camp, sports, travel block summer — we tutor year-round.',
            },
            {
              icon: '🎯',
              title: 'Mid-year crisis',
              body: 'Regression, CSE meeting, IEP rewrite — we move fast.',
            },
          ].map((c) => (
            <div
              key={c.title}
              className="rounded-[16px] bg-cream-deep p-6 transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(27,67,50,0.10)]"
            >
              <div className="text-[24px] mb-3" aria-hidden="true">
                {c.icon}
              </div>
              <h3 className="font-display text-[1.05rem] font-bold text-text mb-2">
                {c.title}
              </h3>
              <p className="text-[14px] leading-relaxed text-warm-gray">
                {c.body}
              </p>
            </div>
          ))}
        </div>

        {/* Steps */}
        <ol className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {steps.map((step) => (
            <li key={step.number} className="flex flex-col">
              <span className="font-display text-[1.5rem] font-bold text-forest-light leading-none mb-3">
                {step.number}
              </span>
              <h3 className="font-display text-[1.15rem] font-bold text-text mb-2">
                {step.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-warm-gray mb-3">
                {step.description}
              </p>
              <span className="inline-block self-start text-[12px] font-medium text-forest bg-sage-pale px-3 py-1 rounded-full">
                {step.tag}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
