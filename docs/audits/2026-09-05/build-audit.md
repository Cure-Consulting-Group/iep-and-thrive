# IEP & Thrive: implementation and readiness audit

Date: September 5, 2026 (America/New_York). Baseline: `c60cc3b6d1599a6c5e39f89e999b111a0cc25b2a` on `main`.

## Decision

There is a useful service platform and a working native game foundation. There is not yet a validated adaptive reading product or a trustworthy automated outcome-measurement engine. Continue with a bounded product-validation phase, preceded by security and learning-integrity repairs. Do not expand child access on the strength of passing unit tests alone.

The companion [market and product decision](market-and-product-decision.md) recommends an independently viable learning product, supported by the educator's expertise and practitioner relationships. A future school should be optional to the software business.

## Scope and method

The working directory is `/Volumes/CureVault/projects/iep-and-thrive`. The initial working tree was clean. `git pull --ff-only` advanced `main` from `c7ddcaa` to `c60cc3b`, bringing in the August school-strategy corpus and a static-export layout fix.

Reviewed the architecture and principal execution paths across the web app, native app, Firebase services, curriculum, authorization rules, billing, reporting, release workflows, and strategy documents. Inventory: 58 web page files, 38 native Swift source files, 12 native test files, 31 Functions TypeScript files, and 42 curriculum Markdown files. Counts describe files, not completed features.

Ran local builds, existing unit tests, native simulator tests, read-only marketing browser tests, desktop/mobile browser probes, dependency advisory scans, and isolated Firebase security probes. Inspected recent GitHub Actions results and public site reachability. The browser probe blocked non-loopback traffic; security probes used synthetic records in `demo-iep-audit` only.

This is a broad implementation audit, not a line-by-line proof of all code or a certification. Did not inspect production family records, charge payments, send email, enroll children, verify App Store Connect settings, perform real-device accessibility testing, or revalidate the separate school-financing/legal research corpus. Production-deployed Firebase rules and secrets were not compared with the repository. Findings about deployed exposure are therefore conditional on deployed configuration matching this baseline.

## What actually exists

| Area | Implemented foundation | Material limit |
| --- | --- | --- |
| Marketing | Summer program, tutoring, enrollment, guide, FAQ, legal pages, parent login | Summer 2026 messaging dominates; custom domain did not resolve during audit |
| Parent portal | Profiles, student intake, IEP upload, bookings, subscriptions, reports, resources, notifications, agreements, photo release | Authorization and booking defects; student deep links fail under Hosting fallback |
| Staff operations | Student lists, curriculum and lesson views, materials, attendance, probes, pre/post assessments, report templates, slots, email log | In-program tools; not multi-organization SaaS tenancy or a validated assessment platform |
| Backend | Stripe checkout/webhook/customer portal, email lifecycle jobs, booking/calendar hooks, signatures/PDFs | Production credentials and delivery not exercised; webhook recovery and deployment coverage need work |
| Native learning | Onboarding, journey map, lesson previews, tracing, cube interaction, completion sheet, Sparks, a calming screen | Two core interaction types; curriculum labels exceed what those interactions teach |
| Native accounts | Anonymous/email/Apple/Google auth, child picker, Firestore write-through, StoreKit client | Migration, restore, child identity, parental controls, deletion, and commercial enforcement gaps |
| Curriculum | Six-week instructor materials and assessment/probe templates | Native catalog contains 25 literacy and 13 math definitions, primarily weeks 1–2 |
| Outcome reporting | Teacher-entered assessments/probes/reports; native lesson and Sparks feed | Native `score` is a fixed reward value, not a validated mastery measure |
| AI | No student-facing generative tutoring implementation found in the reviewed learning paths | AI guidance, evaluations, curriculum constraints, cost controls, and consent flows remain new work |

The Safe Space is currently a mood-changing pet display with ambient-audio controls, not the complete decorating/economy system described in the story RFC. Likewise, `SpeechClient` provides synthesized speech; it does not listen to or assess a child's oral reading. These distinctions correct any impression that the whole product brief is already implemented.

## Verification results

| Check | Result | Interpretation |
| --- | --- | --- |
| Clean install | Web and Functions dependencies installed with scripts disabled | Repository lockfiles preserved |
| Web unit tests | **37 passed** | Helpers/schema/business-state coverage |
| Web production export | **Passed with workflow's public Firebase configuration** | Initial unconfigured build failed `auth/invalid-api-key`; setup dependency, not an unexplained compilation failure |
| Functions TypeScript build | **Passed** | Local Node 25.9.0 differs from declared Node 22; production-runtime behavior not established |
| Native build and test | **95 passed**, Xcode 26.5, iPhone 17 Pro simulator/iOS 26.5 | Reducer and geometry tests; does not validate learning effectiveness or production sync |
| Marketing browser tests | **7 passed; 2 failed** | Both failures expect pre-May-30 enrollment copy after the deadline |
| Desktop/mobile probe | 18 route/viewport observations; no horizontal overflow or uncaught page errors in those observations | Does not constitute comprehensive accessibility coverage |
| Firebase rule probes | Confirmed billing-field writes, cross-family signed-file access, private-note visibility, blocked bookings and blocked old-UID migration | See reproducible synthetic results |
| Root production dependency scan | 23 flagged packages: 2 critical, 8 high, 12 moderate, 1 low | Advisory counts, not 23 proven exploitable paths |
| Functions dependency scan | 22 flagged packages: 2 critical, 5 high, 13 moderate, 2 low | Triage runtime reachability before upgrading; do not use a blind forced fix |
| GitHub Actions | Latest baseline deploy and CodeQL succeeded; latest E2E failed (8 failed, 29 passed) | Deployment success is not a release-quality gate |

The initial local Hosting probe encountered an audit harness path-resolution problem and returned all 404s. It was corrected using a relative public directory; all reported browser results above are from the corrected run. The source application was not changed.

Evidence: [verification summary](evidence/verification-summary.json), [rule observations](evidence/rules-results.json), [browser observations](evidence/browser-results.json), [unit output](evidence/unit-tests.txt), [marketing output](evidence/marketing-tests.txt), and [latest baseline E2E run](https://github.com/Cure-Consulting-Group/iep-and-thrive/actions/runs/32671917063).

## Findings, ordered by consequence

### A01 — Critical: parent-writable billing identity crosses a server trust boundary

`firestore.rules:24` permits an owner to update every field on their user document. The emulator allowed replacing `stripeCustomerId`, changing subscription status/counters, and changing the profile role. `functions/src/customer-portal.ts:60` reads that same `stripeCustomerId` and uses the server Stripe key to mint a billing portal session. An attacker who knows another Stripe customer ID could substitute it. No real Stripe customer or portal session was used in this audit.

The profile-role mutation also exposes the admin UI because `components/auth/ProtectedRoute.tsx` trusts `profile.role`. This is **not** a complete Firestore-admin escalation: the rules use a custom token claim, and the cross-family student read remained denied in the emulator.

Repair: keep billing identity, subscription state, usage accounting, and authorization roles server-owned; allowlist editable profile fields; make UI role checks agree with token claims. Add denial tests and verify deployed rules before expanding use.

### A02 — Critical: signed enrollment PDFs are readable across families

`storage.rules:40` permits every authenticated account to read `signedAgreements/{enrollmentId}`. The signature function writes files to this matching path. The emulator allowed parent A to obtain parent B's synthetic signed-PDF download URL. The HTTP download endpoint's ownership check cannot protect direct Storage access.

Repair: enforce owner/admin authorization at Storage or deny direct reads and use an ownership-checked server endpoint. Review previously issued download tokens and access history when evaluating the deployed situation. Object-name secrecy is not authorization.

### A03 — High: ordinary parent booking and cancellation conflict with rules

`lib/booking-service.ts` updates `availableSlots` directly; `lib/subscription-service.ts` does the same inside tutoring transactions. Rules permit slot writes only to admins. The emulator denied the ordinary-parent slot update. This blocks the intended booking flow if production uses these rules.

Repair: use a server-authoritative transaction for slot reservation, entitlement consumption, ownership checks, and cancellation. Do not simply open slot writes. Generic booking currently splits slot and booking writes; tutoring cancellation also trusts client time/input and does not first establish an uncanceled booking and matching billing cycle.

### A04 — High: activity completion is incorrectly presented as learning evidence

`RootFeature.swift:258` awards literacy completion when Done is tapped, without checking `isTracingComplete`. `SandTrayView.swift:121` leaves that action available on a blank tray. `JourneyFeature.swift:78` then stores `score: 10` and `isCompleted: true`. The score is a reward constant. A child can advance without performing the task.

Repair: distinguish attempt, assisted completion, independent success, and skipped activity. A supportive exit must not manufacture mastery. Store observed performance and assistance separately from Sparks. Existing data cannot retrospectively establish skills that were never observed.

### A05 — High: lesson titles overstate instructional coverage

All literacy definitions route to the same tracing feature. A lesson labeled Making Predictions uses `targetValue: "predict"`, so it asks for a traced token rather than reasoning about a passage. Main idea, retelling, and writing targets have the same structural problem.

`CurriculumClient.swift` supplies no cube target for place value, rounding, or estimation. `MathFeature.State.isCorrect` accepts any positive count for those levels. Equal-groups/arrays lessons validate total count, not grouping or array structure.

Repair: explicitly type activities and use a valid prompt/response/rubric for each skill. Hide unsupported lessons from mastery reporting. Build one real comprehension quest before adding more labeled nodes.

### A06 — High: progress and child identity do not survive the lifecycle reliably

Journey state starts at index zero and zero Sparks. Its on-appear action only loads the level catalog; no production caller restores `fetchProgress` or `fetchSparksTotal`. SwiftData lesson and Sparks records do not carry parent/student IDs. The chosen remote student ID is in memory and defaults again on startup. Sign-out leaves the local profile/progress intact.

Repair: persist active parent/child identity, scope every local record, hydrate the journey before interaction, and define switching, sign-out, offline replay, and conflict behavior. Test cold start, two children on one device, two devices, and account switching against real local persistence.

### A07 — High: anonymous-to-parent migration loses authorization and hides errors

Auth sign-in replaces the anonymous account before `migrateAnonData` reads the old UID's Firestore path. The emulator denied the corresponding old-UID read under the new authenticated UID. Migration converts read failures into nil/empty arrays with `try?`, allowing it to appear successful with nothing copied.

Repair: use a secure linking/migration design that proves both identities or transfers validated local records; preserve visible retry state. Never relax cross-user read rules to make migration succeed.

### A08 — High: instructor-private notes are readable by parents

The attendance rule explicitly relies on the parent UI hiding `notes`. Firestore returns the whole document; the emulator read the synthetic private note successfully. Move private fields to separately authorized documents. UI filtering is presentation, not access control.

### A09 — High: child privacy and parent controls are incomplete

Native onboarding saves/syncs the child's first name and age and logs the first name to Crashlytics. No completed parental-consent gate was found in the reviewed path. Settings exposes sign-out, not an in-app deletion initiation flow. Commerce and settings are labeled parent-facing but are reachable without an implemented parent gate. Anonymous authentication does not make these records anonymous in the ordinary privacy sense.

Repair: design consent, minimization, retention, deletion, and adult controls before adding voice or generative AI. Remove names from diagnostic logs. The existing legal/privacy scaffolds are not evidence of completed compliance review. [FTC rule guidance](https://www.ftc.gov/news-events/news/press-releases/2025/01/ftc-finalizes-changes-childrens-privacy-rule-limiting-companies-ability-monetize-kids-data) and [Apple account-deletion requirements](https://developer.apple.com/support/offering-account-deletion-in-your-app/) support the need for deliberate implementation. This audit is not a legal opinion.

### A10 — High: native scores are not suitable as authoritative assessment records

Owner-writable lesson documents accept arbitrary completion and scores; the emulator confirmed this. The stored schema lacks activity/rubric version, response, assistance, assessment conditions, and assessor provenance. Tracing geometry is not reading comprehension, and cube count is not general math understanding.

Repair: keep self-reported practice telemetry separate from educator-verified assessment. Introduce a versioned skill model and parallel independent assessments. The August master plan's claim that current app events constitute defensible educational-outcome evidence is not supported by the implementation reviewed.

### A11 — High: webhook failure recovery can leave paid state inconsistent

`functions/src/stripe-webhook.ts:154` claims event IDs before processing. Its final catch returns HTTP 200 on processing failure; a retry of that event is treated as an already-processed duplicate. A transient application failure can therefore permanently skip subscription updates without an explicit replay/reset workflow.

Repair: use processing/succeeded/failed state, safe idempotent handlers, appropriate retry responses, and a tested reconciliation/replay path. Signature verification exists and is a positive control; recovery remains incomplete.

### A12 — Medium: native monetization is a prompt, not an enforced entitlement design

StoreKit product lookup, verified purchase handling, restoration, and status observation exist. The paywall appears after 30 Sparks and can be dismissed. Lesson access is not gated on premium. Status observation treats any verified current entitlement as premium rather than explicitly checking supported product IDs. App Store product availability was not verified.

Repair: decide what free and paid access actually mean, place commerce behind adult controls, filter entitlements, and test purchase/pending/refund/revocation states. Web tutoring subscriptions and native app purchases are different offers and do not currently form a shared digital-product entitlement.

### A13 — Medium: static export does not support arbitrary student deep links

The new layout exports only `studentId: '_'`. Firebase rewrites unmatched paths to `/index.html`. In both viewport probes, `/portal/students/synthetic-child/sessions` rendered the marketing homepage with HTTP 200. A Next static export is not automatically a dynamic SPA router. Unknown URLs also return the homepage.

Repair: use a static session route with a query parameter or deploy a routing strategy that serves the correct dynamic page. Test direct navigation, refresh, and internal navigation separately. Return an appropriate not-found response for truly missing pages.

### A14 — Medium: deployment and test gates are incomplete

The deploy workflow compiles Functions but uses the Hosting deploy action; it does not deploy Functions, rules, or indexes. The latest E2E failure did not prevent deployment. CI uses Node 20 while Functions declares Node 22. Dependency scans flag the root and backend lockfiles; some Next server advisories have limited relevance to a static export, whereas backend dependencies need their own reachability review.

Repair: make verification a deployment dependency, document/deploy each required Firebase surface, align runtime versions, and triage dependency updates. Preserve rollback and backup procedures already present in the runbooks.

### A15 — Medium: marketing and evidence claims need reconciliation

The custom domain returned NXDOMAIN from both the local resolver and Cloudflare during this audit. The Firebase hostname returned HTTP 200. The homepage still sells Summer 2026 and references the expired May deadline. The countdown correctly switches to waitlist text; the two tests expect the old text. `/program` had no H1 in the browser probe.

Testimonials and learning-gain claims are hardcoded, but supporting records/permissions were not verified. The master plan assumes a completed inaugural cohort and resulting evidence; dates and plans alone do not establish that it happened. The founder now supplies 10 years in education, a Dean role, and over five years specializing in SPED; earlier collateral uses older credential counts. Reconcile factual copy with approved evidence before a campaign.

Visual inspection of the mobile homepage shows a coherent parent-service brand, a very long acquisition page, and service pricing—not a child-facing product introduction. Preserve the brand assets but give the proposed game a focused demonstration and clear audience.

### A16 — Medium: accessibility and operational evidence remain incomplete

There are useful accessibility labels, but tracing/cube gestures do not demonstrate equivalent non-gesture access; fixed font sizing and animation need Dynamic Type, VoiceOver, switch-control, and reduced-motion testing. Validate audio duration on devices: speech synthesis currently uses a short-lived local synthesizer. The referenced `ambient_forest.mp3` asset needs verification before promising a functioning soundscape.

The legacy web `lib/gmail-service.ts` has a send stub that returns success. Active Functions have a separate email implementation, so this is not evidence that all email is broken. Remove or clearly quarantine obsolete paths. Confirm live lifecycle delivery using an authorized test recipient in a separate release check.

## Repair and validation order

1. **Protect families and billing:** A01, A02, A08, and consent/diagnostic-data issues from A09. Reproduce with denial tests, then verify intended deployment separately.
2. **Make existing promises reliable:** authoritative booking, webhook recovery, deep links, identity isolation, progress restoration, secure migration.
3. **Make learning records honest:** separate rewards from performance, remove unsupported mastery claims, introduce typed activities and versioned rubrics.
4. **Build one complete reading quest:** reviewed text, explicit help, child explanation, fresh independent task, adult evidence view.
5. **Earn expansion:** usability/accessibility checks, consented feasibility pilot, retention/payment validation, and comparative learning evaluation.

This audit introduced documentation and reproducible probes only. The identified product/security defects remain unfixed; nothing was deployed.

## Reproduction notes

Run `npm ci --ignore-scripts`, `npm run test:unit`, and a configured `npm run build`. Public Firebase build values are in `.github/workflows/deploy.yml`; no production secrets are needed for the export. In `functions`, run `npm ci --ignore-scripts` and `npm run build`.

Native verification used `xcodebuild test -project ios/IEPAndThrive.xcodeproj -scheme IEPAndThrive -destination 'platform=iOS Simulator,id=<available-simulator-id>' -skipMacroValidation -skipPackagePluginValidation CODE_SIGNING_ALLOWED=NO`, with a temporary derived-data directory.

For security probes, install `firebase` and `@firebase/rules-unit-testing` into a temporary tools directory, start Firestore/Storage emulators for `demo-iep-audit` at loopback ports 39188/39299, and run [rules-reproduction.cjs](evidence/rules-reproduction.cjs) with `NODE_PATH` pointing to those tools. The probes describe the vulnerable baseline; they intentionally observe allowed actions and are not a passing security regression suite.

Serve the built `out` using Hosting emulator port 39189, with clean URLs and the repository rewrite rule. Run [browser-probe.cjs](evidence/browser-probe.cjs) with `NODE_PATH` pointing to the repository's `node_modules`. The existing marketing suite was run against that same endpoint using installed Chrome. Saved screenshots and JSON describe the baseline, not a redesigned product.

## Expanded review and backlog

The subsequent [full product-direction review](product-direction/README.md) contains 44 findings, 10 epics, 76 detailed tickets, architecture proposals, sequencing, and verification evidence. It includes the local A01/A02 repairs documented in [repair progress](repair-progress.md). This original report retains its baseline observations; consult the expanded packet for the current review handoff.
