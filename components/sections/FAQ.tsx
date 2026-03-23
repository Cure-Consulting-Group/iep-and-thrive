"use client";

import { useState } from "react";
import SectionHeader from "../ui/SectionHeader";
import { trackFAQItemOpened } from "@/lib/analytics";

const faqs = [
  {
    question: "Does my child need an IEP to enroll?",
    answer:
      "No. Children with active IEPs, 504 Plans, or documented learning differences are all welcome. We\u2019ll talk through fit on your discovery call \u2014 the goal is the right match, not a rubber stamp.",
  },
  {
    question: "How do you decide who\u2019s in which group?",
    answer:
      "By learning profile, not birth year. A third grader and a fourth grader working on the same reading goals will learn better together than two third graders with completely different needs. Grouping is intentional.",
  },
  {
    question: "What\u2019s the deposit and refund policy?",
    answer:
      "A 25% non-refundable deposit holds your child\u2019s seat. The remaining balance is due two weeks before the program starts. If we ever need to cancel a session, you receive a credit or a reschedule \u2014 no questions asked.",
  },
  {
    question: "Where exactly is the program?",
    answer:
      "We operate out of a dedicated instructional space on Long Island (Nassau/Suffolk). This is not a home-based program. The exact address is shared once enrollment is confirmed.",
  },
  {
    question: "Can I actually use the progress reports at a CSE meeting?",
    answer:
      "That\u2019s the entire point. Weekly reports use the same language and goal-tracking format your district uses. The final report documents measurable summer progress \u2014 data the school is required to consider.",
  },
  {
    question: "Does this qualify for FSA or HSA?",
    answer:
      "Educational therapy for a diagnosed learning disability may qualify as a medical expense under your plan. Check with your benefits administrator. We provide itemized receipts for every payment.",
  },
  {
    question: "What if my child needs one-on-one support?",
    answer:
      "This program is designed for children who can work in a small group of up to six peers. If your child needs 1:1 instruction, we offer a limited number of individual sessions \u2014 ask on your discovery call.",
  },
  {
    question: "When does enrollment close?",
    answer:
      "Early enrollment closes April 30, 2026. Historically, cohorts fill by mid-May. There is no waitlist \u2014 once six seats are taken, enrollment is closed. If you\u2019re considering it, don\u2019t wait.",
  },
];

function FAQCard({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const answerId = `faq-answer-${index}`;
  return (
    <div className="rounded-[14px] bg-white p-5 transition-shadow duration-200 hover:shadow-[0_8px_32px_rgba(27,67,50,0.10)]">
      <button
        onClick={onToggle}
        className="flex w-full items-start justify-between gap-3 text-left"
        aria-expanded={isOpen}
        aria-controls={answerId}
      >
        <span className="text-[15px] font-bold leading-snug text-text">
          {question}
        </span>
        <span
          className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-sage-pale text-forest transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(45deg)" : "rotate(0deg)" }}
          aria-hidden="true"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <line x1="7" y1="2" x2="7" y2="12" />
            <line x1="2" y1="7" x2="12" y2="7" />
          </svg>
        </span>
      </button>
      <div
        id={answerId}
        role="region"
        className="grid transition-[grid-template-rows] duration-200 ease-in-out"
        style={{
          gridTemplateRows: isOpen ? "1fr" : "0fr",
        }}
      >
        <div className="overflow-hidden">
          <p className="pt-3 text-[15px] leading-[1.6] text-warm-gray">
            {answer}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    if (openIndex !== index) {
      trackFAQItemOpened(faqs[index].question);
    }
    setOpenIndex(openIndex === index ? null : index);
  };

  // Split into two columns for desktop
  const leftFaqs = faqs.slice(0, 4);
  const rightFaqs = faqs.slice(4);

  return (
    <section id="faq" className="bg-cream-deep px-8 py-12 md:px-[5rem] md:py-[5rem]">
      <SectionHeader
        eyebrow="Common Questions"
        title="The questions every parent asks — and the honest answers."
      />

      {/* 2-column grid on desktop, 1-column on mobile */}
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-4">
          {leftFaqs.map((faq, i) => (
            <FAQCard
              key={i}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i}
              onToggle={() => handleToggle(i)}
              index={i}
            />
          ))}
        </div>
        <div className="flex flex-col gap-4">
          {rightFaqs.map((faq, i) => (
            <FAQCard
              key={i + 4}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i + 4}
              onToggle={() => handleToggle(i + 4)}
              index={i + 4}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
