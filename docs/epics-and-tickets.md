# EPICs & Tickets — IEP & Thrive Platform

**Project:** IEP & Thrive
**Phase:** Platform Build (Post-MVP Marketing Site)
**Architecture:** Next.js 14 + Firebase (Auth, Firestore, Storage, Cloud Functions)

---

## Dependency Graph

```
EPIC-0 (Firebase Infrastructure)
  ├── EPIC-1 (Auth & Accounts)
  │     ├── EPIC-2 (Parent Portal)
  │     │     ├── EPIC-4 (Resource Center)
  │     │     └── EPIC-6 (Progress Reports Portal)
  │     └── EPIC-5 (Admin Dashboard)
  │           └── EPIC-6 (Progress Reports Portal)
  ├── EPIC-3 (Booking System)
  │     └── EPIC-7 (Gmail Integration)
  └── EPIC-7 (Gmail Integration)

EPIC-8 (Website Hardening) — independent, can run in parallel
```

---

## EPIC-0: Firebase Project & Infrastructure

**Goal:** Stand up the Firebase project with all required services and integrate with the existing Next.js codebase.

**Priority:** 🔴 P0 — All other EPICs depend on this
**Sprint:** 1

---

### EPIC-0-T1: Create Firebase Project

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 1 point |
| **Description** | Create a new Firebase project named `iep-and-thrive` via Firebase CLI. Enable Blaze billing plan. |
| **Acceptance Criteria** | - Firebase project exists<br>- Blaze plan active<br>- Project ID confirmed |

---

### EPIC-0-T2: Initialize Firebase Services

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 2 points |
| **Description** | Initialize Firebase in the project directory with: Authentication (Email/Password + Google Sign-In), Firestore, Storage, Cloud Functions (Node.js), and Hosting. Create `firebase.json`, security rules, and functions directory. |
| **Acceptance Criteria** | - `firebase.json` configured<br>- `firestore.rules` exists with base rules<br>- `storage.rules` exists<br>- `functions/` directory with `package.json` and `index.ts`<br>- Emulators configured (Auth, Firestore, Storage) |

---

### EPIC-0-T3: Create Firestore Data Model

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 3 points |
| **Description** | Design and document the Firestore collections and indexes. Create initial security rules. |

**Collections:**

```
users/
  {userId}
    ├── email: string
    ├── displayName: string
    ├── role: "parent" | "admin"
    ├── phone: string
    ├── createdAt: timestamp
    └── students: subcollection
          {studentId}
            ├── firstName: string
            ├── lastName: string
            ├── dateOfBirth: string
            ├── grade: string
            ├── schoolDistrict: string
            ├── programTrack: "reading" | "math" | "full_academic"
            ├── enrollmentStatus: "inquiry" | "discovery_call" | "deposited" | "enrolled" | "completed"
            ├── iepFileUrl: string (Storage ref)
            ├── allergies: string
            ├── medications: string
            ├── diagnoses: string
            ├── behavioralNotes: string
            ├── emergencyContacts: array<{name, phone, relationship}>
            ├── photoConsent: boolean
            └── createdAt: timestamp

bookings/
  {bookingId}
    ├── parentId: string (ref → users)
    ├── studentId: string
    ├── type: "discovery_call" | "consultation" | "check_in"
    ├── slotId: string (ref → availableSlots)
    ├── date: timestamp
    ├── startTime: string ("10:00")
    ├── endTime: string ("10:20")
    ├── status: "confirmed" | "cancelled" | "completed" | "no_show"
    ├── googleCalendarEventId: string
    ├── notes: string
    ├── createdAt: timestamp
    └── updatedAt: timestamp

availableSlots/
  {slotId}
    ├── date: string ("2026-04-15")
    ├── startTime: string ("10:00")
    ├── endTime: string ("10:20")
    ├── duration: number (20)
    ├── type: "discovery_call" | "consultation" | "check_in"
    ├── isAvailable: boolean
    ├── bookedBy: string | null (ref → users)
    └── createdAt: timestamp

resources/
  {resourceId}
    ├── title: string
    ├── description: string
    ├── category: "handbook" | "worksheet" | "report" | "form" | "guide"
    ├── fileUrl: string (Storage ref)
    ├── fileName: string
    ├── fileSizeBytes: number
    ├── visibility: "all_parents" | "enrolled_only" | "admin_only"
    ├── downloadCount: number
    ├── uploadedBy: string (ref → users)
    ├── createdAt: timestamp
    └── updatedAt: timestamp

progressReports/
  {reportId}
    ├── studentId: string
    ├── parentId: string (ref → users)
    ├── weekNumber: number (1-6)
    ├── programTrack: string
    ├── type: "weekly" | "final"
    ├── fileUrl: string (Storage ref)
    ├── iepGoalsTargeted: array<string>
    ├── accuracyData: map
    ├── engagementNotes: string
    ├── homePractice: string
    ├── createdAt: timestamp
    └── publishedAt: timestamp

emailLog/
  {emailId}
    ├── to: string
    ├── subject: string
    ├── templateType: "booking_confirmation" | "booking_reminder" | "enrollment_confirmation" | "weekly_report" | "general"
    ├── status: "sent" | "failed"
    ├── sentAt: timestamp
    └── error: string | null
```

| **Acceptance Criteria** | - All collections documented<br>- Firestore indexes created for common queries<br>- Security rules enforce role-based access |

---

### EPIC-0-T4: Install Firebase SDK in Next.js

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 2 points |
| **Description** | Install `firebase` and `firebase-admin` packages. Create `lib/firebase.ts` (client SDK init) and `lib/firebase-admin.ts` (server SDK init). Set up environment variables for Firebase config. |
| **Acceptance Criteria** | - `firebase` + `firebase-admin` installed<br>- `lib/firebase.ts` exports initialized app, auth, firestore, storage<br>- `lib/firebase-admin.ts` exports admin SDK for API routes/server components<br>- `.env.local` updated with Firebase config vars<br>- Firebase config NOT exposed in client bundle (use `NEXT_PUBLIC_` only for client SDK) |

---

### EPIC-0-T5: Configure Firestore Security Rules

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 2 points |
| **Description** | Write Firestore security rules enforcing: parents can only read/write their own data; admin role has full access; public cannot read any data; students subcollection is nested under authenticated parent. |
| **Acceptance Criteria** | - Rules deployed<br>- Tested: unauthenticated user blocked<br>- Tested: parent can only access own documents<br>- Tested: admin can access all documents |

---

### EPIC-0-T6: Configure Storage Security Rules

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 1 point |
| **Description** | Write Storage rules: parents can upload to `ieps/{userId}/` and read from `resources/`; admin can read/write all paths. |
| **Acceptance Criteria** | - Rules deployed<br>- Parents can upload IEP files to their own path<br>- Parents can download from resources path<br>- Admin can upload resources |

---

## EPIC-1: Authentication & User Accounts

**Goal:** Allow parents to create accounts and log in. Admin accounts for program operators.

**Priority:** 🔴 P0
**Sprint:** 1
**Depends on:** EPIC-0

---

### EPIC-1-T1: Firebase Auth Setup (Email/Password + Google)

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P0 |
| **Estimate** | 2 points |
| **Description** | Enable Email/Password and Google Sign-In providers in Firebase Auth. Configure authorized domains. |
| **Acceptance Criteria** | - Both providers enabled in Firebase Console<br>- Auth works in emulator<br>- Authorized domains include localhost and production domain |

---

### EPIC-1-T2: Build Sign-Up / Login Pages

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P0 |
| **Estimate** | 3 points |
| **Description** | Create `/login` and `/signup` pages with email/password form + Google Sign-In button. Match the existing design system (forest/sage/cream palette, Playfair Display, DM Sans). Create user document in Firestore on first sign-up. |
| **Acceptance Criteria** | - `/login` page renders with email/password + Google button<br>- `/signup` page creates Firebase Auth user + Firestore `users/{uid}` doc<br>- Error handling: duplicate email, weak password, network error<br>- Redirect to `/portal` on success<br>- Mobile responsive |

---

### EPIC-1-T3: Auth Context Provider

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 2 points |
| **Description** | Create `AuthProvider` React context that wraps the app, exposes current user, loading state, and auth methods (signIn, signUp, signOut). |
| **Acceptance Criteria** | - `useAuth()` hook available throughout app<br>- Returns `{ user, loading, signIn, signUp, signOut }`<br>- `user` includes Firestore profile data (role, etc.) |

---

### EPIC-1-T4: Route Protection Middleware

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 2 points |
| **Description** | Create a `ProtectedRoute` wrapper component and/or Next.js middleware that redirects unauthenticated users from `/portal/*` and `/admin/*` to `/login`. |
| **Acceptance Criteria** | - Unauthenticated users redirected from protected routes<br>- Non-admin users redirected from `/admin/*` to `/portal`<br>- Loading state shows spinner, not flash of content |

---

### EPIC-1-T5: Admin Role Assignment

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 1 point |
| **Description** | Create a Firebase custom claim `admin: true` for the founder's account. Build a Cloud Function or CLI script to assign the admin role. |
| **Acceptance Criteria** | - Founder account has `admin: true` custom claim<br>- Claim is checked in security rules and route protection<br>- Script/function documented for future admin assignments |

---

## EPIC-2: Parent Portal

**Goal:** Authenticated dashboard where parents can view upcoming bookings, access resources, see their child's progress reports, and manage their profile.

**Priority:** 🟡 P1
**Sprint:** 2
**Depends on:** EPIC-1

---

### EPIC-2-T1: Portal Layout & Navigation

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | Create the `/portal` layout with sidebar navigation: Dashboard, My Bookings, Resources, Progress Reports, My Profile. Match the design system. |
| **Acceptance Criteria** | - `/portal` layout with sidebar/tabs<br>- Responsive: sidebar collapses to bottom nav on mobile<br>- User name/avatar displayed<br>- Sign-out button functional |

---

### EPIC-2-T2: Parent Dashboard (Home)

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | `/portal` home page showing: enrolled student(s) summary, next upcoming booking, latest progress report, and enrollment status badge. |
| **Acceptance Criteria** | - Shows student cards with enrollment status<br>- Next booking (if any) with date/time<br>- Latest report with download link<br>- Empty states for new users |

---

### EPIC-2-T3: Student Profile Management

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | Parents can add/edit student info: name, DOB, grade, district, program track, medical info, emergency contacts. Parents can upload IEP/504 documents (PDF). |
| **Acceptance Criteria** | - Form to add/edit student<br>- File upload for IEP (Firebase Storage, max 10MB, PDF only)<br>- Emergency contacts (min 2 required)<br>- Validation on all fields<br>- Data saved to `users/{uid}/students/{studentId}` |

---

### EPIC-2-T4: Parent Profile & Settings

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P2 |
| **Estimate** | 2 points |
| **Description** | Parents can update their contact info, change password, and manage notification preferences. |
| **Acceptance Criteria** | - Edit name, phone, email<br>- Change password flow<br>- Notification preferences (email opt-in/out) |

---

## EPIC-3: Booking System (Internal Calendly)

**Goal:** Parents can view available time slots and book discovery calls, consultations, and check-ins. Bookings sync to Google Calendar and send Gmail confirmations.

**Priority:** 🔴 P0
**Sprint:** 2
**Depends on:** EPIC-0, EPIC-1

---

### EPIC-3-T1: Admin — Slot Management

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P0 |
| **Estimate** | 3 points |
| **Description** | Admin interface to create/manage available time slots. Admin selects date, start time, duration (20 min default), and slot type. Bulk creation for recurring weekly availability. |
| **Acceptance Criteria** | - Admin can create individual slots (date, time, duration, type)<br>- Admin can create bulk recurring slots (e.g., "Every Tuesday 10am-12pm in 20-min blocks")<br>- Admin can delete/disable slots<br>- Slots saved to `availableSlots/` collection |

---

### EPIC-3-T2: Public Booking Page

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P0 |
| **Estimate** | 5 points |
| **Description** | Public-facing (but auth-required) booking page at `/book`. Shows a calendar/date picker with available slots. Parent selects slot → enters student name + brief description → confirms → booking created. |
| **Acceptance Criteria** | - Calendar UI showing dates with available slots highlighted<br>- Click date → shows available time slots<br>- Select slot → confirmation form (student name, reason)<br>- Submit → creates `bookings/` doc, marks slot as booked<br>- Shows confirmation screen with date/time<br>- Cannot double-book a slot<br>- Mobile responsive |

---

### EPIC-3-T3: Booking Confirmation & Reminders

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | On booking confirmation: send Gmail confirmation email to parent. 24 hours before: send reminder email. Uses Cloud Function triggered by Firestore write. |
| **Depends on** | EPIC-7 (Gmail Integration) |
| **Acceptance Criteria** | - Confirmation email sent on booking creation<br>- Reminder email sent 24 hours before (Cloud Scheduler or cron trigger)<br>- Emails use branded HTML template<br>- Email logged in `emailLog/` collection |

---

### EPIC-3-T4: Google Calendar Sync

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | When a booking is confirmed, create a Google Calendar event on the admin's calendar via Google Calendar API. Include parent name, student name, and booking type in the event. |
| **Acceptance Criteria** | - Cloud Function creates Google Calendar event on booking<br>- Event includes: title, time, parent email, notes<br>- Calendar event ID stored in booking doc<br>- On booking cancellation: delete calendar event |

---

### EPIC-3-T5: My Bookings (Parent View)

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Parent portal page showing all bookings: upcoming (with cancel option) and past bookings. |
| **Acceptance Criteria** | - List of upcoming bookings with date, time, type, status<br>- Cancel button (if >24h before slot)<br>- Past bookings list<br>- Empty state if no bookings |

---

### EPIC-3-T6: Admin Booking View

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Admin dashboard page showing all bookings across all parents: today's schedule, upcoming, past. Ability to mark as completed or no-show. |
| **Acceptance Criteria** | - Today's bookings highlighted<br>- Full booking list with parent name, student, type, status<br>- Mark as completed / no-show<br>- Filter by date, status, type |

---

## EPIC-4: Resource Center

**Goal:** Parents can access and download program resources (handbooks, worksheets, forms). Admin can upload and manage resources.

**Priority:** 🟡 P1
**Sprint:** 3
**Depends on:** EPIC-1, EPIC-2

---

### EPIC-4-T1: Admin — Upload & Manage Resources

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | Admin page to upload files (PDF, DOCX) with title, description, category, and visibility setting. Files stored in Firebase Storage under `resources/`. |
| **Acceptance Criteria** | - Upload form with file picker, title, description, category dropdown, visibility toggle<br>- File uploaded to Storage, metadata saved to `resources/` collection<br>- Upload progress indicator<br>- Max file size: 25MB<br>- Admin can delete resources |

---

### EPIC-4-T2: Parent — Resource Library

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | Parent portal page listing available resources, filtered by category. Download button generates a signed URL. |
| **Acceptance Criteria** | - Grid/list of resources with title, description, category, file size<br>- Filter by category<br>- Download button (tracks download count)<br>- Only shows resources matching visibility rules<br>- Empty state if no resources |

---

## EPIC-5: Admin Dashboard

**Goal:** Central admin hub for managing the program: student roster, enrollment pipeline, bookings, resources, and reports.

**Priority:** 🟡 P1
**Sprint:** 3
**Depends on:** EPIC-1

---

### EPIC-5-T1: Admin Layout & Navigation

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Create `/admin` layout with sidebar: Dashboard, Students, Bookings, Resources, Reports, Settings. Admin-only access enforced. |
| **Acceptance Criteria** | - Admin layout with sidebar navigation<br>- Non-admin users get redirected<br>- Responsive design |

---

### EPIC-5-T2: Admin Dashboard Home

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | Overview dashboard showing: total enrolled students, today's bookings, recent enrollments, enrollment pipeline counts by status (inquiry → discovery → deposited → enrolled). |
| **Acceptance Criteria** | - Stat cards: total students, today's bookings, revenue collected<br>- Enrollment pipeline visualization (status counts)<br>- Recent activity feed<br>- Quick action buttons (create slot, upload resource) |

---

### EPIC-5-T3: Student Roster & Management

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | Admin page listing all students across all parents. View student details, enrollment status, IEP upload status, program track. Admin can update enrollment status. |
| **Acceptance Criteria** | - Searchable/filterable student table<br>- View student detail (click row)<br>- Update enrollment status dropdown<br>- View/download uploaded IEP<br>- Filter by program track, status, grade |

---

### EPIC-5-T4: Enrollment Pipeline View

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P2 |
| **Estimate** | 3 points |
| **Description** | Kanban-style pipeline view: Inquiry → Discovery Call → Deposited → Enrolled → Completed. Drag-and-drop to update status. |
| **Acceptance Criteria** | - Kanban columns for each status<br>- Student cards with name, parent, program track<br>- Drag to update status (or click to change)<br>- Count per column |

---

## EPIC-6: Progress Reports Portal

**Goal:** Admin uploads weekly/final progress reports. Parents can view and download their child's reports from the portal.

**Priority:** 🟡 P1
**Sprint:** 3-4
**Depends on:** EPIC-2, EPIC-5

---

### EPIC-6-T1: Admin — Upload Progress Report

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 3 points |
| **Description** | Admin form to upload a progress report PDF: select student, select week (1-6) or final, upload file, enter IEP goals targeted, accuracy data, engagement notes, home practice recommendations. File stored in Storage, metadata in Firestore. |
| **Acceptance Criteria** | - Student selector dropdown<br>- Week selector (1-6 or Final)<br>- File upload (PDF)<br>- Structured data fields<br>- Save to `progressReports/` collection<br>- Notification to parent (email) when published |

---

### EPIC-6-T2: Parent — View Progress Reports

| Field | Value |
|-------|-------|
| **Type** | Story |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Parent portal page showing all progress reports for their student(s), chronologically. Each report card shows week number, date, download link. |
| **Acceptance Criteria** | - List of reports per student<br>- Download PDF button<br>- Status indicators (viewed/not viewed)<br>- Final report highlighted/badged |

---

## EPIC-7: Gmail & Email Integration

**Goal:** Replace Resend with Gmail API for all transactional email (booking confirmations, reminders, enrollment confirmations, report notifications).

**Priority:** 🔴 P0
**Sprint:** 2
**Depends on:** EPIC-0

---

### EPIC-7-T1: Gmail API Setup

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P0 |
| **Estimate** | 3 points |
| **Description** | Enable Gmail API in GCP project. Create OAuth2 credentials or service account. Store credentials in Firebase environment config / Secret Manager. Create `functions/src/email/gmail.ts` service. |
| **Acceptance Criteria** | - Gmail API enabled on GCP project<br>- OAuth2 tokens or service account configured<br>- Email service can send emails from the program's Gmail address<br>- Tested: send a test email via Cloud Function |

---

### EPIC-7-T2: Email Templates

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Create branded HTML email templates for: booking confirmation, booking reminder (24hr), enrollment confirmation, weekly report notification, general communication. |
| **Acceptance Criteria** | - 5 email templates with IEP & Thrive branding (forest/sage palette)<br>- Templates accept dynamic data (name, date, etc.)<br>- Mobile responsive<br>- Plain-text fallback |

---

### EPIC-7-T3: Replace Resend with Gmail in API Routes

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Update existing `/api/enroll` and `/api/contact` routes to use Gmail API via Cloud Functions instead of Resend. Remove `resend` package from dependencies. |
| **Acceptance Criteria** | - `/api/enroll` sends confirmation via Gmail<br>- `/api/contact` sends notification via Gmail<br>- `resend` package removed from `package.json`<br>- All emails logged in `emailLog/` collection |

---

## EPIC-8: Website Hardening & Polish

**Goal:** Production-ready website with legal pages populated, SEO optimized, analytics active, and deployed to production.

**Priority:** 🟡 P1
**Sprint:** 4
**Independent** — can run in parallel

---

### EPIC-8-T1: Populate Legal Pages

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Populate the existing `/privacy` and `/terms` pages with content from the legal scaffolds (after attorney review). Add link to Refund Policy in the enrollment flow. |
| **Acceptance Criteria** | - `/privacy` page has full Privacy Policy content<br>- `/terms` page has full Terms of Service content<br>- Footer links work<br>- Enrollment form links to ToS + Privacy Policy |

---

### EPIC-8-T2: Remove Resend Dependencies

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P1 |
| **Estimate** | 1 point |
| **Description** | Remove `resend` from `package.json`. Update API routes to use Gmail Cloud Function. Clean up env vars. |
| **Acceptance Criteria** | - `resend` removed from dependencies<br>- No references to Resend in codebase<br>- `.env.local` cleaned up |

---

### EPIC-8-T3: Vercel Deployment & Custom Domain

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Deploy the site to Vercel. Connect custom domain (iepandthrive.com). Verify SSL. Configure environment variables in Vercel dashboard. |
| **Acceptance Criteria** | - Site deployed to Vercel<br>- Custom domain connected with SSL<br>- All environment variables configured<br>- Site loads correctly on production URL |

---

### EPIC-8-T4: Update Stripe Integration

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P1 |
| **Estimate** | 2 points |
| **Description** | Update Stripe checkout to create/link bookings with Firestore. On successful payment, update student enrollment status to "deposited" in Firestore. |
| **Acceptance Criteria** | - Stripe checkout success creates Firestore record<br>- Student enrollment status updated<br>- Admin can see payment status in dashboard |

---

### EPIC-8-T5: Accessibility Audit

| Field | Value |
|-------|-------|
| **Type** | Task |
| **Priority** | P2 |
| **Estimate** | 2 points |
| **Description** | Run accessibility audit (Lighthouse + manual). Fix critical issues: alt text, ARIA labels, keyboard navigation, color contrast. |
| **Acceptance Criteria** | - Lighthouse accessibility score 90+<br>- All images have alt text<br>- Keyboard navigable<br>- Screen reader compatible forms |

---

## Sprint Plan

| Sprint | Duration | EPICs | Key Deliverables |
|--------|----------|-------|-------------------|
| **Sprint 1** | 1 week | EPIC-0, EPIC-1 | Firebase project live, Auth working, login/signup pages, route protection |
| **Sprint 2** | 1 week | EPIC-3, EPIC-7 | Booking system (slots, calendar, booking page), Gmail integration |
| **Sprint 3** | 1 week | EPIC-2, EPIC-4, EPIC-5 | Parent portal, resource center, admin dashboard |
| **Sprint 4** | 1 week | EPIC-6, EPIC-8 | Progress reports, website hardening, deployment |

**Total estimated effort:** ~85 story points across 4 sprints

---

## Ticket Summary

| EPIC | Tickets | Points | Priority |
|------|---------|--------|----------|
| EPIC-0: Firebase Infrastructure | 6 | 11 | P0 |
| EPIC-1: Auth & Accounts | 5 | 10 | P0 |
| EPIC-2: Parent Portal | 4 | 11 | P1 |
| EPIC-3: Booking System | 6 | 18 | P0 |
| EPIC-4: Resource Center | 2 | 6 | P1 |
| EPIC-5: Admin Dashboard | 4 | 11 | P1 |
| EPIC-6: Progress Reports | 2 | 5 | P1 |
| EPIC-7: Gmail Integration | 3 | 7 | P0 |
| EPIC-8: Website Hardening | 5 | 9 | P1 |
| **Total** | **37** | **88** | |
