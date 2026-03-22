'use client'

import { useState, FormEvent } from 'react'
import { CLOUD_FUNCTIONS } from '@/lib/functions-config'

/* ------------------------------------------------------------------ */
/*  SEO metadata is exported from a separate file since this is       */
/*  a client component. We handle it via generateMetadata below.      */
/* ------------------------------------------------------------------ */

/* ── Data ---------------------------------------------------------- */

const questions = [
  {
    num: '1',
    title: 'Is my child eligible for Extended School Year (ESY) services?',
    why: (
      <>
        Districts must offer ESY if regression is likely — but most{' '}
        <strong>won&apos;t bring it up unless you ask</strong>. Request the
        determination in writing before school ends.
      </>
    ),
  },
  {
    num: '2',
    title: 'Which specific IEP goals should we prioritize this summer?',
    why: (
      <>
        Not all goals are equal. Ask your child&apos;s provider to identify the{' '}
        <strong>2–3 goals most at risk</strong> of regression so your summer
        plan targets them directly.
      </>
    ),
  },
  {
    num: '3',
    title:
      "What evidence-based methods match my child's learning profile?",
    why: (
      <>
        Generic tutoring rarely works. For reading, ask specifically about{' '}
        <strong>Orton-Gillingham or structured literacy</strong>. For math, ask
        about the CRA (Concrete-Representational-Abstract) method.
      </>
    ),
  },
  {
    num: '4',
    title:
      "How will summer progress be documented for September's CSE meeting?",
    why: (
      <>
        Any summer program worth the investment should produce{' '}
        <strong>data you can bring to fall meetings</strong>. Ask for weekly
        progress reports and a final written summary.
      </>
    ),
  },
  {
    num: '5',
    title:
      "What's the student-to-teacher ratio, and how are groups formed?",
    why: (
      <>
        Group size matters enormously. <strong>6 or fewer</strong> is ideal for
        students with IEPs. Ask how groups are formed — by grade, by learning
        profile, or at random.
      </>
    ),
  },
]

const stats = [
  { num: '2–3×', label: 'Faster regression for IEP students' },
  { num: '6wk', label: 'Minimum for meaningful gains' },
  { num: '1 in 5', label: 'Students have a learning difference' },
]

const statsChecklist = [
  'Most districts deny ESY — private programs fill the gap',
  'Unstructured summers erase school-year progress',
  'September regression is preventable with the right intervention',
]

const redFlags = [
  "No mention of your child's actual IEP before starting",
  'Groups larger than 8–10 students',
  'No written progress reports during the program',
  'Generic curriculum not tied to learning profile',
  'Tutor without special education certification',
  'No plan for documenting growth for fall CSE meeting',
]

const glossary = [
  {
    term: 'IEP',
    definition:
      "Individualized Education Program. The legal document outlining your child's goals, services, and accommodations.",
  },
  {
    term: 'CSE',
    definition:
      "Committee on Special Education. The school team that writes and reviews your child's IEP annually.",
  },
  {
    term: 'ESY',
    definition:
      'Extended School Year. Summer services a district must provide if regression is likely without them.',
  },
  {
    term: 'Orton-Gillingham',
    definition:
      'Evidence-based structured literacy approach. The gold standard for students with dyslexia and reading challenges.',
  },
  {
    term: 'FAPE',
    definition:
      "Free Appropriate Public Education. Your child's federal right — the legal foundation of all IEP services.",
  },
  {
    term: 'SWD',
    definition:
      'Students with Disabilities. The NYS certification required for teachers working with IEP students.',
  },
]

/* ── Component ---------------------------------------------------- */

export default function SummerGuidePage() {
  const [formState, setFormState] = useState<
    'idle' | 'submitting' | 'success' | 'error'
  >('idle')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setFormState('submitting')
    try {
      const res = await fetch(CLOUD_FUNCTIONS.summerGuideCapture, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), email: email.trim() }),
      })
      if (!res.ok) throw new Error('Request failed')
      setFormState('success')
    } catch {
      setFormState('error')
    }
  }

  return (
    <>
      {/* ---------- Print Styles ---------- */}
      <style>{`
        @media print {
          /* Hide site chrome */
          nav, footer, .urgency-banner, .skip-to-content,
          .print-btn-wrapper, .email-capture-section { display: none !important; }

          body { background: white !important; font-size: 12px; }
          .guide-sheet { max-width: 100% !important; box-shadow: none !important; }

          /* Avoid page breaks inside cards */
          .question-card-print, .info-card-print, .term-card-print {
            break-inside: avoid;
          }

          /* Reset padding for print */
          .guide-body { padding: 16px 24px !important; }
          .guide-header { padding: 24px 28px 20px !important; }
        }
      `}</style>

      <main id="main" className="bg-cream min-h-screen">
        <div className="guide-sheet mx-auto max-w-4xl">

          {/* ============ HEADER ============ */}
          <div className="guide-header relative overflow-hidden bg-forest px-6 py-8 sm:px-10 sm:py-8">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-10 -right-10 h-[200px] w-[200px] rounded-full bg-sage/[0.08]" />
            <div className="pointer-events-none absolute -bottom-15 right-20 h-[140px] w-[140px] rounded-full bg-sage/[0.05]" />

            {/* Brand tag */}
            <div className="absolute top-8 right-6 text-right sm:right-10">
              <div className="font-display text-[15px] font-bold text-white tracking-tight">
                IEP <span className="text-amber">&amp;</span> Thrive
              </div>
              <div className="mt-0.5 text-[10px] text-white/45">
                A Cure Consulting Group Program
              </div>
            </div>

            {/* Eyebrow */}
            <div className="mb-2.5 flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-sage">
              <span className="inline-block h-[1.5px] w-5 bg-forest-light" />
              Parent Resource Guide
            </div>

            {/* Headline */}
            <h1 className="mb-2.5 max-w-[520px] font-display text-[clamp(1.5rem,3.5vw,1.75rem)] font-bold leading-[1.15] tracking-[-0.02em] text-white">
              5 Questions Every IEP Parent Should Ask
              <br className="hidden sm:block" /> Before{' '}
              <em className="text-sage italic">Summer Begins</em>
            </h1>

            {/* Sub */}
            <p className="max-w-[500px] text-[13px] leading-relaxed text-white/60">
              Most students with learning differences lose critical progress
              over summer. Armed with the right questions, you can prevent it —
              and walk into September stronger.
            </p>
          </div>

          {/* ============ AMBER BAND ============ */}
          <div className="bg-amber px-6 py-2.5 text-xs font-semibold text-white tracking-wide sm:px-10">
            <strong className="font-bold">Did you know?</strong> Students with
            IEPs can regress 2–3x faster than peers over summer. This guide was
            written by a credentialed NYC SPED interventionist who has spent 8+
            years inside the system.
          </div>

          {/* ============ BODY ============ */}
          <div className="guide-body grid grid-cols-1 gap-5 px-6 py-7 sm:px-10 md:grid-cols-2">
            {/* ---- Left Column: Questions ---- */}
            <div>
              {/* Section label */}
              <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-forest-light">
                The 5 questions
                <span className="flex-1 h-px bg-forest-light/25" />
              </div>

              <div className="flex flex-col gap-2.5">
                {questions.map((q) => (
                  <div
                    key={q.num}
                    className="question-card-print flex gap-3 items-start rounded-xl border border-border bg-white p-3.5 sm:p-4"
                  >
                    <span className="font-display text-[22px] font-bold leading-none text-forest-light/40 min-w-[24px] mt-px">
                      {q.num}
                    </span>
                    <div>
                      <div className="text-[13px] font-semibold leading-snug text-forest mb-1">
                        {q.title}
                      </div>
                      <div className="text-[11.5px] leading-relaxed text-text-muted [&_strong]:text-warm-gray [&_strong]:font-semibold">
                        {q.why}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- Right Column: Info Cards ---- */}
            <div className="flex flex-col gap-4">
              {/* Stats card (forest) */}
              <div className="info-card-print rounded-xl bg-forest p-4">
                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-sage">
                  Summer regression by the numbers
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2.5">
                  {stats.map((s) => (
                    <div
                      key={s.num}
                      className="rounded-lg bg-sage/[0.12] px-1.5 py-2.5 text-center"
                    >
                      <span className="block font-display text-xl font-bold leading-none text-sage">
                        {s.num}
                      </span>
                      <span className="mt-1 block text-[10px] leading-tight text-white/55">
                        {s.label}
                      </span>
                    </div>
                  ))}
                </div>
                <ul className="flex flex-col gap-1.5">
                  {statsChecklist.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs leading-normal text-white/85"
                    >
                      <span className="mt-0.5 flex h-[15px] w-[15px] shrink-0 items-center justify-center rounded-full bg-sage/25">
                        <svg
                          width="8"
                          height="6"
                          viewBox="0 0 8 6"
                          fill="none"
                          className="block"
                        >
                          <path
                            d="M1 3L3 5L7 1"
                            stroke="white"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Red flags card */}
              <div className="info-card-print rounded-xl border border-border bg-white p-4">
                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-forest-light">
                  Red flags to watch for
                </div>
                <div className="flex flex-col gap-1.5">
                  {redFlags.map((flag) => (
                    <div
                      key={flag}
                      className="flex items-start gap-2 text-xs leading-normal text-text"
                    >
                      <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-[#C0392B]" />
                      {flag}
                    </div>
                  ))}
                </div>
              </div>

              {/* FSA / HSA tip card */}
              <div className="info-card-print rounded-r-xl border-y border-r border-amber/15 border-l-[3px] border-l-amber bg-[#FFF8EC] p-4">
                <div className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-amber">
                  FSA / HSA tip
                </div>
                <p className="text-xs leading-relaxed text-[#7A4A00]">
                  Educational therapy for a{' '}
                  <strong className="font-bold text-amber">
                    diagnosed learning disability
                  </strong>{' '}
                  may qualify as a medical expense under your FSA or HSA. Request
                  an itemized receipt from any provider and confirm eligibility
                  with your benefits administrator before enrolling.
                </p>
              </div>
            </div>

            {/* ---- Full-width: Glossary ---- */}
            <div className="md:col-span-2">
              <div className="mb-4 h-px bg-border" />
              <div className="mb-3 flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-forest-light">
                IEP parent glossary — terms you&apos;ll hear at every meeting
                <span className="flex-1 h-px bg-forest-light/25" />
              </div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {glossary.map((g) => (
                  <div
                    key={g.term}
                    className="term-card-print rounded-[10px] border border-border/70 bg-white px-3 py-2.5"
                  >
                    <div className="text-[11px] font-bold tracking-[0.02em] text-forest mb-0.5">
                      {g.term}
                    </div>
                    <div className="text-[11px] leading-normal text-text-muted">
                      {g.definition}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ============ EMAIL CAPTURE ============ */}
          <div className="email-capture-section bg-cream-deep px-6 py-10 sm:px-10">
            <div className="mx-auto max-w-lg text-center">
              <div className="eyebrow mb-2 text-forest-light">
                Free Download
              </div>
              <h2 className="font-display text-[clamp(1.4rem,3vw,1.8rem)] font-bold tracking-tight text-forest mb-3">
                Get the PDF version of this guide
              </h2>
              <p className="text-sm leading-relaxed text-text-muted mb-6">
                Enter your name and email below and we&apos;ll send you a
                printable PDF — plus a short 3-email series with more IEP
                advocacy tips for summer.
              </p>

              {formState === 'success' ? (
                <div className="rounded-2xl border border-sage bg-sage-pale/60 p-6">
                  <div className="mb-2 font-display text-lg font-bold text-forest">
                    Check your email!
                  </div>
                  <p className="text-sm text-text-muted mb-4">
                    We&apos;ve sent the PDF to{' '}
                    <strong className="text-text">{email}</strong>. Be sure to
                    check spam if you don&apos;t see it in a few minutes.
                  </p>
                  <a
                    href="/summer-guide/iep-thrive-summer-guide.pdf"
                    download
                    className="inline-flex items-center rounded-full bg-forest px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest-mid"
                  >
                    Download PDF Now
                    <span className="ml-1.5" aria-hidden="true">
                      &darr;
                    </span>
                  </a>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <input
                      type="text"
                      placeholder="First name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="form-input"
                    />
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="form-input"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={formState === 'submitting'}
                    className="w-full rounded-full bg-forest px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-forest-mid disabled:opacity-60"
                  >
                    {formState === 'submitting'
                      ? 'Sending...'
                      : 'Send Me the PDF'}
                  </button>
                  {formState === 'error' && (
                    <p className="text-xs text-[#C0392B]">
                      Something went wrong. Please try again.
                    </p>
                  )}
                  <p className="text-[11px] text-text-muted">
                    No spam — just 3 practical emails, then we stop. Unsubscribe
                    anytime.
                  </p>
                </form>
              )}
            </div>
          </div>

          {/* ============ FOOTER BAR ============ */}
          <div className="flex flex-col items-center justify-between gap-2 bg-[#111810] px-6 py-3.5 sm:flex-row sm:px-10">
            <div className="text-[11px] text-white/40">
              <strong className="font-semibold text-white/70">
                IEP &amp; Thrive
              </strong>{' '}
              &middot; SPED Summer Intensive &middot; Long Island, NY &middot;
              hello@iepandthrive.com
            </div>
            <div className="text-[11px] font-semibold tracking-[0.03em] text-sage">
              iepandthrive.com &middot; Summer 2026 Enrollment Open
            </div>
          </div>
        </div>

        {/* ============ PRINT BUTTON ============ */}
        <div className="print-btn-wrapper py-6 text-center">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-full bg-forest px-6 py-2.5 text-[13px] font-semibold tracking-[0.02em] text-white transition-colors hover:bg-forest-mid"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              className="shrink-0"
            >
              <path
                d="M4 6V1h8v5M4 12H2.5A1.5 1.5 0 011 10.5v-4A1.5 1.5 0 012.5 5h11A1.5 1.5 0 0115 6.5v4a1.5 1.5 0 01-1.5 1.5H12M4 9h8v6H4V9z"
                stroke="currentColor"
                strokeWidth="1.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Print / Save as PDF
          </button>
        </div>
      </main>
    </>
  )
}
