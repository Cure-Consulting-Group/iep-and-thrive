export default function Hero() {
  const avatars = [
    { initials: "ML" },
    { initials: "JR" },
    { initials: "TK" },
    { initials: "AB" },
  ];

  const stats = [
    { value: "4\u20136", label: "Students per cohort" },
    { value: "4hrs", label: "Daily structured instruction" },
    { value: "6wk", label: "Program duration" },
    { value: "100%", label: "IEP-goal aligned" },
  ];

  const features = [
    "Structured literacy & Orton-Gillingham framework",
    "Weekly progress reports aligned to IEP goals",
    "Parent debrief at every Friday pickup",
    "Final report you can bring to September CSE meeting",
  ];

  return (
    <section id="hero" className="relative min-h-[88vh] bg-cream">
      <div className="grid grid-cols-1 md:grid-cols-[1fr_48%] min-h-[88vh]">
        {/* Left Column — Copy */}
        <div className="flex flex-col justify-center px-8 py-12 md:pl-20 md:pr-16 md:py-0">
          {/* Eyebrow Pill */}
          <div className="animate-fade-up animation-delay-100">
            <span className="inline-flex items-center gap-2 rounded-full bg-sage-pale px-4 py-1.5 text-forest text-[13px] font-medium">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-forest-light" />
              SPED Summer Intensive &middot; Long Island, NY
            </span>
          </div>

          {/* H1 */}
          <h1 className="mt-6 font-display font-bold animate-fade-up animation-delay-200">
            Your child deserves a summer that{" "}
            <em className="text-forest-mid italic">builds</em> — not breaks.
          </h1>

          {/* Subhead */}
          <p className="mt-5 text-[16px] leading-[1.7] text-warm-gray max-w-[460px] animate-fade-up animation-delay-300">
            An evidence-based small-group intensive for students with IEPs and
            learning differences. Led by a credentialed NYC SPED interventionist
            who has spent years inside the system — and knows exactly what your
            child needs.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap items-center gap-3 animate-fade-up animation-delay-400">
            <a
              href="#enroll"
              className="inline-flex items-center rounded-full bg-forest px-6 py-3 text-white text-[15px] font-semibold transition-colors duration-200 hover:bg-forest-mid"
            >
              Reserve a Spot for Summer 2026
            </a>
            <a
              href="#program"
              className="inline-flex items-center rounded-full border-2 border-forest px-6 py-3 text-forest text-[15px] font-semibold transition-colors duration-200 hover:bg-forest hover:text-white"
            >
              Learn About the Program
            </a>
          </div>

          {/* Trust Row */}
          <div className="mt-8 pt-6 border-t border-border animate-fade-up animation-delay-500">
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                {avatars.map((a) => (
                  <div
                    key={a.initials}
                    className="flex h-8 w-8 items-center justify-center rounded-full bg-sage text-forest text-[11px] font-bold ring-2 ring-cream"
                  >
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-[13px] text-warm-gray">
                Cohorts limited to 6 students. Early enrollment closes April 30.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column — Forest Panel */}
        <div className="bg-forest flex items-center justify-center px-8 py-12 md:px-10 md:py-16">
          <div
            className="w-full max-w-md rounded-[20px] p-8"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
            }}
          >
            {/* Label */}
            <p className="text-sage text-[10px] font-semibold uppercase tracking-[0.1em]">
              Summer 2026 &middot; 6-Week Intensive
            </p>

            {/* H3 */}
            <h3 className="mt-4 font-display font-semibold text-white text-[1.5rem] leading-[1.25]">
              Everything your child&apos;s IEP calls for. Finally, a summer
              program that delivers it.
            </h3>

            {/* 2x2 Stat Grid */}
            <div className="mt-6 grid grid-cols-2 gap-4">
              {stats.map((s) => (
                <div key={s.label}>
                  <p className="font-display text-[1.5rem] font-bold text-sage">
                    {s.value}
                  </p>
                  <p className="text-[12px] text-white/60">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Feature List */}
            <ul className="mt-6 space-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-forest-light">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 12 12"
                      fill="none"
                      className="text-white"
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
                  <span className="text-[14px] text-white/80">{f}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
