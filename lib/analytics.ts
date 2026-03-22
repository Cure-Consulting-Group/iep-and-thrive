/**
 * Analytics & Conversion Tracking — S5-07
 *
 * Lightweight event tracking for key conversion points.
 * Uses Google Analytics 4 (gtag) when available.
 * No PII is ever included in event data.
 */

type EventParams = Record<string, string | number | boolean>

/**
 * Fire a custom analytics event.
 * Safe to call anywhere — gracefully no-ops if gtag isn't loaded.
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window === 'undefined') return

  // Google Analytics 4 via gtag
  if (typeof window.gtag === 'function') {
    window.gtag('event', eventName, params)
  }

  // Debug logging in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Analytics] ${eventName}`, params || '')
  }
}

// ─── Typed Conversion Events ───

export function trackEnrollmentSubmit(program: string): void {
  trackEvent('enrollment_form_submit', {
    form_type: 'enrollment_inquiry',
    program_interest: program,
  })
}

export function trackContactSubmit(contactType: string): void {
  trackEvent('contact_form_submit', {
    form_type: 'contact',
    contact_type: contactType,
  })
}

export function trackStripeCheckoutClick(program: string): void {
  trackEvent('stripe_checkout_click', {
    program_type: program,
  })
}

export function trackDiscoveryCallClick(source: string): void {
  trackEvent('discovery_call_click', {
    click_source: source,
  })
}

export function trackBookingCreated(bookingType: string): void {
  trackEvent('booking_created', {
    booking_type: bookingType,
  })
}

export function trackSignupCompleted(): void {
  trackEvent('signup_completed')
}

export function trackFAQItemOpened(question: string): void {
  // Truncate question to avoid sending excessive data
  trackEvent('faq_item_opened', {
    question: question.slice(0, 80),
  })
}

// ─── Global type augmentation for gtag ───

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}
