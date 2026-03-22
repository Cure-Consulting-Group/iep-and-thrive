import SectionHeader from "../ui/SectionHeader";

const credentials = [
  { icon: "\uD83C\uDF93", text: "NYS Certified Special Education Teacher" },
  { icon: "\uD83C\uDFEB", text: "SPED Interventionist, NYC DOE (8+ years)" },
  { icon: "\uD83D\uDCD6", text: "Orton-Gillingham Trained Practitioner" },
  { icon: "\uD83D\uDCCB", text: "IEP Development & CSE Advocacy Specialist" },
  { icon: "\uD83E\uDDE0", text: "Executive Function & SEL Intervention" },
];

export default function AboutFounder() {
  return (
    <section id="about" className="bg-cream px-8 py-12 md:px-[5rem] md:py-[5rem]">
      <SectionHeader
        eyebrow="About the Founder"
        title="A SPED interventionist who built this for the families she couldn't stop thinking about."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
        {/* Left — Image Placeholder */}
        <div className="relative">
          <div
            className="w-full rounded-[20px] bg-sage-pale"
            style={{ aspectRatio: "4 / 5" }}
            role="img"
            aria-label="Founder portrait placeholder"
          />
          {/* Floating Badge */}
          <div className="absolute bottom-4 right-4 flex flex-col items-center rounded-[16px] bg-forest px-5 py-4 text-white shadow-lg">
            <span className="font-display text-[1.4rem] font-bold text-sage">
              8+
            </span>
            <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-white/70">
              Years in NYC SPED
            </span>
          </div>
        </div>

        {/* Right — Content */}
        <div className="flex flex-col justify-center">
          <div className="space-y-5 text-[15px] leading-[1.7] text-warm-gray">
            <p>
              After 8+ years as a Special Education Interventionist with the NYC
              Department of Education, I&apos;ve sat at more CSE tables than I can
              count. I&apos;ve written hundreds of IEPs, advocated for students in
              meetings, and watched families walk away not knowing what their
              children were actually entitled to.
            </p>
            <p>
              I built IEP &amp; Thrive because every summer, I watched the progress
              we&apos;d made during the school year disappear by September. The kids
              who needed continuity the most were getting nothing — or worse, generic
              tutoring that didn&apos;t speak their language.
            </p>
            <p>
              This program is what I wish I could have handed every family I worked
              with. Small groups. Real evidence-based methods. Aligned to your
              child&apos;s actual IEP. And a final report you can walk into
              September with.
            </p>
          </div>

          {/* Credential List */}
          <ul className="mt-8 space-y-3">
            {credentials.map((c) => (
              <li
                key={c.text}
                className="flex items-center gap-3 text-[15px] text-text"
              >
                <span className="text-[18px]">{c.icon}</span>
                <span>{c.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
