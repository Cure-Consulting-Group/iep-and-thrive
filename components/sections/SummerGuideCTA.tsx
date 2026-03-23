import Image from 'next/image'
import Link from 'next/link'

export default function SummerGuideCTA() {
  return (
    <section className="bg-cream-deep py-16 md:py-20">
      <div className="max-w-6xl mx-auto px-6 md:px-10">
        <div className="bg-white rounded-2xl border border-border overflow-hidden md:grid md:grid-cols-5 md:items-center">
          {/* Left — Content */}
          <div className="p-8 md:p-10 md:col-span-3">
            <span className="inline-flex items-center gap-2 bg-sage-pale text-forest text-[11px] font-semibold uppercase tracking-widest px-3 py-1.5 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-forest-light" />
              Free Parent Resource
            </span>
            <h2 className="font-display text-xl md:text-2xl font-bold text-text leading-tight mb-3">
              5 Questions Every IEP Parent Should Ask{' '}
              <span className="text-forest-mid italic">Before Summer Begins</span>
            </h2>
            <p className="text-warm-gray text-sm leading-relaxed mb-6 max-w-lg">
              Know exactly what to look for — and what red flags to avoid — when
              choosing a summer program for your child with an IEP. Written by a
              credentialed NYC SPED interventionist.
            </p>
            <Link
              href="/summer-guide"
              className="inline-flex items-center gap-2 bg-forest text-white font-body font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest-mid transition-colors duration-200"
            >
              Download the Free Guide
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V3" />
              </svg>
            </Link>
          </div>

          {/* Right — Visual card preview */}
          <div className="hidden md:block md:col-span-2 bg-forest p-8 h-full relative overflow-hidden">
            <Image
              src="/images/child-reading.jpg"
              alt="Child reading a book at sunset"
              fill
              className="object-cover opacity-20"
              sizes="40vw"
            />
            <div className="relative z-10 bg-white/10 border border-white/15 rounded-xl p-5">
              <p className="text-sage text-[10px] font-semibold uppercase tracking-widest mb-3">
                Inside the guide
              </p>
              <ul className="space-y-2.5">
                {[
                  'ESY eligibility — what districts won\'t tell you',
                  'Which IEP goals to prioritize this summer',
                  'Evidence-based methods that actually work',
                  'How to document progress for September CSE',
                  'Red flags to watch for in any program',
                  'FSA/HSA tip most parents don\'t know',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2.5">
                    <span className="w-4 h-4 rounded-full bg-sage/20 flex items-center justify-center shrink-0 mt-0.5">
                      <svg className="w-2.5 h-2.5 text-sage" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </span>
                    <span className="text-white/80 text-xs leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
