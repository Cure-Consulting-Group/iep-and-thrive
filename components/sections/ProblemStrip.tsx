export default function ProblemStrip() {
  const stats = [
    {
      number: "2\u20133\u00D7",
      title: "The regression no one warns you about",
      desc: "Children with IEPs lose skills over summer at two to three times the rate of their peers. By September, months of hard-won progress have quietly disappeared.",
    },
    {
      number: "$0",
      title: "What most districts offer for ESY",
      desc: "The district said your child doesn\u2019t qualify. Now you\u2019re searching for someone who actually understands IEPs \u2014 not a tutor reading from a workbook they found online.",
    },
    {
      number: "1 in 5",
      title: "Kids have a learning difference",
      desc: "On Long Island alone, tens of thousands of students need structured summer intervention. The number of credentialed providers offering it? You can count them on one hand.",
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
