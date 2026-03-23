'use client'

import { useState } from 'react'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'
import { trackStripeCheckoutClick } from '@/lib/analytics'

const checkIcon = (
  <svg className="w-4 h-4 text-forest-light flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

const checkIconWhite = (
  <svg className="w-4 h-4 text-sage flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
)

interface ProgramCardProps {
  tag: string
  title: string
  description: string
  price: string
  ctaLabel: string
  program: string
  includes: string[]
  featured?: boolean
}

function ProgramCard({ tag, title, description, price, ctaLabel, program, includes, featured = false }: ProgramCardProps) {
  const [loading, setLoading] = useState(false)

  const handleCheckout = async () => {
    setLoading(true)
    trackStripeCheckoutClick(program)
    try {
      const res = await fetch(`${CLOUD_FUNCTIONS.stripeCheckout}?program=${program}`)
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      } else {
        alert('Unable to start checkout. Please try again.')
      }
    } catch {
      alert('Network error. Please check your connection and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className={`rounded-[20px] p-8 flex flex-col transition-all duration-200 hover:-translate-y-[3px] hover:shadow-[0_8px_32px_rgba(27,67,50,0.10)] ${
        featured
          ? 'bg-forest text-white'
          : 'bg-white'
      }`}
      aria-label={`${title} program`}
    >
      {/* Tag */}
      <span
        className={`inline-block self-start text-[11px] font-semibold tracking-[0.1em] uppercase px-3 py-1 rounded-full mb-4 ${
          featured
            ? 'bg-white/15 text-sage'
            : 'bg-sage-pale text-forest'
        }`}
      >
        {tag}
      </span>

      {/* Title */}
      <h4 className={`font-display text-[1.25rem] font-bold mb-3 ${featured ? 'text-white' : 'text-text'}`}>
        {title}
      </h4>

      {/* Description */}
      <p className={`text-[15px] leading-relaxed mb-6 ${featured ? 'text-white/70' : 'text-warm-gray'}`}>
        {description}
      </p>

      {/* Price */}
      <div className="mb-6" aria-label={`Price: ${price} per student for 6 weeks`}>
        <span className={`font-display text-[1.6rem] font-bold ${featured ? 'text-sage' : 'text-forest'}`} aria-hidden="true">
          {price}
        </span>
        <span className={`text-[13px] ml-2 ${featured ? 'text-white/50' : 'text-text-muted'}`} aria-hidden="true">
          per student · 6 weeks
        </span>
      </div>

      {/* Divider */}
      <div className={`border-t mb-6 ${featured ? 'border-white/10' : 'border-border'}`} />

      {/* Includes list */}
      <ul className="space-y-3 mb-8 flex-1">
        {includes.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[15px] leading-snug">
            {featured ? checkIconWhite : checkIcon}
            <span className={featured ? 'text-white/80' : 'text-text'}>{item}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <button
        onClick={handleCheckout}
        disabled={loading}
        className={`block text-center font-body font-semibold text-[15px] py-3.5 rounded-full transition-colors duration-200 cursor-pointer disabled:opacity-60 disabled:cursor-wait ${
          featured
            ? 'bg-white text-forest hover:bg-sage-pale'
            : 'bg-forest text-white hover:bg-forest-mid'
        }`}
      >
        {loading ? 'Redirecting to checkout...' : ctaLabel}
      </button>
    </div>
  )
}

const programs: ProgramCardProps[] = [
  {
    tag: 'Literacy Focus',
    title: 'Reading & Language Intensive',
    description:
      'For the child who struggles to decode, freezes at new words, or reads far below grade level. Structured literacy through Orton-Gillingham — the approach the research actually supports.',
    price: '$3,500',
    ctaLabel: 'Enroll — $875 Deposit',
    program: 'reading',
    includes: [
      '4 hrs/day, Mon–Fri',
      'Orton-Gillingham framework',
      'Weekly progress reports',
      'Final IEP-aligned report',
      'Max 6 students',
    ],
  },
  {
    tag: 'Most Popular',
    title: 'Full Academic Intensive',
    description:
      'Reading, math, executive function, and social-emotional learning — the full intervention your child needs to walk into September stronger than they left in June.',
    price: '$4,000',
    ctaLabel: 'Enroll — $1,000 Deposit',
    program: 'full',
    includes: [
      '4 hrs/day, Mon–Fri',
      'Literacy + math + SEL blocks',
      'Daily themed enrichment activities',
      'Executive function coaching',
      'Weekly parent debrief + reports',
      'Student portfolio + CSE-ready final report',
      'Max 6 students',
    ],
    featured: true,
  },
  {
    tag: 'Math Focus',
    title: 'Math & Numeracy Intensive',
    description:
      'For the child who shuts down at word problems, counts on fingers past third grade, or has math goals the school year barely touched. Concrete tools, real understanding.',
    price: '$3,500',
    ctaLabel: 'Enroll — $875 Deposit',
    program: 'math',
    includes: [
      '4 hrs/day, Mon–Fri',
      'Concrete-representational-abstract method',
      'Weekly progress reports',
      'Final IEP-aligned report',
      'Max 6 students',
    ],
  },
]

export default function ProgramCards() {
  return (
    <section id="program" className="bg-cream-deep py-20 px-8 md:px-20">
      {/* Header */}
      <div className="max-w-6xl mx-auto text-center mb-14">
        <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-forest-light mb-3 block">
          Summer 2026 Programs
        </span>
        <h2 className="font-display text-[clamp(1.8rem,3vw,2.6rem)] font-bold tracking-[-0.025em] leading-[1.18] text-text mb-4">
          Three programs. One standard: your child&apos;s IEP goals.
        </h2>
        <p className="text-[16px] leading-[1.7] text-warm-gray max-w-2xl mx-auto">
          Every track is small-group, evidence-based, and led by a credentialed SPED
          interventionist. Students are grouped by learning profile — not just age.
        </p>
      </div>

      {/* Card Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {programs.map((program, i) => (
          <ProgramCard key={i} {...program} />
        ))}
      </div>
    </section>
  )
}

