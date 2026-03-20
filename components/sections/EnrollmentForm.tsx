'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { enrollmentSchema, type EnrollmentFormData } from '@/lib/validations'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

const gradeOptions = [
  { value: 'K', label: 'Kindergarten' },
  { value: '1st', label: '1st Grade' },
  { value: '2nd', label: '2nd Grade' },
  { value: '3rd', label: '3rd Grade' },
  { value: '4th', label: '4th Grade' },
  { value: '5th', label: '5th Grade' },
  { value: '6th', label: '6th Grade' },
]

const programOptions = [
  { value: 'Full Academic Intensive', label: 'Full Academic Intensive' },
  { value: 'Reading & Language Intensive', label: 'Reading & Language Intensive' },
  { value: 'Math & Numeracy Intensive', label: 'Math & Numeracy Intensive' },
  { value: 'Not sure yet', label: 'Not sure yet' },
]

const challengeOptions = [
  { value: 'Reading/Dyslexia', label: 'Reading / Dyslexia' },
  { value: 'Math/Dyscalculia', label: 'Math / Dyscalculia' },
  { value: 'ADHD/Executive Function', label: 'ADHD / Executive Function' },
  { value: 'Language Processing', label: 'Language Processing' },
  { value: 'Autism Spectrum', label: 'Autism Spectrum' },
  { value: 'Multiple areas/not sure', label: 'Multiple areas / not sure' },
]

const features = [
  { icon: '\u{1F4C5}', text: 'Program dates: July 7 \u2013 August 14, 2026 \u00B7 Mon\u2013Thu, 9am\u20131pm' },
  { icon: '\u{1F4CD}', text: 'Long Island, NY \u00B7 Nassau/Suffolk \u00B7 Exact location shared upon enrollment' },
  { icon: '\u{1F4B3}', text: 'Secure Stripe payment \u00B7 25% deposit to hold spot \u00B7 Balance due June 23' },
  { icon: '\u{1F4DE}', text: 'Not ready to commit? Book a free discovery call instead \u2014 no pressure' },
  { icon: '\u{1F3E2}', text: 'A program of IEP & Thrive, powered by Cure Consulting Group' },
]

export default function EnrollmentForm() {
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<EnrollmentFormData>({
    resolver: zodResolver(enrollmentSchema),
  })

  const onSubmit = async (data: EnrollmentFormData) => {
    setSubmitting(true)
    setServerError('')

    try {
      const res = await fetch('/api/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const result = await res.json()
        throw new Error(result.error || 'Something went wrong')
      }

      router.push('/success')
    } catch (err) {
      setServerError(
        err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <section id="enroll" className="bg-forest py-20 px-8 md:px-20">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* Left column */}
          <div>
            <p
              className="text-sage mb-3"
              style={{
                fontSize: '11px',
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
              }}
            >
              Enrollment
            </p>
            <h2 className="font-display text-white font-bold tracking-tight leading-tight mb-4"
              style={{ fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', letterSpacing: '-0.025em', lineHeight: 1.18 }}
            >
              Reserve your child&rsquo;s spot for Summer 2026.
            </h2>
            <p className="text-base leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Cohorts fill quickly. Complete the form and we&rsquo;ll reach out within 24 hours to
              confirm fit and send your deposit link.
            </p>

            <ul className="space-y-4">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0 mt-0.5">{feature.icon}</span>
                  <span
                    className="text-sm leading-relaxed"
                    style={{ color: 'rgba(255,255,255,0.75)' }}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right column — form card */}
          <div className="bg-white rounded-[20px] p-8 md:p-10 text-text">
            <h3
              className="font-display font-bold mb-6"
              style={{ fontSize: '1.3rem' }}
            >
              Student Enrollment Inquiry
            </h3>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Row 1: Name + Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="parentName" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                    Parent/Guardian Name
                  </label>
                  <input
                    id="parentName"
                    type="text"
                    {...register('parentName')}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted/50 outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200"
                    placeholder="Full name"
                  />
                  {errors.parentName && (
                    <p className="mt-1 text-xs text-red-600">{errors.parentName.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    {...register('email')}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted/50 outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200"
                    placeholder="you@email.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>
              </div>

              {/* Row 2: Phone + Grade */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    {...register('phone')}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted/50 outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200"
                    placeholder="(555) 000-0000"
                  />
                  {errors.phone && (
                    <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="childGrade" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                    Child&rsquo;s Current Grade
                  </label>
                  <select
                    id="childGrade"
                    {...register('childGrade')}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200 appearance-none"
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Select grade
                    </option>
                    {gradeOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  {errors.childGrade && (
                    <p className="mt-1 text-xs text-red-600">{errors.childGrade.message}</p>
                  )}
                </div>
              </div>

              {/* Row 3: Program Interest */}
              <div>
                <label htmlFor="programInterest" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                  Program Interest
                </label>
                <select
                  id="programInterest"
                  {...register('programInterest')}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200 appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select a program
                  </option>
                  {programOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.programInterest && (
                  <p className="mt-1 text-xs text-red-600">{errors.programInterest.message}</p>
                )}
              </div>

              {/* Row 4: Learning Challenge */}
              <div>
                <label htmlFor="learningChallenge" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                  Primary Learning Challenge
                </label>
                <select
                  id="learningChallenge"
                  {...register('learningChallenge')}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200 appearance-none"
                  defaultValue=""
                >
                  <option value="" disabled>
                    Select primary challenge
                  </option>
                  {challengeOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                {errors.learningChallenge && (
                  <p className="mt-1 text-xs text-red-600">{errors.learningChallenge.message}</p>
                )}
              </div>

              {/* Row 5: Notes */}
              <div>
                <label htmlFor="notes" className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wider">
                  Anything you&rsquo;d like us to know?
                </label>
                <textarea
                  id="notes"
                  {...register('notes')}
                  rows={4}
                  className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm text-text placeholder:text-text-muted/50 outline-none focus:ring-2 focus:ring-forest-mid transition-all duration-200 resize-none"
                  placeholder="IEP details, specific concerns, questions... (optional)"
                />
              </div>

              {/* Server error */}
              {serverError && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-full bg-forest text-white py-3.5 text-sm font-semibold font-body hover:bg-forest-mid transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? 'Submitting...' : 'Submit Enrollment Inquiry \u2192'}
              </button>

              {/* Note */}
              <p className="text-xs text-text-muted leading-relaxed text-center">
                By submitting, you agree to be contacted about program availability.
                A 25% deposit will be required to confirm enrollment. Spots are not
                held without a deposit.
              </p>
            </form>
          </div>
        </div>
      </div>
    </section>
  )
}
