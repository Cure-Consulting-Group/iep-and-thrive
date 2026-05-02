import Image from 'next/image'

const includedFeatures = [
  '1-on-1 with founder (no associates)',
  "Aligned to your child's IEP goals",
  'Orton-Gillingham framework',
  'Weekly progress notes',
  'CSE-meeting prep on request',
  'Zoom or in-person Long Island',
]

export default function TutoringHero() {
  return (
    <section
      id="tutoring-hero"
      className="relative bg-cream"
      aria-label="Tutoring program overview"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1fr_48%] min-h-[80vh]">
        {/* LEFT — Copy */}
        <div className="flex flex-col justify-center px-8 py-12 md:pl-20 md:pr-16 md:py-0">
          {/* Eyebrow pill */}
          <div className="animate-fade-up animation-delay-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-sage-pale px-4 py-1.5 text-forest text-[10px] font-semibold uppercase tracking-[0.1em]">
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-forest-light"
                aria-hidden="true"
              />
              1-on-1 Tutoring · Year-round · Long Island + Zoom
            </span>
          </div>

          {/* H1 */}
          <h1 className="mt-6 font-display font-bold animate-fade-up animation-delay-200">
            The same SPED expertise —{' '}
            <em className="text-forest-mid italic">every week</em> of the year.
          </h1>

          {/* Subhead */}
          <p className="mt-5 text-[16px] leading-[1.7] text-warm-gray max-w-[480px] animate-fade-up animation-delay-300">
            1-hour sessions with the credentialed NYC SPED interventionist behind
            our summer intensive. Subscribe monthly for predictable support, or
            try a single session.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up animation-delay-400">
            <a
              href="#pricing"
              className="inline-flex items-center rounded-full bg-forest px-6 py-3 text-white text-[15px] font-semibold transition-colors duration-200 hover:bg-forest-mid"
            >
              See plans →
            </a>
            <a
              href="#pricing-drop-in"
              className="inline-flex items-center rounded-full border-2 border-forest px-6 py-3 text-forest text-[15px] font-semibold transition-colors duration-200 hover:bg-forest hover:text-white"
            >
              Book a single session
            </a>
          </div>
        </div>

        {/* RIGHT — Forest "Included" panel */}
        <div
          className="relative bg-forest flex items-center justify-center px-8 py-12 md:px-10 md:py-16"
          aria-label="What's included in every session"
        >
          {/* Background image (decorative) */}
          <Image
            src="/images/hero-kids-learning.jpg"
            alt=""
            fill
            className="object-cover opacity-15"
            priority
          />
          <div
            className="relative z-10 w-full max-w-md rounded-[20px] p-8"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            <p className="text-sage text-[10px] font-semibold uppercase tracking-[0.1em]">
              Included in every session
            </p>

            <h2 className="mt-4 font-display font-semibold text-white text-[1.4rem] leading-[1.25]">
              Every hour mapped to your child&apos;s IEP — not a workbook.
            </h2>

            <ul className="mt-6 space-y-3">
              {includedFeatures.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-light">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-white"
                      aria-hidden="true"
                    >
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </span>
                  <span className="text-[14px] text-white/85">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Trust strip — 3 stats */}
      <div className="bg-forest text-white border-t border-white/5">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-8 py-10 sm:grid-cols-3 md:px-20 md:py-12">
          <div>
            <p className="font-display text-[2rem] font-bold text-sage leading-none">
              $125
            </p>
            <p className="mt-2 text-[13px] text-white/65">Baseline per session</p>
          </div>
          <div>
            <p className="font-display text-[2rem] font-bold text-sage leading-none">
              1-on-1
            </p>
            <p className="mt-2 text-[13px] text-white/65">
              Solo founder, no associates
            </p>
          </div>
          <div>
            <p className="font-display text-[2rem] font-bold text-sage leading-none">
              NYS Cert
            </p>
            <p className="mt-2 text-[13px] text-white/65">
              SPED Interventionist · 8 yrs NYC DOE
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
