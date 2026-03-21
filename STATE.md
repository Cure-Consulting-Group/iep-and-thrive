# IEP & Thrive — Build State

## Status: BUILT — READY FOR REVIEW

## Stack Confirmed
- Next.js 14 (App Router)
- Tailwind CSS
- Google Fonts: Playfair Display + DM Sans
- React Hook Form + Zod
- Stripe Checkout
- Resend (email)
- Vercel deployment

## Build Progress

### Infrastructure
- [x] `npx create-next-app@latest iep-and-thrive --typescript --tailwind --app`
- [x] Install deps: `npm i react-hook-form zod @hookform/resolvers stripe resend`
- [x] Configure `tailwind.config.ts` with custom colors, font families
- [x] `styles/globals.css` — CSS variables, base resets, font imports
- [x] `app/layout.tsx` — root layout, metadata, font classes, Nav/Footer/UrgencyBanner

### Components — Layout
- [x] `components/layout/UrgencyBanner.tsx`
- [x] `components/layout/Nav.tsx` (sticky, mobile hamburger)
- [x] `components/layout/Footer.tsx`

### Components — Sections (homepage order)
- [x] `components/sections/Hero.tsx`
- [x] `components/sections/ProblemStrip.tsx`
- [x] `components/sections/WhySection.tsx`
- [x] `components/sections/ProgramCards.tsx`
- [x] `components/sections/HowItWorks.tsx`
- [x] `components/sections/Testimonials.tsx`
- [x] `components/sections/AboutFounder.tsx`
- [x] `components/sections/FAQ.tsx`
- [x] `components/sections/EnrollmentForm.tsx`

### Components — UI
- [x] `components/ui/Button.tsx`
- [x] `components/ui/Badge.tsx`
- [x] `components/ui/SectionHeader.tsx`

### Pages
- [x] `app/page.tsx` (homepage — assembles all sections)
- [x] `app/about/page.tsx` (expanded with philosophy + CTA)
- [x] `app/program/page.tsx`
- [x] `app/enroll/page.tsx` (expanded with intro + trust strip)
- [x] `app/faq/page.tsx` (expanded with intro + CTA)
- [x] `app/contact/page.tsx` (with layout.tsx for metadata)
- [x] `app/success/page.tsx`
- [x] `app/privacy/page.tsx`
- [x] `app/terms/page.tsx`

### API Routes
- [x] `app/api/enroll/route.ts` (form submission → Resend email, XSS-safe)
- [x] `app/api/contact/route.ts` (XSS-safe, error feedback)
- [x] `app/api/stripe/checkout/route.ts`

### Integrations
- [x] Stripe products configured (3 deposit products)
- [ ] Resend domain + API key (needs production config)
- [ ] Calendly URL configured (needs production config)
- [x] `.env.local` template created

### Security Hardening
- [x] `lib/escapeHtml.ts` — HTML-escape utility for email templates
- [x] XSS fix applied to `/api/enroll` and `/api/contact`

### Final Pass
- [x] Mobile responsive (all breakpoints)
- [x] SEO metadata on all pages (including contact via layout.tsx)
- [x] OG image generated and wired (`/public/og-image.png`)
- [ ] Accessibility audit (pending)
- [ ] Vercel deploy + domain (pending)

## Environment Variables Needed

```
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_READING_PRICE_ID=
STRIPE_MATH_PRICE_ID=
STRIPE_FULL_PRICE_ID=
RESEND_API_KEY=
OPERATOR_EMAIL=hello@iepandthrive.com
NEXT_PUBLIC_CALENDLY_URL=
NEXT_PUBLIC_SITE_URL=https://iepandthrive.com
```

## Key Decisions
- Brand: IEP & Thrive (program brand under Cure Consulting Group)
- Domain: iepandthrive.com (confirm availability)
- Stripe mode: payment (not subscription) — deposit only
- Form submission: Resend email to operator → redirect to /success
- No auth required — public marketing + enrollment site
- Testimonials are placeholder — replace with real parent quotes before launch
