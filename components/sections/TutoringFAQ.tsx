'use client'

import { useState } from 'react'
import SectionHeader from '@/components/ui/SectionHeader'
import { trackFAQItemOpened } from '@/lib/analytics'

const faqs = [
  {
    question: 'Do you tutor in person or only via Zoom?',
    answer:
      "Both. Most families choose Zoom for the schedule flexibility, but in-person sessions are available on Long Island (Nassau/Suffolk) on a limited basis. We'll confirm modality on your first session.",
  },
  {
    question: "What happens if my child can't make a session?",
    answer:
      'Cancel at least 24 hours in advance and we credit the session within the same billing cycle. Same-day cancellations and no-shows forfeit the session — that policy keeps the calendar honest for everyone.',
  },
  {
    question: 'Can sessions roll over to next month?',
    answer:
      "No. Sessions reset on each billing cycle and don't accumulate. This keeps capacity predictable for the founder and prevents the stockpile-and-cancel cycle that erodes consistency.",
  },
  {
    question: 'How is this different from your summer cohort?',
    answer:
      'The cohort is a 6-week, 4-hour-a-day group intensive aimed at preventing summer regression. Tutoring is 1-on-1, year-round, and built for steady weekly progress — or fast-cycle support during a CSE crunch.',
  },
  {
    question: 'Do you handle CSE meeting prep?',
    answer:
      "Yes — book the IEP Review add-on for a dedicated 75-minute session plus a written summary, or fold CSE prep into your subscription as one of your weekly slots. Either way, you walk into the meeting with documented data.",
  },
  {
    question: 'What if I need to pause my subscription?',
    answer:
      "You can pause or cancel anytime through Stripe's customer portal — no calls, no friction. While paused, you keep your slot in the system but aren't billed and don't get sessions.",
  },
]

function FAQCard({
  question,
  answer,
  isOpen,
  onToggle,
  index,
}: {
  question: string
  answer: string
  isOpen: boolean
  onToggle: () => void
  index: number
}) {
  const answerId = `tutoring-faq-answer-${index}`
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
          style={{ transform: isOpen ? 'rotate(45deg)' : 'rotate(0deg)' }}
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
        style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <p className="pt-3 text-[15px] leading-[1.6] text-warm-gray">
            {answer}
          </p>
        </div>
      </div>
    </div>
  )
}

export default function TutoringFAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const handleToggle = (index: number) => {
    if (openIndex !== index) {
      trackFAQItemOpened(faqs[index].question)
    }
    setOpenIndex(openIndex === index ? null : index)
  }

  const leftFaqs = faqs.slice(0, 3)
  const rightFaqs = faqs.slice(3)

  return (
    <section
      id="tutoring-faq"
      className="bg-cream-deep px-8 py-12 md:px-[5rem] md:py-[5rem]"
    >
      <SectionHeader
        eyebrow="Common Questions"
        title="What parents ask before they book."
      />

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
              key={i + 3}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === i + 3}
              onToggle={() => handleToggle(i + 3)}
              index={i + 3}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
