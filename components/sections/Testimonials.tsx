import SectionHeader from "../ui/SectionHeader";

const testimonials = [
  {
    initials: "ML",
    name: "Michelle L.",
    detail: "Parent of 3rd grader with dyslexia \u00B7 Merrick, NY",
    quote:
      "Two summers of generic tutoring taught us what doesn\u2019t work. This program taught our son to read. He came back in September two levels higher, and his teacher asked us what changed. Everything.",
  },
  {
    initials: "JR",
    name: "Jennifer R.",
    detail: "Parent of 2nd grader with ADHD & reading IEP \u00B7 Wantagh, NY",
    quote:
      "For the first time, I walked into a CSE meeting with six weeks of documented progress. Not my opinion \u2014 data. The team listened differently. That alone was worth every dollar.",
  },
  {
    initials: "TK",
    name: "Tamara K.",
    detail: "Parent of 4th grader with autism & math IEP \u00B7 Bellmore, NY",
    quote:
      "She knew his IEP goals before he walked in the door. She knew his triggers. She knew what worked. My son came home every day and said he had fun \u2014 and I could see he was actually learning. That combination doesn\u2019t exist anywhere else.",
  },
];

function Stars() {
  return (
    <div className="flex gap-0.5" aria-label="5 out of 5 stars">
      {[...Array(5)].map((_, i) => (
        <span key={i} className="text-[18px]" style={{ color: "#FFD700" }}>
          &#9733;
        </span>
      ))}
    </div>
  );
}

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-forest px-8 py-12 md:px-[5rem] md:py-[5rem]">
      <SectionHeader
        eyebrow="Parent Stories"
        title="The parents who said yes — and what happened next."
        subtitle="These families took a chance on a different kind of summer. Here\u2019s what they walked away with."
        align="center"
        eyebrowClassName="text-sage"
        titleClassName="text-white"
        subtitleClassName="!text-white/65"
      />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3">
        {testimonials.map((t) => (
          <article
            key={t.initials}
            className="flex flex-col rounded-[20px] p-7"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.06)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
            }}
          >
            <Stars />

            <blockquote className="mt-5 flex-1 font-display text-[1.15rem] italic leading-[1.5] text-white/90">
              &ldquo;{t.quote}&rdquo;
            </blockquote>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-forest-light text-[12px] font-bold text-white">
                {t.initials}
              </div>
              <div>
                <p className="text-[14px] font-semibold text-white">{t.name}</p>
                <p className="text-[12px] text-white/50">{t.detail}</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
