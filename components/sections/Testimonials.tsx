import SectionHeader from "../ui/SectionHeader";

const testimonials = [
  {
    initials: "ML",
    name: "Michelle L.",
    detail: "Parent of 3rd grader with dyslexia \u00B7 Merrick, NY",
    quote:
      "After two summers of generic tutoring going nowhere, this program finally gave us a path. My son came back to school in September reading two levels higher. His teacher couldn\u2019t believe the difference.",
  },
  {
    initials: "JR",
    name: "Jennifer R.",
    detail: "Parent of 2nd grader with ADHD & reading IEP \u00B7 Wantagh, NY",
    quote:
      "The weekly progress reports were a game-changer. I walked into our September IEP meeting with six weeks of data showing exactly what my daughter had accomplished. The school team was impressed.",
  },
  {
    initials: "TK",
    name: "Tamara K.",
    detail: "Parent of 4th grader with autism & math IEP \u00B7 Bellmore, NY",
    quote:
      "What makes this different is that she actually read my son\u2019s IEP before day one. She knew his goals, his triggers, and his strengths. He came home every day saying he had fun \u2014 and he learned.",
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
        title="What families are saying."
        subtitle="Real results from real families — students who came in behind and left ready for September."
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
