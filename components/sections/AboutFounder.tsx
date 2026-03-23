import Image from "next/image";
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
        title="She left the system. She didn't leave the families."
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-2">
        {/* Left — Founder Image */}
        <div className="relative">
          <div className="relative w-full rounded-[20px] overflow-hidden bg-sage-pale" style={{ aspectRatio: "4 / 5" }}>
            <Image
              src="/images/founder-teaching.jpg"
              alt="Program founder — SPED interventionist and educator"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
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
              Eight years inside the NYC Department of Education. Hundreds of
              IEPs written. More CSE meetings than I can count. And one thing I
              could never shake: the look on a parent&apos;s face when they
              realized nobody was going to fight for their child the way they
              needed.
            </p>
            <p>
              Every June, I watched the same story repeat. A child who had
              finally started to click — reading with confidence, solving problems
              independently — would come back in September as if the year had
              never happened. The regression was predictable. The lack of summer
              options was inexcusable.
            </p>
            <p>
              So I built the program I wished I could have handed every family
              who sat across from me at that table. Small groups. Evidence-based
              methods. Curriculum mapped to your child&apos;s actual IEP. And a
              final report that makes the school team take notice.
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
