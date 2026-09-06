/**
 * Analytics & Conversion Tracking — S5-07
 *
 * Lightweight event tracking for key conversion points.
 * Uses Google Analytics 4 (gtag) when available.
 * No PII is ever included in event data.
 */

type EventParams = Record<string, string | number | boolean>

const SAFE_PARAM_VALUES: Record<string, Record<string, readonly string[]>> = {
  enrollment_form_submit: {
    form_type: ['enrollment_inquiry'],
    program_interest: ['full', 'reading', 'math', 'undecided'],
  },
  contact_form_submit: {
    form_type: ['contact'],
    contact_type: ['general', 'iep_review', 'discovery_call'],
  },
  stripe_checkout_click: {
    program_type: [
      'full',
      'reading',
      'math',
      'tutoring_drop_in',
      'tutoring_weekly',
      'tutoring_twice_weekly',
      'tutoring_iep_review',
    ],
  },
  discovery_call_click: {
    click_source: ['how_it_works', 'contact_page'],
  },
  booking_created: {
    booking_type: ['discovery', 'tutoring', 'drop_in'],
  },
  faq_item_opened: {
    question_id: [
      'program_eligibility',
      'program_grouping',
      'deposit_refund',
      'program_location',
      'progress_reports',
      'fsa_hsa',
      'one_on_one_support',
      'enrollment_deadline',
      'tutoring_modality',
      'tutoring_missed_session',
      'tutoring_rollover',
      'tutoring_vs_cohort',
      'cse_prep',
      'tutoring_pause',
    ],
  },
}

const SAFE_EVENT_NAMES = new Set([
  ...Object.keys(SAFE_PARAM_VALUES),
  'signup_completed',
])

function sanitizeParams(eventName: string, params?: EventParams): EventParams | undefined {
  if (!params) return undefined

  const allowedValues = SAFE_PARAM_VALUES[eventName]
  if (!allowedValues) return undefined

  const safeParams: EventParams = {}
  for (const [key, value] of Object.entries(params)) {
    const values = allowedValues[key]
    if (values?.includes(String(value))) {
      safeParams[key] = String(value)
    }
  }
  return safeParams
}

function stableKey(value: string, keys: Record<string, string>): string | undefined {
  return keys[value]
}

const PROGRAM_INTEREST_KEYS: Record<string, string> = {
  'Full Academic Intensive': 'full',
  'Reading & Language Intensive': 'reading',
  'Math & Numeracy Intensive': 'math',
  'Not sure yet': 'undecided',
}

const CONTACT_TYPE_KEYS: Record<string, string> = {
  general: 'general',
  'iep-review': 'iep_review',
  'discovery-call': 'discovery_call',
}

const CHECKOUT_KEYS: Record<string, string> = {
  full: 'full',
  reading: 'reading',
  math: 'math',
  'tutoring-drop-in': 'tutoring_drop_in',
  'tutoring-weekly': 'tutoring_weekly',
  'tutoring-twice-weekly': 'tutoring_twice_weekly',
  'tutoring-iep-review': 'tutoring_iep_review',
}

const DISCOVERY_SOURCES: Record<string, string> = {
  how_it_works: 'how_it_works',
  contact_page: 'contact_page',
}

const BOOKING_TYPES: Record<string, string> = {
  discovery: 'discovery',
  tutoring: 'tutoring',
  'drop-in': 'drop_in',
}

const FAQ_QUESTION_KEYS: Record<string, string> = {
  'Does my child need an IEP to enroll?': 'program_eligibility',
  'How do you decide who’s in which group?': 'program_grouping',
  'What’s the deposit and refund policy?': 'deposit_refund',
  'Where exactly is the program?': 'program_location',
  'Can I actually use the progress reports at a CSE meeting?': 'progress_reports',
  'Does this qualify for FSA or HSA?': 'fsa_hsa',
  'What if my child needs one-on-one support?': 'one_on_one_support',
  'When does enrollment close?': 'enrollment_deadline',
  'Do you tutor in person or only via Zoom?': 'tutoring_modality',
  "What happens if my child can't make a session?": 'tutoring_missed_session',
  'Can sessions roll over to next month?': 'tutoring_rollover',
  'How is this different from your summer cohort?': 'tutoring_vs_cohort',
  'Do you handle CSE meeting prep?': 'cse_prep',
  'What if I need to pause my subscription?': 'tutoring_pause',
}

/**
 * Fire a custom analytics event.
 * Safe to call anywhere — gracefully no-ops if gtag isn't loaded.
 */
export function trackEvent(eventName: string, params?: EventParams): void {
  if (typeof window === 'undefined') return
  if (!SAFE_EVENT_NAMES.has(eventName)) return

  // Google Analytics 4 via gtag
  if (typeof window.gtag === 'function') {
    const safeParams = sanitizeParams(eventName, params)
    if (safeParams && Object.keys(safeParams).length > 0) {
      window.gtag('event', eventName, safeParams)
    } else {
      window.gtag('event', eventName)
    }
  }
}

// ─── Typed Conversion Events ───

export function trackEnrollmentSubmit(program: string): void {
  trackEvent('enrollment_form_submit', {
    form_type: 'enrollment_inquiry',
    program_interest: stableKey(program, PROGRAM_INTEREST_KEYS) || 'undecided',
  })
}

export function trackContactSubmit(contactType: string): void {
  trackEvent('contact_form_submit', {
    form_type: 'contact',
    contact_type: stableKey(contactType, CONTACT_TYPE_KEYS) || 'general',
  })
}

export function trackStripeCheckoutClick(program: string): void {
  trackEvent('stripe_checkout_click', {
    program_type: stableKey(program, CHECKOUT_KEYS) || 'full',
  })
}

export function trackDiscoveryCallClick(source: string): void {
  trackEvent('discovery_call_click', {
    click_source: stableKey(source, DISCOVERY_SOURCES) || 'how_it_works',
  })
}

export function trackBookingCreated(bookingType: string): void {
  trackEvent('booking_created', {
    booking_type: stableKey(bookingType, BOOKING_TYPES) || 'discovery',
  })
}

export function trackSignupCompleted(): void {
  trackEvent('signup_completed')
}

export function trackFAQItemOpened(question: string): void {
  const questionId = FAQ_QUESTION_KEYS[question]
  trackEvent('faq_item_opened', questionId ? { question_id: questionId } : undefined)
}

// ─── Global type augmentation for gtag ───

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
    dataLayer?: unknown[]
  }
}
