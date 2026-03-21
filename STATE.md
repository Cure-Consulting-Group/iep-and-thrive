# IEP & Thrive — Build State

## Status: PLATFORM BUILD IN PROGRESS

## Stack
- Next.js 14 (App Router)
- Tailwind CSS
- Google Fonts: Playfair Display + DM Sans
- React Hook Form + Zod
- Stripe Checkout
- **Firebase** (Auth, Firestore, Storage)
- Vercel deployment

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
- [x] Homepage with all sections
- [x] About, Program, Enroll, FAQ, Contact, Privacy, Terms pages
- [x] API routes: enroll, contact, stripe checkout
- [x] Mobile responsive, SEO metadata

### Platform Features (In Progress)
- [ ] Auth pages (login/signup)
- [ ] Auth context provider
- [ ] Route protection
- [ ] Parent portal (dashboard, bookings, resources, reports)
- [ ] Admin dashboard (roster, pipeline, bookings, resources)
- [ ] Booking system (slots, calendar, booking page)
- [ ] Gmail API integration (replace Resend)
- [ ] Google Calendar sync

## Collections (Firestore)
- `users/` — Parent accounts + `students/` subcollection
- `availableSlots/` — Bookable time slots
- `bookings/` — Confirmed bookings
- `resources/` — Downloadable files
- `progressReports/` — Weekly + final reports
- `emailLog/` — Email audit trail

## Environment Variables

```
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_READING_PRICE_ID=
STRIPE_MATH_PRICE_ID=
STRIPE_FULL_PRICE_ID=

# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyBI4iQ3G265Yawhbg_lUXQTggJBpYPueww
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=iep-and-thrive.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=iep-and-thrive
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=iep-and-thrive.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=564060847585
NEXT_PUBLIC_FIREBASE_APP_ID=1:564060847585:web:1b8a235db532454f9166a0

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
