import Link from 'next/link'

const checkIcon = (
  <svg className="w-4 h-4 text-forest-light flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const checkIconWhite = (
  <svg className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const steps = [
  {
    number: '01',
    title: 'Book a free 20-minute discovery call',
    description:
      'We talk through your child\'s current IEP, their goals, and what hasn\'t been working. No commitment — just a real conversation with someone who understands the system.',
    tag: 'Free · 20 minutes · Zoom or phone',
  },
  {
    number: '02',
    title: 'We review your child\'s IEP',
    description:
      'You share the current IEP. We identify the right cohort placement, confirm the program match, and map your child\'s annual goals to the summer curriculum.',
    tag: 'IEP review included with enrollment',
  },
  {
    number: '03',
    title: 'Reserve your spot with a deposit',
    description:
      'A 25% non-refundable deposit holds your child\'s place in their cohort. Remaining balance due 2 weeks before program start. Secure online payment via Stripe.',
    tag: 'Stripe secure payment · 25% deposit',
  },
  {
    number: '04',
    title: 'Summer — and a stronger September',
    description:
      '6 weeks of structured intervention. Weekly progress updates. A final report that documents growth against IEP goals — and gives you ammunition heading into fall CSE season.',
    tag: 'Program runs July 7 – August 14, 2026',
  },
]

const includedItems = [
  'Pre-program IEP review & goal mapping',
  '96 hours of direct instruction (4 hrs × 4 days × 6 wks)',
  'All curriculum materials & supplies',
  '6 weekly progress reports (PDF, emailed Fridays)',
  'Daily parent debrief at pickup',
  'End-of-program comprehensive report (CSE-ready)',
  'Home practice guide (15 min/night)',
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="bg-cream py-20 px-8 md:px-20">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-14">
          <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-forest-light mb-3 block">
            How It Works
          </span>
          <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-bold tracking-[-0.025em] leading-[1.18] text-text">
            From first call to first day — here&apos;s the path.
          </h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* LEFT — Steps */}
          <div className="space-y-10">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-5">
                {/* Step number */}
                <span className="font-display text-[1.5rem] font-bold text-forest-light leading-none pt-1 flex-shrink-0">
                  {step.number}
                </span>

                <div>
                  <h3 className="font-display text-[1.15rem] font-bold text-text mb-2">
                    {step.title}
                  </h3>
                  <p className="text-[15px] leading-relaxed text-warm-gray mb-3">
                    {step.description}
                  </p>
                  <span className="inline-block text-[12px] font-medium text-forest bg-sage-pale px-3 py-1 rounded-full">
                    {step.tag}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — Stacked Cards */}
          <div className="space-y-6">
            {/* Card 1 — What's included */}
            <div className="bg-cream-deep rounded-[20px] p-8">
              <h3 className="font-display text-[1.25rem] font-bold text-text mb-5">
                What&apos;s included
              </h3>
              <ul className="space-y-3.5">
                {includedItems.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-[15px] leading-snug text-text">
                    {checkIcon}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Card 2 — Discovery Call CTA */}
            <div className="bg-forest rounded-[20px] p-8 text-white">
              <h3 className="font-display text-[1.25rem] font-bold text-white mb-3">
                Questions before enrolling?
              </h3>
              <p className="text-[15px] leading-relaxed text-white/65 mb-6">
                We offer a free 20-minute call to review your child&apos;s IEP and discuss
                program fit. No sales pressure — just an honest conversation.
              </p>
              <Link
                href={process.env.NEXT_PUBLIC_CALENDLY_URL || '#enroll'}
                {...(process.env.NEXT_PUBLIC_CALENDLY_URL
                  ? { target: '_blank', rel: 'noopener noreferrer' }
                  : {})}
                className="inline-block font-body font-semibold text-[15px] bg-white text-forest px-6 py-3.5 rounded-full transition-colors duration-200 hover:bg-sage-pale"
              >
                Book a Free Discovery Call &rarr;
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
