export default function WhySection() {
  const features = [
    {
      icon: "\uD83D\uDCCB",
      title: "Your child\u2019s actual IEP goals \u2014 not generic content",
      desc: "Before the program starts, we review your child\u2019s IEP and map every session to their annual goals. This is what districts charge $85K salaries for \u2014 now available privately.",
    },
    {
      icon: "\uD83D\uDCD6",
      title: "Evidence-based structured literacy",
      desc: "Orton-Gillingham framework. The same approach that private specialists charge $150\u2013175/hr for \u2014 embedded in every literacy block, every session.",
    },
    {
      icon: "\uD83D\uDCCA",
      title: "Weekly progress reports you can use in September",
      desc: "Every Friday, you receive a 2-page progress summary with specific skill data. At program end, a full report you can hand to your child\u2019s new teacher or bring to a CSE meeting.",
    },
    {
      icon: "\uD83D\uDC65",
      title: "Small groups. Maximum impact.",
      desc: "Never more than 6 students. Grouped intentionally by learning profile, not just grade. Your child isn\u2019t lost in a classroom \u2014 they\u2019re seen, heard, and challenged at the right level.",
    },
  ];

  const credentials = [
    "NYS Certified Special Education Teacher",
    "SPED Interventionist, NYC Department of Education",
    "Orton-Gillingham structured literacy training",
    "IEP development & CSE meeting experience",
    "Executive function & SEL intervention training",
  ];

  return (
    <section id="why" className="bg-cream px-8 py-12 md:px-20 md:py-20">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <p className="eyebrow">Why IEP &amp; Thrive</p>
          <h2 className="mt-3 font-display font-bold">
            Built by someone who knows the system from the inside.
          </h2>
        </div>

        {/* 2-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* LEFT — Features */}
          <div className="space-y-8">
            {features.map((f) => (
              <div key={f.title} className="flex gap-4">
                <span className="text-[1.5rem] leading-none shrink-0 mt-0.5">
                  {f.icon}
                </span>
                <div>
                  <h4 className="font-display font-bold text-[1.25rem] text-text">
                    {f.title}
                  </h4>
                  <p className="mt-1.5 text-[15px] leading-[1.6] text-warm-gray">
                    {f.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT — Stacked Cards */}
          <div className="space-y-5">
            {/* Card 1 — Pull Quote */}
            <div className="rounded-[20px] bg-cream-deep border-l-4 border-forest p-7">
              <p className="font-display italic text-[1.3rem] leading-[1.4] text-text">
                &ldquo;I spent years inside NYC&apos;s special education system
                writing IEPs, attending CSE meetings, and fighting for kids who
                deserved more. This program is what I wish had existed for those
                families.&rdquo;
              </p>
              <p className="mt-4 text-[13px] text-text-muted font-medium">
                — Program Founder, SPED Interventionist, NYC DOE &middot; 8+
                years
              </p>
            </div>

            {/* Card 2 — Credentials */}
            <div className="rounded-[16px] bg-sage-pale p-7">
              <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-forest-light mb-4">
                Credentials &amp; Training
              </p>
              <ul className="space-y-3">
                {credentials.map((c) => (
                  <li key={c} className="flex items-start gap-2.5">
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
                    <span className="text-[15px] text-forest font-medium">
                      {c}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
