# IEP & Thrive — Build State

## Status: SPRINT 6 — CORE LEARNING LOOP SHIPPED
The end-to-end student loop (Onboarding → Journey → Literacy/Math mission → Mission Complete) now works on device with real validation. P0 silent-correctness bugs, P1 UX gaps, the SpriteKit Math engine, and Sand Tray shape matching are all merged into `main`. Remaining work is design assets, telemetry-driven tuning, and a test harness.

## Tech Stack (iOS)
- **Framework:** SwiftUI
- **State Management:** TCA (The Composable Architecture)
- **Engine:** SpriteKit (Math Snap Cubes), CoreText + CoreGraphics (Sand Tray validation), CoreHaptics (multisensory feedback)
- **Data:** SwiftData (Local Source of Truth) + Firebase (Sync — not yet wired)
- **Design:** Stitch-generated design system (Forest/Sage/Cream palette)
- **Build:** XcodeGen (`ios/project.yml` is the source of truth — run `xcodegen generate` after adding/removing `.swift` files)

## Recent Progress (Sprint 6 ship)

Audit + four PRs merged 2026-05-26 (#9 → #13 → #14 → #15):

### PR #9 — P0 silent-correctness fixes
- Safe Space Exit + Journey leaf FAB wired through `RootFeature` (was no-op).
- Literacy back chevron sends new `.backTapped` action (no longer silently awarded mission completion on exit).
- Math `.checkAnswerTapped` gated on placement; explicit back button added.

### PR #13 — P1 UX improvements
- **Onboarding:** age picker (5–11) + primary-focus selector (Reading/Math/Both); Continue disabled until name non-empty; `StudentProfile` persisted to SwiftData.
- **Journey:** `currentLevelIndex` gating with locked/active/completed node states; dashed sage trail (`TrailPath`) between nodes; per-biome gradient overlays (forest/desert/mountain) until distinct art lands.
- **`MissionCompleteFeature`** + sheet — star-burst, level title, +sparks chip, "Keep Exploring" CTA.
- **Sparks counter** animates increments via `contentTransition(.numericText)`.
- **`LevelDefinition.missionDescription`** — `targetValue` ids (`ai`, `x5`, `predict`) mapped to parent-readable copy on the level preview sheet.
- **`GEMINI.md`** refocused on the iOS pivot stack.

### PR #14 — SpriteKit Snap Cubes + scaffold cleanup
- **`SnapCubesScene`** (SpriteKit): edge-loop physics, gravity, 56pt amber cubes, tap-to-spawn, drag-to-move, 20-cube cap.
- **`SnapCubesView`** (SwiftUI wrapper): holds scene as `@State`, Remove + Clear buttons.
- **`LevelDefinition.targetCount`**: per-level cube goals (`add` → 5, `x2` → 4, `arrays` → 6, `x10` → 10). `nil` for abstract levels (rounding, estimation) — those keep the "any placement" fallback.
- **`MathFeature.State.isCorrect`** gates completion on `count == target` when known; incorrect attempts surface a friendly hint ("Almost! Add 2 more.") and keep the child on screen.
- **Cleanup:** deleted stranded pre-TCA scaffolding (`Presentation/Views/MainJourneyView.swift`, `Presentation/ViewModels/JourneyViewModel.swift`, `Domain/Models/JourneyNode.swift`).

### PR #15 — Sand Tray stroke validation
- **`LetterTracer`** — CoreText glyph paths → flipped/centered `CGPath` → stroke-inflated for `contains(point)` accuracy + sampled anchors for coverage. Pass requires accuracy ≥ 0.55 AND coverage ≥ 0.45 (forgiving for SPED motor-skill learners).
- **`SandTrayView`** — `GeometryReader` captures canvas size for the tracer; strokes shift to forestLight on a passing trace; Done button morphs into "✓ Great Job!" capsule; new undo button; amber hint chip on misses. Done remains always-tappable — visual feedback is the carrot, not the stick.

## Sprint 7 — In Flight

### Merged — Test harness (PR #19)
- `IEPAndThriveTests` XCTest target with TCA `TestStore` coverage for
  Onboarding / Journey / Math / Literacy reducers + `RootFeature`
  orchestration. Regression guards on PR #9 silent-correctness bugs.
- `LetterTracer` geometry tests at production thresholds.
- CI runs `xcodebuild test` after `build`; explicit `Dependencies` +
  `CasePaths` package product links (transitive-link workaround that
  affects both Xcode 16.4 and Xcode 26).

### PR (open) — Firebase sync Phase 1
- iOS Firebase app registered (`1:564060847585:ios:ac9aef618a24bff69166a0`,
  bundle `com.cureconsulting.IEPAndThrive`).
- `firebase-ios-sdk` 12.x added to `project.yml` (FirebaseAuth +
  FirebaseFirestore products).
- `AuthClient` — anonymous Firebase Auth, idempotent. Device-bound UID
  survives reinstalls.
- `FirestoreClient` — write-through for `StudentProfile` / `SparksRecord`
  at `users/{uid}/students/default/{profile|sparks/{id}}`. Mirrors the
  web platform's existing schema so Phase 2 can lift-and-shift the data
  under a parent's authenticated UID.
- `FirestoreDTOs` — Codable mirrors of SwiftData `@Model` classes so we
  don't have to fight `@Model` ↔ `Codable` synthesis. SwiftData stays
  the local source of truth; DTOs are the wire format.
- `DatabaseClient.addSparks` now takes a `SparksRecord` so the same
  UUID can persist locally AND sync to Firestore (lockstep IDs).
- `RootFeature.appDelegate.didFinishLaunching` resolves anonymous auth
  before fetching profile / starting StoreKit observation.
- Firestore rules add `users/{uid}/students/{studentId}/lessons` and
  `.../sparks` subcollections (owner-only). Not auto-deployed by the
  existing `deploy.yml` workflow — needs `firebase deploy --only
  firestore:rules` after merge.
- 46 tests passing locally (added auth bootstrap + skip-sync-without-uid
  cases on top of the previous 44).

### Phase 2 — staged delivery
- **2.1 — merged (#21)** — `LessonProgress` write path.
- **2.2 — merged (#22)** — Email/password login UI + anon → authenticated UID migration.
- **2.3.a — merged (#23)** — Sign in with Apple.
- **2.3.b — merged (#24)** — Google Sign-In.
- **2.4 — merged (#25)** — Child picker for multi-child households. `FirestoreClient` refactored so every write takes a `studentId` parameter; post-auth flow auto-resolves on 0/1 students or surfaces `ChildPickerView` on 2+.
- **2.x deferred** — Sign-out UI surface (no current way to log out without app reinstall).

## Sprint 8 (Phase 3) — Launch readiness for July 7 cohort

### Phase 3 — staged delivery
- **3.3 — open PR** — Crashlytics + observability foundation. `CrashlyticsClient` TCA dependency (log breadcrumbs, recordError with domain, setUserId). All `try?`-swallowed Firestore / SwiftData / Auth errors now record as non-fatals. User ID wired in `authResolved` + `auth.delegate.signedIn`. Breadcrumbs at every key signal point (mission complete, literacy trace pass/fail, math check pass/fail, auth flow). dSYM upload run script added via `postBuildScripts` so production stack traces symbolicate. 84 tests passing.
- **3.4** — UX polish (defer paywall, sign-out UI, distinct Desert/Mountain biome art).
- **3.1** — Web portal ↔ iOS data unification (parent dashboard reads iOS Firestore subcollections).
- **3.5** — Privacy manifest + FERPA/COPPA compliance review.
- **3.2** — TestFlight distribution (Fastlane + App Store Connect listing).
- **3.6 / 3.7** — Manual QA + pilot rollout to 3–5 enrolled families.

## Next Steps
- **Design assets:** Distinct `BiomeDesert.imageset` and `BiomeMountain.imageset` art (currently empty — only `BiomeForest` has a real image, biomes are differentiated via gradient overlay).
- **Threshold tuning:** Sand Tray accuracy/coverage thresholds (0.55/0.45) and Math `targetCount` values are starting points — revisit once we have real session telemetry.
- **Paywall UX:** Currently auto-presents after onboarding (`RootFeature.swift:56–58, 70–72`) before the child sees any of the journey. Consider deferring until N levels completed.
- **Per-glyph stroke order:** Sand Tray validates final shape, not stroke sequence. Out of scope for this sprint; future enhancement.

---

## Status (Web): SPRINT 5 COMPLETE — LAUNCH READY
(Note: The web platform is now considered the legacy portal/landing page as we pivot to native iOS).

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
