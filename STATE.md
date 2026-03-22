# IEP & Thrive — Build State

## Status: SPRINT 5 COMPLETE — LAUNCH READY

## Stack
- Next.js 14 (App Router, static export)
- Tailwind CSS v4
- Google Fonts: Playfair Display + DM Sans
- React Hook Form + Zod
- Stripe Checkout
- **Firebase** (Auth, Firestore, Storage, Cloud Functions)
- Firebase Hosting (deployment)
- Google Analytics 4

## Firebase Project
- **Project ID:** `iep-and-thrive`
- **Project Number:** `564060847585`
- **Region:** `us-east4`
- **Web App ID:** `1:564060847585:web:1b8a235db532454f9166a0`
- **Auth:** Email/Password + Google Sign-In
- **Firestore:** `(default)` database
- **Storage:** `iep-and-thrive.firebasestorage.app`
- **Rules:** Deployed — `firestore.rules`, `storage.rules`
- **Indexes:** 8 composite indexes deployed

## Build Progress

### Infrastructure ✅
- [x] Next.js 14 project with Tailwind, TypeScript
- [x] Stripe integration (3 deposit products)
- [x] Firebase project created and configured
- [x] Firebase Auth (Email/Password + Google Sign-In)
- [x] Firestore database with security rules & indexes
- [x] Firebase Storage with security rules
- [x] `lib/firebase.ts` — Client SDK init
- [x] `lib/firebase-admin.ts` — Admin SDK init
- [x] `.env.local` updated with Firebase config

### Website (Marketing) ✅
- [x] Homepage with all sections (Hero, ProblemStrip, WhySection, ProgramCards, HowItWorks, Testimonials, AboutFounder, FAQ, EnrollmentForm)
- [x] About, Program, Enroll, FAQ, Contact, Privacy, Terms pages
- [x] API routes: enroll, contact, stripe checkout
- [x] Mobile responsive
- [x] SEO metadata + JSON-LD structured data
- [x] OG/Twitter card tags on all public pages

### Platform Features ✅
- [x] Auth pages (login/signup)
- [x] Auth context provider
- [x] Route protection (ProtectedRoute component)
- [x] Parent portal (dashboard, bookings, resources, reports, profile, intake)
- [x] Admin dashboard (roster, pipeline, bookings, resources, reports)
- [x] Booking system (slots, calendar, booking page)
- [x] Gmail API integration via Cloud Functions
- [x] Google Calendar sync (Cloud Functions)

### Sprint 5: Business Readiness ✅
- [x] S5-01: Weekly Progress Report — print-to-PDF template
- [x] S5-02: CSE-Ready Final Report — print-to-PDF template
- [x] S5-03: Parent Intake Form — 5-step multi-step form
- [x] S5-04: Program Alignment Summary — print-to-PDF template
- [x] S5-05: Google Calendar Sync — wired into booking lifecycle triggers
- [x] S5-06: Accessibility Audit — ARIA attributes, semantic HTML, form error associations
- [x] S5-07: Analytics & Conversion Tracking — GA4 with 7 conversion events
- [x] S5-08: SEO & Open Graph Polish — JSON-LD, OG/Twitter cards, noindex on legal pages

### Cloud Functions ✅
- [x] `contact` — Contact form handler with Zod validation
- [x] `enroll` — Enrollment handler with dual email (operator + parent)
- [x] `stripeCheckout` — Stripe session creation
- [x] `onBookingCreated` — Confirmation email + Google Calendar event creation
- [x] `onBookingUpdated` — Cancellation email + Google Calendar event deletion
- [x] `sendBookingReminders` — Daily 8am reminder for tomorrow's bookings

## Analytics Events (S5-07)
1. `enrollment_form_submit` — enrollment inquiry submitted
2. `contact_form_submit` — contact form submitted
3. `stripe_checkout_click` — deposit button clicked (per program)
4. `discovery_call_click` — discovery call CTA clicked (per source)
5. `booking_created` — booking confirmed (tracked in Cloud Functions)
6. `signup_completed` — new account created
7. `faq_item_opened` — FAQ question expanded

## Collections (Firestore)
- `users/` — Parent accounts + `students/` subcollection
- `availableSlots/` — Bookable time slots
- `bookings/` — Confirmed bookings (+ `calendarEventId` for calendar sync)
- `resources/` — Downloadable files
- `progressReports/` — Weekly + final reports
- `emailLog/` — Email audit trail

## Stripe Products (Cure Consulting Group account)

| Program | Product ID | Deposit (25%) | Balance (75%) |
|---------|-----------|---------------|---------------|
| Full Academic Intensive | `prod_UCFQEk9pvdLCW8` | `price_1TDqvVKF7ECoyb7Hv0WriPJe` ($1,000) | `price_1TDqvYKF7ECoyb7HCHXKbETh` ($3,000) |
| Reading & Language | `prod_UCFQiFs6Xn2tuk` | `price_1TDqvbKF7ECoyb7HgW9cgyXm` ($875) | `price_1TDqveKF7ECoyb7HqXEoH2NT` ($2,625) |
| Math & Numeracy | `prod_UCFQNWlgjgf0hx` | `price_1TDqvhKF7ECoyb7H9Z0k7ki2` ($875) | `price_1TDqvjKF7ECoyb7HrTThi13F` ($2,625) |

Checkout endpoint supports `?type=deposit` (default) and `?type=balance`.

## Environment Variables

```
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_FULL_DEPOSIT_PRICE_ID=price_1TDqvVKF7ECoyb7Hv0WriPJe
STRIPE_FULL_BALANCE_PRICE_ID=price_1TDqvYKF7ECoyb7HCHXKbETh
STRIPE_READING_DEPOSIT_PRICE_ID=price_1TDqvbKF7ECoyb7HgW9cgyXm
STRIPE_READING_BALANCE_PRICE_ID=price_1TDqveKF7ECoyb7HqXEoH2NT
STRIPE_MATH_DEPOSIT_PRICE_ID=price_1TDqvhKF7ECoyb7H9Z0k7ki2
STRIPE_MATH_BALANCE_PRICE_ID=price_1TDqvjKF7ECoyb7HrTThi13F

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBI4iQ3G265Yawhbg_lUXQTggJBpYPueww
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=iep-and-thrive.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=iep-and-thrive
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=iep-and-thrive.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=564060847585
NEXT_PUBLIC_FIREBASE_APP_ID=1:564060847585:web:1b8a235db532454f9166a0

# Google Calendar (Cloud Functions)
GOOGLE_SERVICE_ACCOUNT_KEY=
GOOGLE_CALENDAR_ID=

# Google Analytics
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# Email
OPERATOR_EMAIL=hello@iepandthrive.com

# App
NEXT_PUBLIC_SITE_URL=https://iepandthrive.com
```

## Key Decisions
- Brand: IEP & Thrive (under Cure Consulting Group)
- Domain: iepandthrive.com
- Stripe: payment mode (deposit only)
- Auth: Firebase (Email/Password + Google)
- Email: Gmail API via Cloud Functions (replacing Resend)
- Booking: Internal system (replacing Calendly)
- Data: Firestore with role-based security rules
- Storage: Firebase Storage for IEPs, resources, reports
- Reports: Print-to-PDF approach (`@media print` styles)
- Analytics: Google Analytics 4 via gtag.js
