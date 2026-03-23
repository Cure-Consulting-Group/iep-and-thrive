import Image from 'next/image'

export default function WhySection() {
  const features = [
    {
      icon: "\uD83D\uDCCB",
      title: "We read the IEP before we meet your child",
      desc: "Every session is mapped to your child\u2019s actual annual goals \u2014 not a pre-packaged curriculum. This is the kind of individualized planning districts pay $85K salaries for. Now it\u2019s yours.",
    },
    {
      icon: "\uD83D\uDCD6",
      title: "The gold standard in structured literacy",
      desc: "Orton-Gillingham isn\u2019t a buzzword here \u2014 it\u2019s the framework. The same evidence-based approach private specialists charge $150\u2013175 an hour for, built into every session.",
    },
    {
      icon: "\uD83D\uDCCA",
      title: "Progress reports that actually mean something",
      desc: "Every Friday, a two-page summary with real skill data lands in your inbox. By August, you\u2019ll have a CSE-ready report that makes the school team sit up and listen.",
    },
    {
      icon: "\uD83D\uDC65",
      title: "Six students. That\u2019s it.",
      desc: "No overflow. No waitlist shuffling. Six children, grouped by learning profile, working with one interventionist who knows every name, every goal, and every breakthrough.",
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
            Built by someone who sat at the CSE table — and saw what families were missing.
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
                &ldquo;I spent years writing IEPs, sitting in CSE meetings,
                and watching families leave confused about what their children
                were entitled to. I built this program for every parent I
                couldn&apos;t follow home.&rdquo;
              </p>
              <p className="mt-4 text-[13px] text-text-muted font-medium">
                — Program Founder, SPED Interventionist, NYC DOE &middot; 8+
                years
              </p>
            </div>

            {/* Image — Kids collaborating */}
            <div className="relative h-44 rounded-[16px] overflow-hidden">
              <Image
                src="/images/kids-collaborating.jpg"
                alt="Students working together on schoolwork"
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
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
