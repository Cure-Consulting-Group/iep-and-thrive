# IEP & Thrive — Claude Code Build Brief

## Project Overview

**Product:** IEP & Thrive — SPED Summer Intensive Program website
**Brand:** IEP & Thrive (a program of Cure Consulting Group)
**Purpose:** Marketing + enrollment site targeting Long Island/NYC parents of children with IEPs and learning differences
**Goal:** Parents land, trust is built, they book a discovery call or submit an enrollment inquiry with a Stripe deposit
**Timeline:** Live by end of April 2026 (before early enrollment deadline)

---

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS + CSS variables for the design token system
- **Fonts:** Google Fonts — Playfair Display (display/serif) + DM Sans (body/UI)
- **Forms:** React Hook Form + Zod validation
- **Payments:** Stripe Checkout (deposit links for each program tier)
- **Booking:** Calendly embed (discovery call scheduling)
- **Email:** Resend (form submission notifications to program operator)
- **Deployment:** Vercel
- **Analytics:** Vercel Analytics

---

## Design System

### Color Tokens

```css
:root {
  --forest:       #1B4332;   /* Primary — authority, trust */
  --forest-mid:   #2D6A4F;   /* Hover states */
  --forest-light: #40916C;   /* Accents, checkmarks */
  --sage:         #B7E4C7;   /* Light green — card accents, stats */
  --sage-pale:    #D8F3DC;   /* Backgrounds, tags */
  --cream:        #FDFAF4;   /* Page background */
  --cream-deep:   #F5EFE0;   /* Section backgrounds */
  --amber:        #D4860B;   /* Urgency, highlights */
  --amber-light:  #FFF3CD;   /* Amber background tints */
  --warm-gray:    #6B6560;   /* Body text muted */
  --text:         #1C1917;   /* Primary text */
  --text-muted:   #78716C;   /* Secondary text */
  --white:        #FFFFFF;
  --border:       rgba(27,67,50,0.12);
}
```

### Typography

```
Display font:  Playfair Display — headings, hero, quotes, prices, numbers
Body font:     DM Sans — all UI, body copy, labels, buttons

Heading scale:
  h1: clamp(2.4rem, 4vw, 3.4rem) / weight 700 / letter-spacing -0.03em / line-height 1.12
  h2: clamp(1.8rem, 3vw, 2.6rem) / weight 700 / letter-spacing -0.025em / line-height 1.18
  h3: 1.5rem / weight 600
  h4: 1.25rem / weight 700

Body: 15px / line-height 1.6
Body large: 16px / line-height 1.7
Small/label: 12–13px
Micro: 10–11px / font-weight 600 / letter-spacing 0.08–0.1em / text-transform uppercase

Section eyebrow labels: 11px / 600 / 0.1em tracking / uppercase / color var(--forest-light)
```

### Border Radius

```
Pills/tags/buttons: border-radius: 100px
Cards: border-radius: 16px or 20px
Small UI elements: border-radius: 10–12px
```

### Shadows

```
Card hover: box-shadow: 0 8px 32px rgba(27,67,50,0.10)
No decorative shadows elsewhere — clean flat surfaces
```

### Animation

```css
/* Page load — staggered fade-up for hero elements */
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}
/* Delay each hero child: 0.1s, 0.2s, 0.3s, 0.4s, 0.5s */

/* Card hover: transform: translateY(-3px) + shadow */
/* Button hover: background color transition 0.2s */
/* All transitions: 0.2s ease */
```

---

## Site Architecture

```
/                         → Landing page (single long-form page)
/about                    → About the founder (expanded)
/program                  → Program details (expanded)
/enroll                   → Enrollment form + deposit payment
/faq                      → Full FAQ page
/contact                  → Contact + discovery call booking
/success                  → Post-form/post-payment confirmation page
```

All key content also lives on the homepage as sections (anchor links). Sub-pages expand on those sections.

---

## Homepage Section Order

1. Urgency Banner (sticky top, dismissible)
2. Navigation
3. Hero
4. Problem Strip (3-stat dark band)
5. Why IEP & Thrive
6. Program Options (3 cards)
7. How It Works (4 steps)
8. Testimonials
9. About the Founder
10. FAQ (8 items)
11. Enrollment Form + CTA
12. Footer

---

## Section-by-Section Spec

### 1. Urgency Banner

```
Background: var(--amber)
Text color: white
Content: "🌿 Summer 2026 enrollment is open. Reserve your child's spot — cohorts are limited to 6 students. Spots filling fast."
Bold: "Summer 2026 enrollment is open." and "Spots filling fast."
Dismissible: X button on right, stores dismissed state in sessionStorage
Font: 13px DM Sans 500
Padding: 10px 2rem
```

### 2. Navigation

```
Position: sticky top-0 z-50
Background: var(--cream) with backdrop-blur on scroll
Height: 64px
Border-bottom: 1px solid var(--border)
Left: Logo "IEP & Thrive" — Playfair Display 700 19px, "IEP" and "Thrive" in --forest, "&" in --amber
Right links: About / Program / How It Works / FAQ / [Reserve a Spot →] (pill button, --forest bg)
Mobile: hamburger menu, full-screen drawer
Scroll behavior: border-bottom appears on scroll, slight bg opacity increase
```

### 3. Hero

```
Layout: 2-column grid — left (copy) | right (dark panel card)
Min-height: 88vh
Left padding: 5rem left, 4rem right
Right: --forest background (via ::after pseudo or div), 48% width

LEFT COLUMN:
  Eyebrow pill: sage-pale bg, forest text
    "SPED Summer Intensive · Long Island, NY"
    Green dot before text (6px circle, --forest-light)

  H1: "Your child deserves a summer that builds — not breaks."
    "builds" in italic, color --forest-mid

  Subhead (16px, --warm-gray, max-width 460px):
    "An evidence-based small-group intensive for students with IEPs and
    learning differences. Led by a credentialed NYC SPED interventionist
    who has spent years inside the system — and knows exactly what your
    child needs."

  CTA buttons (flex row, gap 12px):
    Primary pill: "Reserve a Spot for Summer 2026" → links to #enroll
    Secondary outline pill: "Learn About the Program" → links to #program

  Trust row (below divider):
    4 overlapping avatar initials (ML, JR, TK, AB) — sage bg, forest text, 32px circles
    Text: "Cohorts limited to 6 students. Early enrollment closes April 30."

RIGHT COLUMN (on --forest bg):
  Semi-transparent card (rgba white 0.08 bg, rgba white 0.15 border, 20px radius)
  Label: "Summer 2026 · 6-Week Intensive" (10px, sage, uppercase)
  H3: "Everything your child's IEP calls for. Finally, a summer program that delivers it."
  2×2 stat grid:
    4–6 / Students per cohort
    4hrs / Daily structured instruction
    6wk / Program duration
    100% / IEP-goal aligned
  Feature list with green circle checkmarks:
    ✓ Structured literacy & Orton-Gillingham framework
    ✓ Weekly progress reports aligned to IEP goals
    ✓ Parent debrief at every Friday pickup
    ✓ Final report you can bring to September CSE meeting
```

### 4. Problem Strip

```
Background: var(--forest)
Color: white
Layout: 3-column grid
Padding: 3rem 5rem

Column 1:
  Number: "2–3×" (Playfair 3rem 700, --sage)
  Title: "Faster regression for IEP students"
  Desc: "Students with learning differences lose skills over summer at 2–3× the rate
         of general education peers. Without structured intervention, September is
         harder than June."

Column 2:
  Number: "$0"
  Title: "Extended school year for most families"
  Desc: "Most districts deny ESY services. Parents are left searching for credentialed
         providers who understand IEPs — not generic tutors who read from a workbook."

Column 3:
  Number: "1 in 5"
  Title: "Students have a learning difference"
  Desc: "Yet credentialed SPED interventionists offering private summer programming
         on Long Island are critically undersupplied. We're here to close that gap."
```

### 5. Why IEP & Thrive

```
Section bg: var(--cream)
Padding: 5rem

Header:
  Eyebrow: "Why IEP & Thrive"
  H2: "Built by someone who knows the system from the inside."

Layout: 2-column
  LEFT — 4 feature items (icon + title + desc):
    📋 "Your child's actual IEP goals — not generic content"
       "Before the program starts, we review your child's IEP and map every session
        to their annual goals. This is what districts charge $85K salaries for —
        now available privately."
    📖 "Evidence-based structured literacy"
       "Orton-Gillingham framework. The same approach that private specialists charge
        $150–175/hr for — embedded in every literacy block, every session."
    📊 "Weekly progress reports you can use in September"
       "Every Friday, you receive a 2-page progress summary with specific skill data.
        At program end, a full report you can hand to your child's new teacher or
        bring to a CSE meeting."
    👥 "Small groups. Maximum impact."
       "Never more than 6 students. Grouped intentionally by learning profile, not
        just grade. Your child isn't lost in a classroom — they're seen, heard, and
        challenged at the right level."

  RIGHT — two stacked cards:
    Card 1 (--cream-deep bg, forest left border 4px, 20px radius):
      Pull quote (Playfair italic 1.3rem):
        "I spent years inside NYC's special education system writing IEPs, attending
         CSE meetings, and fighting for kids who deserved more. This program is what
         I wish had existed for those families."
      Attribution: "— Program Founder, SPED Interventionist, NYC DOE · 8+ years"

    Card 2 (--sage-pale bg, 16px radius):
      Label: "Credentials & Training"
      Checklist (--forest-light ✓):
        NYS Certified Special Education Teacher
        SPED Interventionist, NYC Department of Education
        Orton-Gillingham structured literacy training
        IEP development & CSE meeting experience
        Executive function & SEL intervention training
```

### 6. Program Options

```
Section bg: var(--cream-deep)
Padding: 5rem

Header:
  Eyebrow: "Summer 2026 Programs"
  H2: "Choose the right fit for your child."
  Sub: "All programs are IEP-aligned, small-group, and led by a credentialed SPED
        interventionist. Grouped by learning profile."

3-column card grid:

CARD 1 — Reading & Language Intensive
  Tag: "Literacy Focus"
  H4: "Reading & Language Intensive"
  Desc: "Structured literacy, phonics, decoding, and fluency. Ideal for students with
         dyslexia, phonological processing challenges, or reading delays."
  Price: $3,500 (Playfair 700 1.6rem, --forest)
  Price note: "per student · 6 weeks"
  Includes:
    4 hrs/day, Mon–Thu
    Orton-Gillingham framework
    Weekly progress reports
    Final IEP-aligned report
    Max 6 students
  CTA: "Enroll — $875 Deposit" → Stripe Checkout link

CARD 2 — Full Academic Intensive (FEATURED — forest bg, white text)
  Tag: "Most Popular" (rgba white bg, sage text)
  H4: "Full Academic Intensive"
  Desc: "Literacy + math intervention + executive function + SEL. The complete program,
         designed to prevent summer regression and build for fall success."
  Price: $4,000 (--sage)
  Price note: "per student · 6 weeks"
  Includes:
    4 hrs/day, Mon–Thu
    Literacy + math + SEL blocks
    Executive function coaching
    Weekly parent debrief + reports
    September CSE-ready final report
    Max 6 students
  CTA: "Enroll — $1,000 Deposit" → Stripe Checkout link (white bg, forest text)

CARD 3 — Math & Numeracy Intensive
  Tag: "Math Focus"
  H4: "Math & Numeracy Intensive"
  Desc: "Number sense, numeracy, word problems, and applied math. For students with
         dyscalculia, math anxiety, or IEP goals targeting math fluency."
  Price: $3,500
  Price note: "per student · 6 weeks"
  Includes:
    4 hrs/day, Mon–Thu
    Concrete-representational-abstract method
    Weekly progress reports
    Final IEP-aligned report
    Max 6 students
  CTA: "Enroll — $875 Deposit" → Stripe Checkout link
```

### 7. How It Works

```
Section bg: var(--cream)
Padding: 5rem

Header:
  Eyebrow: "How It Works"
  H2: "From first call to first day — here's the path."

Layout: 2-column
  LEFT — 4 numbered steps:
    01 / "Book a free 20-minute discovery call"
         "We talk through your child's current IEP, their goals, and what hasn't been
          working. No commitment — just a real conversation with someone who understands
          the system."
         Tag: "Free · 20 minutes · Zoom or phone"

    02 / "We review your child's IEP"
         "You share the current IEP. We identify the right cohort placement, confirm
          the program match, and map your child's annual goals to the summer curriculum."
         Tag: "IEP review included with enrollment"

    03 / "Reserve your spot with a deposit"
         "A 25% non-refundable deposit holds your child's place in their cohort.
          Remaining balance due 2 weeks before program start. Secure online payment
          via Stripe."
         Tag: "Stripe secure payment · 25% deposit"

    04 / "Summer — and a stronger September"
         "6 weeks of structured intervention. Weekly progress updates. A final report
          that documents growth against IEP goals — and gives you ammunition heading
          into fall CSE season."
         Tag: "Program runs July 7 – August 14, 2026"

  RIGHT — 2 stacked cards:
    Card 1 (--cream-deep, 20px radius):
      Title: "What's included"
      Checklist:
        Pre-program IEP review & goal mapping
        96 hours of direct instruction (4 hrs × 4 days × 6 wks)
        All curriculum materials & supplies
        6 weekly progress reports (PDF, emailed Fridays)
        Daily parent debrief at pickup
        End-of-program comprehensive report (CSE-ready)
        Home practice guide (15 min/night)

    Card 2 (--forest bg, white text):
      Title: "Questions before enrolling?"
      Desc: "We offer a free 20-minute call to review your child's IEP and discuss
             program fit. No sales pressure — just an honest conversation."
      CTA button: "Book a Free Discovery Call →" → Calendly embed/link
```

### 8. Testimonials

```
Section bg: var(--forest)
Color: white
Padding: 5rem

Header:
  Eyebrow: "Parent Stories" (--sage)
  H2: "What families are saying." (white)
  Sub: "Real results from real families — students who came in behind and left ready
        for September." (rgba white 0.65)

3-column testimonial grid:

Card 1:
  Stars: ★★★★★ (#FFD700)
  Quote (Playfair italic): "After two summers of generic tutoring going nowhere, this
    program finally gave us a path. My son came back to school in September reading
    two levels higher. His teacher couldn't believe the difference."
  Avatar: "ML" (--forest-light bg)
  Name: Michelle L.
  Detail: "Parent of 3rd grader with dyslexia · Merrick, NY"

Card 2:
  Stars: ★★★★★
  Quote: "The weekly progress reports were a game-changer. I walked into our September
    IEP meeting with six weeks of data showing exactly what my daughter had accomplished.
    The school team was impressed."
  Avatar: "JR"
  Name: Jennifer R.
  Detail: "Parent of 2nd grader with ADHD & reading IEP · Wantagh, NY"

Card 3:
  Stars: ★★★★★
  Quote: "What makes this different is that she actually read my son's IEP before day
    one. She knew his goals, his triggers, and his strengths. He came home every day
    saying he had fun — and he learned."
  Avatar: "TK"
  Name: Tamara K.
  Detail: "Parent of 4th grader with autism & math IEP · Bellmore, NY"
```

### 9. About the Founder

```
Section bg: var(--cream)
Padding: 5rem

Header:
  Eyebrow: "About the Founder"
  H2: "A SPED interventionist who built this for the families she couldn't stop thinking about."

Layout: 2-column (image left, content right)
  LEFT:
    Placeholder image block (sage-pale bg, 4:5 aspect ratio, 20px radius)
    Floating badge (forest bg, white text, bottom-right):
      "8+" (Playfair 700 1.4rem, sage) / "Years in NYC SPED"

  RIGHT:
    Body paragraphs:
      "After 8+ years as a Special Education Interventionist with the NYC Department of
       Education, I've sat at more CSE tables than I can count. I've written hundreds of
       IEPs, advocated for students in meetings, and watched families walk away not
       knowing what their children were actually entitled to."

      "I built IEP & Thrive because every summer, I watched the progress we'd made
       during the school year disappear by September. The kids who needed continuity
       the most were getting nothing — or worse, generic tutoring that didn't speak
       their language."

      "This program is what I wish I could have handed every family I worked with.
       Small groups. Real evidence-based methods. Aligned to your child's actual IEP.
       And a final report you can walk into September with."

    Credential list:
      🎓 NYS Certified Special Education Teacher
      🏫 SPED Interventionist, NYC DOE (8+ years)
      📖 Orton-Gillingham Trained Practitioner
      📋 IEP Development & CSE Advocacy Specialist
      🧠 Executive Function & SEL Intervention
```

### 10. FAQ

```
Section bg: var(--cream-deep)
Padding: 5rem

Header:
  Eyebrow: "Common Questions"
  H2: "Everything parents ask before enrolling."

2-column grid of 8 FAQ cards (white bg, 14px border-radius):

Q: Does my child need to have an IEP to enroll?
A: No. Students with active IEPs, 504 Plans, or documented learning differences are
   all welcome. We'll discuss the right fit on your discovery call.

Q: How are cohorts grouped?
A: We group by learning profile and primary intervention need — not just grade level.
   A 3rd and 4th grader with similar reading goals will have a better experience
   together than two 3rd graders with very different needs.

Q: What is the deposit and refund policy?
A: A 25% non-refundable deposit holds your spot. The remaining balance is due 2 weeks
   before program start. If we cancel a session due to an emergency, we credit or
   reschedule.

Q: Where is the program located?
A: We operate out of a dedicated community space on Long Island (Nassau/Suffolk). Exact
   location provided upon enrollment. We are not a home-based program.

Q: Will the progress reports help at my child's IEP meeting?
A: Yes — that's by design. Weekly reports track goal attainment using the same language
   and format districts use. The final report gives you documented summer progress data
   that schools must consider.

Q: Can I use FSA or HSA funds?
A: Educational therapy for a diagnosed learning disability may qualify as a medical
   expense. We recommend confirming with your benefits administrator. We provide
   itemized receipts for all payments.

Q: What if my child needs 1:1 support?
A: Our group program is designed for students who can work in small groups (2–6 peers).
   If your child requires 1:1 instruction, we offer a limited number of individual
   sessions — ask about availability on your discovery call.

Q: When does Summer 2026 enrollment close?
A: Early enrollment closes April 30, 2026. Cohorts typically fill by May. We recommend
   reserving early — once a cohort reaches 6 students, it is closed and families go to
   a waitlist.
```

### 11. Enrollment Section

```
Section bg: var(--forest)
Color: white
Layout: 2-column (left content, right form card)
Padding: 5rem

LEFT:
  Eyebrow: "Enrollment" (--sage)
  H2: "Reserve your child's spot for Summer 2026." (white)
  Sub: "Cohorts fill quickly. Complete the form and we'll reach out within 24 hours to
        confirm fit and send your deposit link." (rgba white 0.65)

  Feature list:
    📅 Program dates: July 7 – August 14, 2026 · Mon–Thu, 9am–1pm
    📍 Long Island, NY · Nassau/Suffolk · Exact location shared upon enrollment
    💳 Secure Stripe payment · 25% deposit to hold spot · Balance due June 23
    📞 Not ready to commit? Book a free discovery call instead — no pressure
    🏢 A program of IEP & Thrive, powered by Cure Consulting Group

RIGHT — White form card (20px radius, --text color):
  Title: "Student Enrollment Inquiry" (Playfair 700 1.3rem)

  Fields:
    Row 1 (2-col): Parent/Guardian Name | Email Address
    Row 2 (2-col): Phone Number | Child's Current Grade (select: K–6th)
    Row 3: Program Interest (select: Full Academic / Reading / Math / Not sure)
    Row 4: Primary Learning Challenge (select: Reading/Dyslexia | Math/Dyscalculia |
            ADHD/Executive Function | Language Processing | Autism Spectrum |
            Multiple areas/not sure)
    Row 5: Anything you'd like us to know? (textarea, optional)

  Submit: "Submit Enrollment Inquiry →" (--forest bg, 100px radius, full width)
  Note: "By submitting, you agree to be contacted about program availability. A 25%
         deposit will be required to confirm enrollment. Spots are not held without
         a deposit."

  On submit:
    POST to /api/enroll
    Send email via Resend to program operator
    Redirect to /success
```

### 12. Footer

```
Background: #111810
Color: rgba(255,255,255,0.6)
Padding: 3rem 5rem

4-column grid:
  Col 1 (2fr): Logo + description
    Logo: "IEP & Thrive" — Playfair, white, "&" in --sage
    Desc: "A specialized SPED summer intensive for students with IEPs and learning
           differences on Long Island, NY. Led by a credentialed NYC interventionist.
           Powered by Cure Consulting Group."

  Col 2: Program
    Full Academic Intensive
    Reading & Language Intensive
    Math & Numeracy Intensive
    IEP Advocacy Services

  Col 3: Enroll
    Reserve a Spot
    Book Discovery Call
    Tuition & Deposits
    FAQ

  Col 4: Contact
    hello@iepandthrive.com
    Long Island, NY
    Privacy Policy
    Terms of Service

Footer bottom bar (#111810, border-top rgba white 0.08):
  Left: © 2026 IEP & Thrive · A Cure Consulting Group program · All rights reserved.
  Right: Serving Nassau & Suffolk County, Long Island, NY
```

---

## API Routes

### POST /api/enroll

```typescript
// Request body
{
  parentName: string
  email: string
  phone: string
  childGrade: string
  programInterest: string
  learningChallenge: string
  notes?: string
}

// Actions:
// 1. Validate with Zod
// 2. Send email via Resend to OPERATOR_EMAIL env var
//    Subject: "New Enrollment Inquiry — [programInterest]"
//    Body: formatted HTML with all fields
// 3. Send confirmation email to parent
// 4. Return 200 { success: true }
```

### POST /api/contact

```typescript
// General contact form (contact page)
{
  name: string
  email: string
  phone?: string
  message: string
  type: 'general' | 'iep-review' | 'discovery-call'
}
```

---

## Stripe Integration

Three products — create in Stripe Dashboard, use price IDs in env:

```
STRIPE_READING_PRICE_ID    → $875 deposit (25% of $3,500)
STRIPE_MATH_PRICE_ID       → $875 deposit (25% of $3,500)
STRIPE_FULL_PRICE_ID       → $1,000 deposit (25% of $4,000)
```

Stripe Checkout flow:
- Success URL: `/success?session_id={CHECKOUT_SESSION_ID}`
- Cancel URL: `/#program`
- Mode: `payment` (not subscription)
- Metadata: `{ program: 'full' | 'reading' | 'math' }`

Enrollment CTA buttons on program cards link to `/api/stripe/checkout?program=full` etc.

---

## Calendly Integration

Embed or link for discovery call CTA buttons.

```
NEXT_PUBLIC_CALENDLY_URL=https://calendly.com/[handle]/discovery-call
```

Use inline embed on `/contact` page. Use link (new tab) on all other CTAs.

---

## Environment Variables

```
# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
STRIPE_READING_PRICE_ID=
STRIPE_MATH_PRICE_ID=
STRIPE_FULL_PRICE_ID=

# Resend (email)
RESEND_API_KEY=
OPERATOR_EMAIL=hello@iepandthrive.com

# Calendly
NEXT_PUBLIC_CALENDLY_URL=

# App
NEXT_PUBLIC_SITE_URL=https://iepandthrive.com
```

---

## File Structure

```
iep-and-thrive/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata
│   ├── page.tsx                # Homepage (all sections assembled)
│   ├── about/page.tsx
│   ├── program/page.tsx
│   ├── enroll/page.tsx
│   ├── faq/page.tsx
│   ├── contact/page.tsx
│   ├── success/page.tsx
│   └── api/
│       ├── enroll/route.ts
│       ├── contact/route.ts
│       └── stripe/
│           └── checkout/route.ts
├── components/
│   ├── layout/
│   │   ├── Nav.tsx
│   │   ├── Footer.tsx
│   │   └── UrgencyBanner.tsx
│   ├── sections/
│   │   ├── Hero.tsx
│   │   ├── ProblemStrip.tsx
│   │   ├── WhySection.tsx
│   │   ├── ProgramCards.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Testimonials.tsx
│   │   ├── AboutFounder.tsx
│   │   ├── FAQ.tsx
│   │   └── EnrollmentForm.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Badge.tsx
│       ├── Card.tsx
│       └── SectionHeader.tsx
├── lib/
│   ├── stripe.ts
│   ├── resend.ts
│   └── validations.ts
├── public/
│   └── og-image.png            # OG image for social sharing
├── styles/
│   └── globals.css             # CSS variables + base styles
├── CLAUDE.md                   # This file
└── STATE.md                    # Build progress tracker
```

---

## SEO & Metadata

```typescript
// app/layout.tsx
export const metadata = {
  title: 'IEP & Thrive | SPED Summer Intensive — Long Island, NY',
  description: 'An evidence-based summer intensive for students with IEPs and learning differences on Long Island. Led by a credentialed NYC SPED interventionist. Small groups, IEP-aligned, 6 weeks.',
  keywords: ['SPED tutor Long Island', 'IEP summer program NYC', 'dyslexia tutoring Nassau County', 'special education summer program LI', 'Orton-Gillingham Long Island'],
  openGraph: {
    title: 'IEP & Thrive — SPED Summer Intensive',
    description: 'Your child deserves a summer that builds — not breaks.',
    url: 'https://iepandthrive.com',
    siteName: 'IEP & Thrive',
    locale: 'en_US',
    type: 'website',
  }
}
```

---

## Mobile Responsive Breakpoints

```
All section grids collapse to single column at md (768px)
Hero: stacks — copy top, dark card bottom (forest bg spans full width)
Problem strip: stacks to 1 column
Program cards: scroll horizontally on mobile OR stack
Nav: hamburger menu at < 768px, full-screen overlay drawer
Footer: 2-col at md, 1-col at sm
Fonts: reduce hero h1 to ~2.2rem on mobile
Padding: reduce section padding from 5rem to 2rem on mobile
```

---

## Accessibility

- All images have alt text
- Color contrast: all text passes WCAG AA
- Focus states on all interactive elements (outline: 2px solid var(--forest-mid))
- Form labels are properly associated with inputs
- Semantic HTML throughout (nav, main, section, article, footer)
- Skip to main content link

---

## Build Checklist (STATE.md tracks progress)

- [ ] Project scaffold (Next.js 14 + Tailwind + fonts)
- [ ] CSS variables + globals.css
- [ ] Nav + UrgencyBanner
- [ ] Hero section
- [ ] ProblemStrip section
- [ ] WhySection
- [ ] ProgramCards + Stripe links
- [ ] HowItWorks
- [ ] Testimonials
- [ ] AboutFounder
- [ ] FAQ
- [ ] EnrollmentForm + API route
- [ ] Footer
- [ ] /enroll page (standalone)
- [ ] /success page
- [ ] /contact page + Calendly embed
- [ ] Stripe checkout API route
- [ ] Resend email integration
- [ ] Mobile responsive pass
- [ ] SEO metadata
- [ ] Vercel deployment
