# Remaining Page Build-Out Tickets — IEP & Thrive

**Generated:** March 21, 2026
**Context:** Post-deployment audit of all 23 routes on [iep-and-thrive.web.app](https://iep-and-thrive.web.app)

---

## Route Status Matrix

| Route | Status | EPIC | Notes |
|-------|--------|------|-------|
| `/` (Homepage) | ✅ Complete | — | Hero, stats, CTA, testimonial |
| `/about` | ✅ Complete | — | Full founder story page |
| `/program` | ✅ Complete | — | ProgramCards + HowItWorks |
| `/contact` | ✅ Complete | — | Full form (needs Cloud Function for email) |
| `/faq` | ✅ Complete | — | Accordion FAQ |
| `/enroll` | ✅ Complete | — | Full enrollment form + CTA |
| `/privacy` | ✅ Complete | EPIC-8 | Full legal content |
| `/terms` | ✅ Complete | EPIC-8 | Full legal content |
| `/success` | ✅ Complete | — | Confirmation screen |
| `/login` | ✅ Complete | EPIC-1 | Email + Google auth |
| `/signup` | ✅ Complete | EPIC-1 | Full registration form |
| `/book` | ✅ Complete | EPIC-3 | Date picker → time grid → confirm → success |
| `/admin/slots` | ✅ Complete | EPIC-3 | Single + bulk slot CRUD |
| `/admin/bookings` | ✅ Complete | EPIC-3 | Filters + status actions |
| `/portal/bookings` | ✅ Complete | EPIC-3 | Upcoming/past + cancel |
| `/admin` (Dashboard) | 🟡 Scaffold | EPIC-5 | Static stat cards, no live data |
| `/admin/students` | ❌ Missing | EPIC-5 | Route exists in sidebar, no page |
| `/admin/resources` | ❌ Missing | EPIC-5 | Route exists in sidebar, no page |
| `/admin/reports` | ❌ Missing | EPIC-5 | Route exists in sidebar, no page |
| `/portal` (Dashboard) | 🟡 Scaffold | EPIC-2 | Static cards, no live data |
| `/portal/profile` | 🟡 Scaffold | EPIC-2 | Read-only display, no edit |
| `/portal/resources` | 🟡 Scaffold | EPIC-4 | Empty state only |
| `/portal/reports` | 🟡 Scaffold | EPIC-6 | Empty state only |

**Legend:** ✅ Production-ready · 🟡 Scaffold (partial) · ❌ Not started

---

## Sprint 3 Tickets

### TICKET-S3-01: Admin Dashboard — Live Data Integration

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-5 (Admin Dashboard) |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Page** | `/admin` |
| **Current State** | Static stat cards (Students: 0, Bookings: 0, etc.) and placeholder activity feed |
| **Description** | Wire the admin dashboard to live Firestore data. Display real-time counts for total students, today's bookings, deposits received, and resources uploaded. Add a recent activity feed showing last 10 bookings/enrollments. Add quick-action buttons (Create Slot, Upload Resource). |
| **Acceptance Criteria** | - Stat cards pull live counts from Firestore (`users`, `bookings`, `resources` collections)<br>- Today's bookings count filters by current date<br>- Recent activity feed shows last 10 actions with timestamps<br>- Quick-action buttons link to `/admin/slots` and `/admin/resources`<br>- Loading skeleton while data fetches |

---

### TICKET-S3-02: Admin — Student Roster & Management

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-5 (Admin Dashboard) |
| **Priority** | P1 |
| **Estimate** | 5 points |
| **Page** | `/admin/students` (NEW) |
| **Current State** | Page does not exist — sidebar link is dead |
| **Description** | Build student management page. List all students across all parent accounts. Each row shows student name, parent name, grade, program track, enrollment status, IEP upload status. Click row to expand detail drawer. Admin can update enrollment status (Inquiry → Discovery → Deposited → Enrolled → Completed). |
| **Acceptance Criteria** | - Searchable table of all students from `students` subcollection<br>- Columns: Name, Parent, Grade, Program, Status, IEP Uploaded<br>- Filter by: enrollment status, program track, grade<br>- Click row → slide-out detail panel<br>- Admin can update enrollment status via dropdown<br>- View/download uploaded IEP document<br>- Enrollment status change saved to Firestore<br>- Empty state for zero students |
| **Firestore Query** | `collectionGroup('students')` or read from `users/{uid}` and flatten |

---

### TICKET-S3-03: Admin — Resource Upload & Management

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-4 (Resource Center) |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Page** | `/admin/resources` (NEW) |
| **Current State** | Page does not exist — sidebar link is dead |
| **Description** | Build admin resource management page. Upload files (PDF, DOCX, images) with title, description, category (Handbook, Worksheet, Form, Other), and visibility toggle (all parents / enrolled only). Files stored in Firebase Storage under `resources/`. Metadata saved to `resources/` Firestore collection. |
| **Acceptance Criteria** | - Upload form: file picker, title, description, category dropdown, visibility toggle<br>- Drag-and-drop or click file upload with progress bar<br>- Max file size: 25MB<br>- List of existing resources with edit/delete actions<br>- File stored in `gs://iep-and-thrive.firebasestorage.app/resources/{docId}/{filename}`<br>- Metadata in `resources/` collection: title, description, category, visibility, fileUrl, fileSize, uploadedAt<br>- Delete removes file from Storage + doc from Firestore |
| **Service Layer** | Create `lib/resource-service.ts` for CRUD operations |

---

### TICKET-S3-04: Parent — Resource Library

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-4 (Resource Center) |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Page** | `/portal/resources` |
| **Current State** | Empty state placeholder only |
| **Description** | Display available resources for parents. Grid of resource cards with title, description, category badge, file size. Filter/search by category. Download button fetches signed URL from Storage. Track download count. |
| **Acceptance Criteria** | - Grid/list of resources fetched from `resources/` collection<br>- Filter by category tabs (All, Handbooks, Worksheets, Forms)<br>- Download button generates a download URL<br>- Download count incremented on click<br>- Only shows resources matching parent's visibility level<br>- Empty state if no resources available |

---

### TICKET-S3-05: Admin — Progress Report Upload

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-6 (Progress Reports) |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Page** | `/admin/reports` (NEW) |
| **Current State** | Page does not exist — sidebar link is dead |
| **Description** | Build admin report upload page. Admin selects a student, selects week (1–6 or Final), uploads PDF report, enters structured data fields (IEP goals targeted, accuracy percentage, engagement notes, home practice recommendations). Saved to `progressReports/` collection. |
| **Acceptance Criteria** | - Student selector dropdown (fetches all students)<br>- Week selector (Week 1–6 + Final)<br>- PDF file upload to Storage under `reports/{studentId}/{reportId}`<br>- Structured form: goals targeted, accuracy %, engagement notes, home practice<br>- Data saved to `progressReports/` collection with studentId, parentId, weekNumber, reportUrl, structured fields<br>- List of previously uploaded reports with edit/delete<br>- Duplicate prevention: warn if report for same student + week exists |
| **Service Layer** | Create `lib/report-service.ts` for CRUD operations |

---

### TICKET-S3-06: Parent — Progress Report Viewer

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-6 (Progress Reports) |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Page** | `/portal/reports` |
| **Current State** | Empty state placeholder only |
| **Description** | Display parent's student progress reports chronologically. Per student, show report cards with week number, date published, download link. Final report gets a highlighted badge. Mark as "viewed" when parent opens it. |
| **Acceptance Criteria** | - Reports grouped by student (if parent has multiple)<br>- Report cards: week number, date published, IEP goals summary, accuracy badge<br>- Download PDF button<br>- "New" badge for unread reports<br>- Mark as viewed on click (update `viewedAt` field)<br>- Final report visually distinguished<br>- Empty state if no reports yet |

---

### TICKET-S3-07: Parent Profile — Editable

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-2 (Parent Portal) |
| **Priority** | P2 |
| **Estimate** | 2 points |
| **Page** | `/portal/profile` |
| **Current State** | Read-only display of name/email/role |
| **Description** | Add editable profile form. Parent can update display name, phone number, notification preferences. Add student management: add/edit student info (name, DOB, grade, district, program track, emergency contacts). Upload IEP/504 documents (PDF, max 10MB). |
| **Acceptance Criteria** | - Edit mode toggle for contact info<br>- Phone number field with validation<br>- Notification preferences (email opt-in/out)<br>- "My Students" section with add/edit student cards<br>- Student form: name, DOB, grade, district, program, medical notes, 2+ emergency contacts<br>- IEP document upload (PDF, max 10MB) to Storage<br>- Save updates to Firestore `users/{uid}` and `users/{uid}/students/{studentId}`<br>- Change password link (Firebase Auth) |

---

### TICKET-S3-08: Parent Dashboard — Live Data

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-2 (Parent Portal) |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Page** | `/portal` |
| **Current State** | Static placeholder cards |
| **Description** | Wire the parent dashboard to live Firestore data. Show: enrolled student(s) summary, next upcoming booking with countdown, latest progress report (if any), enrollment status badge, and quick-action cards (Book Session, View Resources, View Reports). |
| **Acceptance Criteria** | - Student cards with enrollment status badges<br>- Next booking card with date/time and countdown<br>- Latest report card with download link (if any)<br>- Quick-action cards link to `/book`, `/portal/resources`, `/portal/reports`<br>- Empty states for new users with helpful CTAs<br>- Loading skeleton while data fetches |

---

## Sprint 4 Tickets

### TICKET-S4-01: Cloud Function Migration (Contact + Enroll + Stripe)

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-7 (Gmail Integration), EPIC-8 (Hardening) |
| **Priority** | P0 |
| **Estimate** | 5 points |
| **Current State** | API routes in `app/_api-server/` (disabled for static export) |
| **Description** | Migrate the 3 server-side API routes to Firebase Cloud Functions: `contact` (send notification email), `enroll` (send confirmation + notification), `stripeCheckout` (create Stripe session). Replace Resend with Gmail API. Deploy as Cloud Functions and update frontend calls. |
| **Acceptance Criteria** | - `functions/src/contact.ts` — handles contact form, sends via Gmail<br>- `functions/src/enroll.ts` — handles enrollment, sends confirmation + notification<br>- `functions/src/stripeCheckout.ts` — creates Stripe session, returns URL<br>- Frontend `fetch()` calls updated to Cloud Function URLs<br>- `resend` package removed from `package.json`<br>- All emails logged to `emailLog/` collection<br>- Cloud Functions deployed and tested |

---

### TICKET-S4-02: Booking Email Confirmation & Reminders

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-3 (Booking System), EPIC-7 (Gmail) |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | Implement Firestore-triggered Cloud Functions for booking emails. On booking creation → send confirmation email. 24 hours before booking → send reminder email. On cancellation → send cancellation email. Uses branded templates from `lib/gmail-service.ts`. |
| **Acceptance Criteria** | - `onBookingCreated` Cloud Function sends confirmation email<br>- Cloud Scheduler triggers reminder function daily<br>- Reminder email sent for bookings within next 24 hours<br>- Cancellation email sent on booking status change to "cancelled"<br>- All emails use branded HTML templates<br>- Emails logged in `emailLog/` collection |

---

### TICKET-S4-03: Google Calendar Sync (Live)

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-3 (Booking System) |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Current State** | Scaffold in `lib/google-calendar.ts` |
| **Description** | Activate Google Calendar API integration. On booking confirmation → create calendar event on admin's Google Calendar. On cancellation → delete calendar event. Event includes parent name, student name, booking type, and notes. Store `calendarEventId` in booking document. |
| **Acceptance Criteria** | - Google Calendar API enabled in GCP (manual)<br>- OAuth2 credentials configured in Secret Manager<br>- `createCalendarEvent` creates event with all booking details<br>- `deleteCalendarEvent` removes event on cancellation<br>- `calendarEventId` stored in booking Firestore doc<br>- Calendar event includes: title, time block, parent email as attendee, notes |

---

### TICKET-S4-04: Enrollment Pipeline / Kanban (Admin)

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-5 (Admin Dashboard) |
| **Priority** | P2 |
| **Estimate** | 3 points |
| **Page** | `/admin/students` (enhancement) or `/admin/pipeline` (new) |
| **Description** | Kanban-style view of the enrollment pipeline: Inquiry → Discovery Call → Deposited → Enrolled → Completed. Click or drag student cards between columns to update status. Count per column. |
| **Acceptance Criteria** | - 5 columns matching enrollment statuses<br>- Student cards with name, parent, program track<br>- Click to change status (mobile-friendly alternative to drag)<br>- Count badge per column header<br>- Status change saved to Firestore in real-time |

---

### TICKET-S4-05: Custom Domain & Production Deployment

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-8 (Hardening) |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Connect custom domain (iepandthrive.com) to Firebase Hosting. Verify SSL. Add predeploy script that runs `verify-firebase.mjs` + `next build`. Set up CI/CD for auto-deploy on push to `main`. |
| **Acceptance Criteria** | - Custom domain configured in Firebase Hosting<br>- SSL verified and active<br>- `firebase.json` includes predeploy script<br>- GitHub Actions workflow for auto-deploy<br>- `scripts/verify-firebase.mjs` runs in CI before deploy |

---

### TICKET-S4-06: Accessibility Audit & Fixes

| Field | Value |
|-------|-------|
| **EPIC** | EPIC-8 (Hardening) |
| **Priority** | P2 |
| **Estimate** | 2 points |
| **Description** | Run Lighthouse accessibility audit on all pages. Fix critical issues: alt text on images, ARIA labels on interactive elements, keyboard navigation flow, color contrast ratios, focus indicators, screen reader form labeling. |
| **Acceptance Criteria** | - Lighthouse accessibility score ≥ 90 on all routes<br>- All images have descriptive alt text<br>- All forms have proper labels and ARIA<br>- Full keyboard navigation works<br>- Color contrast meets WCAG AA<br>- Skip-to-content link on all pages |

---

## Summary

| Sprint | Tickets | Total Points | Focus |
|--------|---------|-------------|-------|
| **Sprint 3** | S3-01 through S3-08 | 23 points | Resource center, progress reports, student management, live dashboards |
| **Sprint 4** | S4-01 through S4-06 | 18 points | Cloud Functions, email/calendar activation, pipeline, domain, a11y |
| **Total Remaining** | **14 tickets** | **41 points** | |

### Priority Sequencing (Sprint 3)

```
S3-02 (Student Roster) ← foundation for reports & pipeline
  ├── S3-03 (Admin Resource Upload)
  │     └── S3-04 (Parent Resources)
  ├── S3-05 (Admin Report Upload)
  │     └── S3-06 (Parent Reports)
  ├── S3-07 (Profile Edit)
  └── S3-08 (Parent Dashboard Live)
S3-01 (Admin Dashboard Live) ← depends on students + resources existing
```
