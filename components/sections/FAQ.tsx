"use client";

import { useState } from "react";
import SectionHeader from "../ui/SectionHeader";
import { trackFAQItemOpened } from "@/lib/analytics";

const faqs = [
  {
    question: "Does my child need to have an IEP to enroll?",
    answer:
      "No. Students with active IEPs, 504 Plans, or documented learning differences are all welcome. We\u2019ll discuss the right fit on your discovery call.",
  },
  {
    question: "How are cohorts grouped?",
    answer:
      "We group by learning profile and primary intervention need \u2014 not just grade level. A 3rd and 4th grader with similar reading goals will have a better experience together than two 3rd graders with very different needs.",
  },
  {
    question: "What is the deposit and refund policy?",
    answer:
      "A 25% non-refundable deposit holds your spot. The remaining balance is due 2 weeks before program start. If we cancel a session due to an emergency, we credit or reschedule.",
  },
  {
    question: "Where is the program located?",
    answer:
      "We operate out of a dedicated community space on Long Island (Nassau/Suffolk). Exact location provided upon enrollment. We are not a home-based program.",
  },
  {
    question: "Will the progress reports help at my child\u2019s IEP meeting?",
    answer:
      "Yes \u2014 that\u2019s by design. Weekly reports track goal attainment using the same language and format districts use. The final report gives you documented summer progress data that schools must consider.",
  },
  {
    question: "Can I use FSA or HSA funds?",
    answer:
      "Educational therapy for a diagnosed learning disability may qualify as a medical expense. We recommend confirming with your benefits administrator. We provide itemized receipts for all payments.",
  },
  {
    question: "What if my child needs 1:1 support?",
    answer:
      "Our group program is designed for students who can work in small groups (2\u20136 peers). If your child requires 1:1 instruction, we offer a limited number of individual sessions \u2014 ask about availability on your discovery call.",
  },
  {
    question: "When does Summer 2026 enrollment close?",
    answer:
      "Early enrollment closes April 30, 2026. Cohorts typically fill by May. We recommend reserving early \u2014 once a cohort reaches 6 students, it is closed and families go to a waitlist.",
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
        title="Everything parents ask before enrolling."
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
