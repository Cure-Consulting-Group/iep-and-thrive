# IEP & Thrive — Build State

## Status: READY TO BUILD

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
- [ ] `npx create-next-app@latest iep-and-thrive --typescript --tailwind --app`
- [ ] Install deps: `npm i react-hook-form zod @hookform/resolvers stripe resend`
- [ ] Configure `tailwind.config.ts` with custom colors, font families
- [ ] `styles/globals.css` — CSS variables, base resets, font imports
- [ ] `app/layout.tsx` — root layout, metadata, font classes

### Components — Layout
- [ ] `components/layout/UrgencyBanner.tsx`
- [ ] `components/layout/Nav.tsx` (sticky, mobile hamburger)
- [ ] `components/layout/Footer.tsx`

### Components — Sections (homepage order)
- [ ] `components/sections/Hero.tsx`
- [ ] `components/sections/ProblemStrip.tsx`
- [ ] `components/sections/WhySection.tsx`
- [ ] `components/sections/ProgramCards.tsx`
- [ ] `components/sections/HowItWorks.tsx`
- [ ] `components/sections/Testimonials.tsx`
- [ ] `components/sections/AboutFounder.tsx`
- [ ] `components/sections/FAQ.tsx`
- [ ] `components/sections/EnrollmentForm.tsx`

### Components — UI
- [ ] `components/ui/Button.tsx`
- [ ] `components/ui/Badge.tsx`
- [ ] `components/ui/SectionHeader.tsx`

### Pages
- [ ] `app/page.tsx` (homepage — assembles all sections)
- [ ] `app/about/page.tsx`
- [ ] `app/program/page.tsx`
- [ ] `app/enroll/page.tsx`
- [ ] `app/faq/page.tsx`
- [ ] `app/contact/page.tsx`
- [ ] `app/success/page.tsx`

### API Routes
- [ ] `app/api/enroll/route.ts` (form submission → Resend email)
- [ ] `app/api/contact/route.ts`
- [ ] `app/api/stripe/checkout/route.ts`

### Integrations
- [ ] Stripe products configured (3 deposit products)
- [ ] Resend domain + API key
- [ ] Calendly URL configured
- [ ] `.env.local` template created

### Final Pass
- [ ] Mobile responsive (all breakpoints)
- [ ] SEO metadata on all pages
- [ ] Accessibility audit
- [ ] Vercel deploy + domain

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

## Notes for Claude Code
- Read CLAUDE.md fully before starting — all design tokens, copy, and section specs are there
- Do NOT deviate from the color system — parents are the audience, warm trust is the goal
- Playfair Display is load-critical — ensure it's in the <head> before any paint
- Hero split layout (cream left / forest right) is the signature element — get this right first
- Mobile: the forest bg on hero right should span full width on mobile with the card below
- All CTA buttons that go to Stripe should use the API route, not hardcoded Stripe links
- EnrollmentForm validation: all fields required except 'notes'
- Keep copy exactly as written in CLAUDE.md — do not rephrase or shorten
