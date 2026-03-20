'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { contactSchema, type ContactFormData } from '@/lib/validations'

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      type: 'general',
    },
  })

  const onSubmit = async (data: ContactFormData) => {
    setIsSubmitting(true)
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (res.ok) {
        setSubmitted(true)
      }
    } catch {
      // Handle error silently
    } finally {
      setIsSubmitting(false)
    }
  }

  const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_URL

  return (
    <main id="main">
      <section className="bg-cream py-12 px-4 md:py-20 md:px-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            {/* Left — Info */}
            <div>
              <p className="eyebrow mb-4">Contact Us</p>
              <h1 className="text-text mb-6">
                Let&apos;s talk about your child&apos;s summer.
              </h1>
              <p className="text-warm-gray text-base leading-relaxed mb-8 max-w-md">
                Whether you have questions about the program, want to discuss your
                child&apos;s IEP, or are ready to enroll — we&apos;re here to help.
                No sales pressure, just an honest conversation.
              </p>

              <div className="space-y-4 mb-10">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📧</span>
                  <div>
                    <p className="font-semibold text-text text-sm">Email</p>
                    <a
                      href="mailto:hello@iepandthrive.com"
                      className="text-forest-mid text-sm hover:underline"
                    >
                      hello@iepandthrive.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-lg">📍</span>
                  <div>
                    <p className="font-semibold text-text text-sm">Location</p>
                    <p className="text-warm-gray text-sm">Long Island, NY · Nassau/Suffolk County</p>
                  </div>
                </div>
              </div>

              {/* Calendly embed */}
              {calendlyUrl && (
                <div className="bg-cream-deep rounded-[20px] p-6">
                  <h3 className="font-display text-text mb-2">Book a Free Discovery Call</h3>
                  <p className="text-warm-gray text-sm mb-4">
                    20 minutes. No commitment. We&apos;ll review your child&apos;s IEP
                    and discuss program fit.
                  </p>
                  <a
                    href={calendlyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-forest text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-forest-mid transition-colors duration-200"
                  >
                    Book a Discovery Call →
                  </a>
                </div>
              )}
            </div>

            {/* Right — Form */}
            <div>
              {submitted ? (
                <div className="bg-sage-pale rounded-[20px] p-10 text-center">
                  <h3 className="font-display text-forest mb-3">Message Sent!</h3>
                  <p className="text-warm-gray text-sm">
                    Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                  </p>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="bg-white rounded-[20px] p-8 md:p-10"
                  style={{ boxShadow: '0 4px 24px rgba(27,67,50,0.06)' }}
                >
                  <h2 className="font-display text-xl font-bold text-text mb-6">
                    Send Us a Message
                  </h2>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-text mb-1">
                        Your Name
                      </label>
                      <input
                        id="name"
                        type="text"
                        {...register('name')}
                        className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-cream focus:border-forest-mid focus:ring-0 outline-none transition-colors"
                        placeholder="Full name"
                      />
                      {errors.name && (
                        <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-text mb-1">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        {...register('email')}
                        className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-cream focus:border-forest-mid focus:ring-0 outline-none transition-colors"
                        placeholder="you@example.com"
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-text mb-1">
                        Phone Number <span className="text-text-muted">(optional)</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        {...register('phone')}
                        className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-cream focus:border-forest-mid focus:ring-0 outline-none transition-colors"
                        placeholder="(555) 123-4567"
                      />
                    </div>

                    <div>
                      <label htmlFor="type" className="block text-sm font-medium text-text mb-1">
                        What can we help with?
                      </label>
                      <select
                        id="type"
                        {...register('type')}
                        className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-cream focus:border-forest-mid focus:ring-0 outline-none transition-colors"
                      >
                        <option value="general">General Question</option>
                        <option value="iep-review">IEP Review / Consultation</option>
                        <option value="discovery-call">Book a Discovery Call</option>
                      </select>
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-text mb-1">
                        Your Message
                      </label>
                      <textarea
                        id="message"
                        rows={5}
                        {...register('message')}
                        className="w-full border border-border rounded-xl px-4 py-3 text-sm bg-cream focus:border-forest-mid focus:ring-0 outline-none transition-colors resize-none"
                        placeholder="Tell us about your child and how we can help..."
                      />
                      {errors.message && (
                        <p className="text-red-500 text-xs mt-1">{errors.message.message}</p>
                      )}
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-forest text-white font-semibold text-sm py-3.5 rounded-full hover:bg-forest-mid transition-colors duration-200 disabled:opacity-60"
                    >
                      {isSubmitting ? 'Sending...' : 'Send Message →'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </main>
  )
}
