# Sprint 5: Business Readiness — IEP & Thrive

**Generated:** March 22, 2026
**Focus:** Templates, intake workflows, calendar activation, accessibility, analytics
**Dependency:** Builds on Sprint 3 (portal/admin) and Sprint 4 (Cloud Functions)

---

## Dependency Graph

```
EPIC-9 (Progress Report Templates)
  ├── S5-01: Weekly Progress Report PDF Template
  └── S5-02: CSE-Ready Final Report PDF Template

EPIC-10 (Pre-Program Intake)
  ├── S5-03: Parent Intake Form (Admin-Facing)
  └── S5-04: Program Alignment Summary Template

EPIC-11 (Calendar & Scheduling)
  └── S5-05: Google Calendar Sync Activation

EPIC-12 (Launch Hardening)
  ├── S5-06: Accessibility Audit & Fixes
  ├── S5-07: Analytics & Conversion Tracking
  └── S5-08: SEO & Open Graph Polish
```

---

## EPIC-9: Progress Report Templates

**Goal:** Provide downloadable, branded PDF templates that admin can fill and upload via the existing `/admin/reports` system. Parents view them in `/portal/reports`.

---

### S5-01: Weekly Progress Report — Printable Template Page

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-9 (Progress Report Templates) |
| **Priority** | P0 |
| **Estimate** | 3 points |
| **Page** | `/admin/reports/template/weekly` (new) |
| **Current State** | Admin can upload PDFs via `/admin/reports` but no template exists to generate them |

**Description:**
Create a print-optimized, branded weekly progress report page that admin can fill out on-screen and print to PDF (or use browser Print → Save as PDF). Follows the existing design system (Playfair Display headings, DM Sans body, forest/sage/cream palette). The page uses `@media print` styles for clean PDF output.

**Report Fields (from operations manual):**
- Student name, program track, week number (1–6), date range
- IEP goals targeted this week (multi-line, up to 4 goals)
- Per-goal: skill area, target, current accuracy %, trend (improving/stable/emerging)
- Instructional strategies used (checklist: OG phonics, guided reading, CRA math, EF coaching, SEL, other)
- Engagement & behavior notes (textarea)
- Home practice recommendations (textarea)
- Instructor signature line, date

**Design Criteria:**
- Page background: white (for print)
- Header bar: forest green (#1B4332) with white IEP & Thrive logo, week badge
- Section dividers: 1px sage (#B7E4C7) borders
- Goal progress table: alternating cream (#FDFAF4) / white rows
- Accuracy badges: ≥80% forest-light, 60–79% amber, <60% red-500
- Typography: Playfair Display for report title + student name, DM Sans for all body/fields
- Footer: "IEP & Thrive · Summer 2026 · Confidential" in text-muted, 11px
- Print layout: single page (A4/Letter), no margins wasted, no nav/footer from site
- Responsive: readable on screen at desktop width, optimized for print

**Acceptance Criteria:**
- [ ] Route `/admin/reports/template/weekly` renders a fillable report form
- [ ] All fields from spec are present and editable on-screen
- [ ] `@media print` hides site nav, footer, sidebar — shows only report
- [ ] Browser Print → PDF produces a clean, branded single-page document
- [ ] Accuracy % fields auto-color based on value (forest/amber/red)
- [ ] Goal progress table supports 1–4 IEP goals with add/remove
- [ ] Pre-fills student name and week if accessed via query params (`?student=Name&week=3`)
- [ ] "Print Report" button triggers `window.print()`
- [ ] Page is accessible from `/admin/reports` via a "Generate Template" button
- [ ] Protected behind admin auth

---

### S5-02: CSE-Ready Final Report — Printable Template Page

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-9 (Progress Report Templates) |
| **Priority** | P0 |
| **Estimate** | 5 points |
| **Page** | `/admin/reports/template/final` (new) |
| **Current State** | No final report template exists |

**Description:**
Create a multi-section, print-optimized final comprehensive report designed for parents to bring to their September CSE meeting. This is the flagship deliverable — it must look professional and match district report formatting conventions. Uses the same print-to-PDF approach as the weekly template.

**Report Sections (from parent handbook):**
1. **Cover Page:** Student name, program dates, program track, instructor name, IEP & Thrive branding
2. **Program Summary:** Attendance (days present/total), total instructional hours, cohort size
3. **IEP Goal Progress:** Per-goal table — goal text, baseline accuracy, final accuracy, growth %, trend, narrative
4. **Pre/Post Assessment Summary:** Assessment tool used, pre-score, post-score, standard score equivalent (if applicable)
5. **Skills Inventory:** Checklist-style grid — skill area, mastered / progressing / emerging / not targeted
6. **Instructional Methods Used:** Narrative of frameworks applied (OG, CRA, EF coaching, SEL)
7. **Behavioral & Engagement Summary:** Narrative — participation, self-regulation, peer interaction
8. **Home Practice Recommendations:** Continued summer/fall activities for parents
9. **Recommended IEP Goal Language:** Suggested goal text for September CSE — this is the high-value section
10. **Instructor Signature & Credentials:** Name, certifications, signature line, date

**Design Criteria:**
- Multi-page layout (target: 3–4 printed pages)
- Cover page: forest green full-width header, large student name in Playfair Display, program dates, IEP & Thrive logo
- Section headers: Playfair Display 16px bold, forest color, sage underline
- Data tables: clean borders, alternating row colors (cream/white)
- Growth indicators: ↑ green (improved), → amber (stable), ↓ red (declined)
- Skills inventory: grid with colored dots (forest = mastered, sage = progressing, amber = emerging, gray = not targeted)
- Signature block: gray dashed border, formal layout
- Footer on every page: "Page X · IEP & Thrive · Confidential · Summer 2026"
- Print: each major section starts on new page via `page-break-before`
- Typography consistent with design system

**Acceptance Criteria:**
- [ ] Route `/admin/reports/template/final` renders full multi-section report
- [ ] All 10 sections from spec present and editable
- [ ] Cover page is visually distinct with full branding
- [ ] IEP goal progress table supports 1–6 goals with baseline and final data
- [ ] Skills inventory renders as a visual grid, not just text
- [ ] Growth direction indicators use color + arrow symbols
- [ ] Pre/post assessment fields accommodate multiple assessments
- [ ] Recommended IEP goal language section has rich text formatting
- [ ] `@media print` produces 3–4 clean pages with proper page breaks
- [ ] Pre-fills student info if accessed via query params
- [ ] "Print Report" button triggers `window.print()`
- [ ] Protected behind admin auth
- [ ] Accessible from `/admin/reports` via "Generate Final Report" button

---

## EPIC-10: Pre-Program Intake

**Goal:** Structured intake workflow for collecting detailed student information before the program starts (beyond the initial enrollment inquiry).

---

### S5-03: Parent Intake Form — Pre-Program Questionnaire

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-10 (Pre-Program Intake) |
| **Priority** | P1 |
| **Estimate** | 5 points |
| **Page** | `/portal/intake` (new) |
| **Current State** | Enrollment inquiry collects basic info; detailed intake does not exist |

**Description:**
Create a multi-step intake form that enrolled parents complete before the program starts. This collects the detailed information needed for IEP goal mapping, cohort assignment, and program planning. The form saves to Firestore under the student document and is viewable by admin in the student detail view.

**Form Steps:**

**Step 1 — Student Information**
- Student full legal name
- Preferred name / nickname
- Date of birth
- Current grade (K–6)
- School district
- Current school name
- Primary diagnosis / classification (select: Learning Disability, Autism, ADHD, Speech/Language, Emotional Disability, Multiple Disabilities, Other)
- Additional diagnoses (multi-select or freeform)

**Step 2 — IEP & Services**
- Does your child currently have an IEP? (yes/no)
- IEP document upload (PDF, max 10MB) — uses existing Storage upload
- Current classification on IEP
- Related services currently receiving (checkboxes: Speech, OT, PT, Counseling, ABA, None)
- Has your child received ESY services? (yes/no/applied but denied)
- Current reading level (if known)
- Current math level (if known)

**Step 3 — Learning Profile**
- Primary areas of concern (multi-select: Reading/Decoding, Reading Comprehension, Written Expression, Math Computation, Math Reasoning, Executive Function, Attention/Focus, Social Skills, Behavior, Other)
- What has worked well for your child in the past? (textarea)
- What has NOT worked? (textarea)
- Sensory considerations (textarea: noise sensitivity, seating preferences, etc.)
- Behavioral triggers or de-escalation strategies (textarea)

**Step 4 — Medical & Safety**
- Allergies (textarea)
- Medications administered during program hours (textarea)
- Medical conditions staff should be aware of (textarea)
- Emergency contact 1: name, relationship, phone
- Emergency contact 2: name, relationship, phone
- Authorized pickup persons (comma-separated names)
- Photo/video release consent (yes/no)

**Step 5 — Review & Submit**
- Summary of all entered information
- Checkbox: "I confirm this information is accurate"
- Checkbox: "I consent to IEP & Thrive reviewing my child's IEP for program planning"
- Submit button

**Design Criteria:**
- Step indicator at top: numbered circles connected by line, active step in forest, completed in sage, upcoming in cream-deep
- Card-based sections within each step: white bg, 20px radius, subtle border
- Form inputs: match existing enrollment form style (rounded-xl, border-border, cream bg on focus)
- Multi-select fields: pill-style toggles (sage-pale bg when selected, forest text)
- File upload: reuse existing IEP upload pattern from `/portal/profile`
- Navigation: "Back" (outline) and "Continue" (forest pill) buttons at bottom
- Progress saved to Firestore on each step advance (not just on final submit)
- Mobile: single column, full-width inputs, touch-friendly pill selects
- Color palette: cream page bg, white form cards, forest CTAs, sage accents

**Acceptance Criteria:**
- [ ] Route `/portal/intake` renders multi-step form
- [ ] 5 steps with progress indicator
- [ ] All fields from spec present with proper validation
- [ ] IEP upload uses Firebase Storage with progress bar
- [ ] Multi-select fields render as toggleable pills
- [ ] Data saves to `users/{uid}/students/{studentId}/intake` in Firestore
- [ ] Progress persists — returning to page restores saved data
- [ ] Review step shows all entered data in read-only format
- [ ] Submission sets `intakeCompleted: true` on student document
- [ ] Admin can view intake data in `/admin/students` detail panel
- [ ] Form is protected behind parent auth
- [ ] CTA banner shown on `/portal` dashboard when intake is incomplete
- [ ] Mobile responsive — all steps work on 375px viewport

---

### S5-04: Program Alignment Summary — Printable Template

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-10 (Pre-Program Intake) |
| **Priority** | P2 |
| **Estimate** | 2 points |
| **Page** | `/admin/reports/template/alignment` (new) |
| **Current State** | Does not exist |

**Description:**
One-page printable document showing how the student's IEP goals map to the summer program curriculum. Sent to families before program start (per parent handbook). Admin fills this out after reviewing the IEP.

**Fields:**
- Student name, program track, cohort, start date
- IEP goal table: goal number, goal text, program block(s) where addressed, methods/frameworks to be used
- Additional focus areas identified
- Instructor notes

**Design Criteria:**
- Single page print layout
- Forest header bar with student name
- Clean table with sage-pale alternating rows
- Same print-to-PDF approach as weekly report template

**Acceptance Criteria:**
- [ ] Route `/admin/reports/template/alignment` renders fillable form
- [ ] IEP goal mapping table supports 1–6 goals
- [ ] Print-optimized with `@media print`
- [ ] Accessible from admin reports page
- [ ] Protected behind admin auth

---

## EPIC-11: Calendar & Scheduling

---

### S5-05: Google Calendar Sync — Full Implementation

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-11 (Calendar & Scheduling) |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Current State** | Scaffold in `lib/google-calendar.ts` — functions return stubs |

**Description:**
Complete the Google Calendar API integration. When a booking is confirmed, create a calendar event on the operator's Google Calendar. When cancelled, remove it. Store the `calendarEventId` on the booking document for reference.

**Implementation:**
- Use Google Calendar API v3 with service account (or OAuth2 stored in Firebase env)
- Calendar event includes: title ("[Type] — Student Name"), time block, parent email as attendee, notes field, location (program address)
- Update `functions/src/booking-emails.ts` `onBookingCreated` to also create calendar event
- Update `onBookingUpdated` cancellation handler to delete calendar event

**Design Criteria:** N/A (backend only)

**Acceptance Criteria:**
- [ ] `lib/google-calendar.ts` fully implements `createCalendarEvent`, `deleteCalendarEvent`
- [ ] Uses Google Calendar API v3 with proper auth
- [ ] Calendar event created when booking status = confirmed
- [ ] Calendar event deleted when booking status = cancelled
- [ ] `calendarEventId` stored in booking Firestore document
- [ ] Event title format: "[Discovery Call] — Student Name (Parent Name)"
- [ ] Event includes parent email as attendee
- [ ] Graceful fallback if Calendar API credentials not configured (log warning, continue)
- [ ] Works in Cloud Functions environment

---

## EPIC-12: Launch Hardening

---

### S5-06: Accessibility Audit & Fixes

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-12 (Launch Hardening) |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Scope** | All public-facing pages + portal pages |
| **Target** | Lighthouse Accessibility ≥ 90 on all routes |

**Description:**
Comprehensive accessibility pass across all pages. Fix HTML semantics, ARIA attributes, color contrast, keyboard navigation, screen reader compatibility, and focus management.

**Audit Checklist:**
- [ ] All `<img>` tags have descriptive `alt` text (including placeholder images)
- [ ] All form inputs have associated `<label>` elements
- [ ] All interactive elements have focus-visible styles (already in globals.css — verify)
- [ ] Color contrast meets WCAG AA (4.5:1 for text, 3:1 for large text)
- [ ] Skip-to-content link works on all pages (already in layout — verify)
- [ ] Heading hierarchy: no skipped levels (h1 → h2 → h3, never h1 → h3)
- [ ] ARIA roles on nav, main, aside, footer landmarks
- [ ] Mobile hamburger menu: `aria-expanded`, `aria-controls`, focus trap
- [ ] FAQ accordion: `aria-expanded` on toggle buttons (already present — verify)
- [ ] Modal/drawer interactions: proper focus management on open/close
- [ ] Tables have `<th>` with `scope` attributes where needed
- [ ] Portal sidebar: `aria-current="page"` on active link
- [ ] Booking date picker: keyboard navigable, ARIA labels on date buttons
- [ ] Form error messages linked via `aria-describedby`
- [ ] Urgency banner dismiss: screen reader announcement on dismiss

**Design Criteria:**
- Focus ring: 2px solid forest-mid, 2px offset (per existing globals.css spec)
- No visual changes to the design — only semantic/ARIA improvements
- Any contrast fixes must stay within the existing color palette

**Acceptance Criteria:**
- [ ] Lighthouse Accessibility ≥ 90 on `/`, `/about`, `/program`, `/faq`, `/enroll`, `/contact`
- [ ] All form fields have proper labels and error associations
- [ ] Full keyboard navigation works end-to-end (tab through all interactive elements)
- [ ] Screen reader announces page changes on navigation
- [ ] No heading level skips on any page
- [ ] All ARIA attributes pass axe-core validation

---

### S5-07: Analytics & Conversion Tracking

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-12 (Launch Hardening) |
| **Priority** | P2 |
| **Estimate** | 2 points |
| **Scope** | All pages |

**Description:**
Add Vercel Analytics (or Google Analytics 4) for basic traffic tracking, plus custom event tracking for key conversion points. No visual changes.

**Events to Track:**
- `enrollment_form_submit` — when enrollment inquiry is submitted
- `contact_form_submit` — when contact form is submitted
- `stripe_checkout_click` — when a deposit button is clicked (per program)
- `discovery_call_click` — when "Book a Discovery Call" CTA is clicked
- `booking_created` — when a booking is confirmed
- `signup_completed` — when a new account is created
- `faq_item_opened` — when a FAQ question is expanded

**Design Criteria:** N/A (no visual changes)

**Acceptance Criteria:**
- [ ] Analytics script loads on all pages
- [ ] All 7 conversion events fire correctly
- [ ] Events include relevant metadata (program type, form type, etc.)
- [ ] No impact on page load performance (async loading)
- [ ] Tracking respects user privacy — no PII in event data
- [ ] Works with static export (Firebase Hosting)

---

### S5-08: SEO & Open Graph Polish

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-12 (Launch Hardening) |
| **Priority** | P2 |
| **Estimate** | 2 points |
| **Scope** | All public pages |

**Description:**
Ensure every public page has proper metadata, Open Graph tags, and structured data for search engines and social sharing. Verify the existing OG image works. Add JSON-LD structured data for the business.

**Per-Page Metadata:**
- `/` — primary keywords, full OG tags, canonical URL
- `/about` — founder-focused description, OG tags
- `/program` — program details description, OG tags
- `/enroll` — enrollment CTA description, OG tags
- `/faq` — FAQ-focused description, FAQPage structured data (JSON-LD)
- `/contact` — contact description, OG tags
- `/privacy`, `/terms` — basic metadata, noindex

**Structured Data (JSON-LD):**
- `EducationalOrganization` on homepage
- `FAQPage` on `/faq`
- `LocalBusiness` on `/contact`

**Design Criteria:**
- OG image: existing `/public/og-image.png` — verify it renders correctly on Facebook/Twitter/LinkedIn
- If OG image needs refresh: forest green background, "IEP & Thrive" in Playfair Display, tagline, 1200×630px

**Acceptance Criteria:**
- [ ] Every public page has unique `<title>` and `<meta name="description">`
- [ ] Every public page has `og:title`, `og:description`, `og:image`, `og:url`
- [ ] Twitter card meta tags present (`twitter:card`, `twitter:title`, etc.)
- [ ] JSON-LD `EducationalOrganization` on homepage
- [ ] JSON-LD `FAQPage` on `/faq` with all 8 Q&A pairs
- [ ] JSON-LD `LocalBusiness` on `/contact`
- [ ] Canonical URLs set on all pages
- [ ] `/privacy` and `/terms` have `noindex` meta
- [ ] OG image returns 200 and renders at 1200×630

---

## Summary

| Ticket | EPIC | Priority | Points | Focus |
|--------|------|----------|--------|-------|
| S5-01 | EPIC-9 | P0 | 3 | Weekly progress report template |
| S5-02 | EPIC-9 | P0 | 5 | CSE-ready final report template |
| S5-03 | EPIC-10 | P1 | 5 | Parent intake form (multi-step) |
| S5-04 | EPIC-10 | P2 | 2 | Program alignment summary template |
| S5-05 | EPIC-11 | P1 | 3 | Google Calendar sync activation |
| S5-06 | EPIC-12 | P1 | 3 | Accessibility audit & fixes |
| S5-07 | EPIC-12 | P2 | 2 | Analytics & conversion tracking |
| S5-08 | EPIC-12 | P2 | 2 | SEO & Open Graph polish |
| **Total** | | | **25 pts** | |

### Priority Sequencing

```
P0 (blocking — needed for program delivery):
  S5-01 (Weekly Report Template)
  S5-02 (Final Report Template)

P1 (needed before enrollment opens):
  S5-03 (Parent Intake Form)
  S5-05 (Google Calendar Sync)
  S5-06 (Accessibility Fixes)

P2 (needed before marketing launch):
  S5-04 (Program Alignment Summary)
  S5-07 (Analytics)
  S5-08 (SEO/OG)
```
