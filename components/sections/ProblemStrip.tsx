export default function ProblemStrip() {
  const stats = [
    {
      number: "2\u20133\u00D7",
      title: "Faster regression for IEP students",
      desc: "Students with learning differences lose skills over summer at 2\u20133\u00D7 the rate of general education peers. Without structured intervention, September is harder than June.",
    },
    {
      number: "$0",
      title: "Extended school year for most families",
      desc: "Most districts deny ESY services. Parents are left searching for credentialed providers who understand IEPs \u2014 not generic tutors who read from a workbook.",
    },
    {
      number: "1 in 5",
      title: "Students have a learning difference",
      desc: "Yet credentialed SPED interventionists offering private summer programming on Long Island are critically undersupplied. We\u2019re here to close that gap.",
    },
  ];

  return (
    <section id="problem" className="bg-forest text-white px-8 py-12 md:px-20 md:py-[3rem]">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-12 max-w-7xl mx-auto">
        {stats.map((s) => (
          <div key={s.title}>
            <p className="font-display text-[3rem] font-bold text-sage leading-none">
              {s.number}
            </p>
            <h3 className="mt-3 font-display text-[1.5rem] font-semibold text-white">
              {s.title}
            </h3>
            <p className="mt-2 text-[15px] leading-[1.6] text-white/65">
              {s.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
