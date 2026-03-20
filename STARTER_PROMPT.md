# Claude Code — IEP & Thrive Starter Prompt

Paste this exactly into Claude Code to kick off the build.

---

## PROMPT TO PASTE:

```
Read CLAUDE.md and STATE.md in full before writing any code.

Build the IEP & Thrive website exactly as specified. This is a Next.js 14 (App Router) + Tailwind CSS project. Follow the design system, color tokens, typography scale, and all section copy precisely as documented.

Start with:
1. Project scaffold — `npx create-next-app@latest . --typescript --tailwind --app --no-git`
2. Install all dependencies listed in CLAUDE.md
3. Set up globals.css with all CSS variables and font imports
4. Configure tailwind.config.ts with the full color palette and font families
5. Build Nav + UrgencyBanner first (these appear on every page)
6. Then build each homepage section in order: Hero → ProblemStrip → WhySection → ProgramCards → HowItWorks → Testimonials → AboutFounder → FAQ → EnrollmentForm
7. Assemble homepage in app/page.tsx
8. Build API routes: /api/enroll and /api/stripe/checkout
9. Build sub-pages: /enroll, /success, /contact, /faq
10. Final mobile responsive pass

Update STATE.md checkboxes as each component is completed.

Design requirements:
- Cream (#FDFAF4) page background — NOT white
- Hero MUST have the split layout: cream left column, forest (#1B4332) right column
- Playfair Display for ALL headings, prices, pull quotes, large numbers
- DM Sans for all body copy, labels, buttons, UI
- No generic shadows — only the card hover shadow specified
- All section eyebrow labels: 11px / 600 weight / 0.1em tracking / uppercase / --forest-light color
- Enrollment form submits to /api/enroll, sends email via Resend, redirects to /success
- Program card CTA buttons hit /api/stripe/checkout?program=[reading|math|full]

Keep all copy exactly as written in CLAUDE.md. Do not rephrase, shorten, or summarize any text content.
```
