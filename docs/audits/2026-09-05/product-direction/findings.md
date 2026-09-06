# Findings — independent learning-product audit

Date: September 5, 2026. Scope: repository and local synthetic verification, including the uncommitted A01/A02 repair. Read the [audit scope and verification limits](README.md) before interpreting severity. Severity reflects consequence, while ticket priority reflects work sequencing. A strategic gap is not a claim that a promised capability was implemented and failed.

[Ticket index](ticket-index.md) · [System map](system-map.md) · [External sources](sources.md)

| Finding | Severity | Evidence class |
| --- | --- | --- |
| [F01 — Three competing business directions remain embedded in the repository](#f01) | High | Strategic misalignment |
| [F02 — Activity labels and validators do not match claimed skills](#f02) | High | Verified source defect |
| [F03 — Reward events manufacture completion and cannot establish mastery](#f03) | High | Verified source defect; inherited native regression evidence |
| [F04 — Local progress, active child identity, and restoration are incomplete](#f04) | High | Verified source defect |
| [F05 — Anonymous migration loses authorization and hides missing data](#f05) | High | Verified source defect; prior emulator denial |
| [F06 — Child setup, adult controls, and diagnostic collection are not aligned](#f06) | High | Verified source gap |
| [F07 — Billing/profile trust repair exists locally; production and historical integrity remain open](#f07) | Critical conditional on deployed baseline | Local repair, not production verified |
| [F08 — Signed-PDF access repair exists locally; issued links need separate review](#f08) | Critical conditional on deployed baseline | Local repair, not production verified |
| [F09 — Private notes are stored in parent-readable documents](#f09) | High | Emulator confirmed for attendance; source-confirmed analogous probe exposure |
| [F10 — Student document authority and downstream identity keys are unsafe](#f10) | High | Emulator confirmed writes; source-confirmed identity risk |
| [F11 — Bookings are both blocked through the UI path and forgeable directly](#f11) | High | Emulator confirmed |
| [F12 — Notification field restrictions and resource audience enforcement are incomplete](#f12) | High | Emulator confirmed |
| [F13 — The staff inquiry pipeline has no authorized data path](#f13) | High | Emulator confirmed |
| [F14 — Parent dashboard query and decode contracts do not match authorization/data](#f14) | High | Emulator confirmed query denial; source schema mismatch |
| [F15 — Intake can falsely claim submission and targets the first child](#f15) | High | Verified source defect |
| [F16 — IEP and report object paths disagree with ownership rules](#f16) | High | IEP emulator confirmed; report source-confirmed mismatch |
| [F17 — Enrollment signatures do not establish approved terms or inquiry ownership](#f17) | High | Verified source defect; endpoint not invoked |
| [F18 — Advertised tutoring purchase CTAs do not complete the checkout contract](#f18) | High | Verified source wiring defect |
| [F19 — Webhook acknowledgment and claim semantics can permanently lose paid updates](#f19) | High | Verified source defect |
| [F20 — Payment identity, invoice-version compatibility, and cycle state need reconciliation](#f20) | High | Verified source risks; deployed API version unverified |
| [F21 — Email lifecycle and calendar side effects lack consistent consent/retry semantics](#f21) | High | Verified source defects; provider delivery unverified |
| [F22 — Public endpoints can amplify unbounded requests into writes and email](#f22) | High | Source-level protection gap; no load test performed |
| [F23 — Environment defaults mix development/testing with production](#f23) | High | Verified configuration defect |
| [F24 — Verification does not gate a complete release](#f24) | High | Verified workflow defect |
| [F25 — Native release configuration is not equivalent to a validated distribution pipeline](#f25) | High | Source risks; archive/store operations unverified |
| [F26 — Dependency advisory debt requires runtime-specific triage](#f26) | High | Current automated advisory scan |
| [F27 — Deployed access, secrets, regional configuration, and security headers are unverified](#f27) | High | Repository inventory plus production unknowns |
| [F28 — Recovery documentation does not establish recoverability or full coverage](#f28) | High | Documentation gap; deployed backups unverified |
| [F29 — Scalability, cost controls, and operational signals are not product-ready](#f29) | Medium | Verified query patterns; unmeasured capacity |
| [F30 — Native accessibility and audio need task-level device validation](#f30) | High for pilot | Source gaps; manual device coverage missing |
| [F31 — Web accessibility has useful components but no complete task evidence](#f31) | Medium | Partial implementation; manual coverage missing |
| [F32 — Native monetization is a dismissible prompt, not a defined entitlement product](#f32) | Medium | Verified source gap |
| [F33 — Content is a useful library without a digital publishing or validity lifecycle](#f33) | High for product direction | Implemented foundation plus new capability gap |
| [F34 — Web architecture serves tutoring operations, not independent learning](#f34) | High for product direction | Product capability gap and verified routing defect |
| [F35 — Independent practitioner use lacks a tenant and sharing boundary](#f35) | High before external practitioner access | New capability gap |
| [F36 — Assessment/report records do not support defensible independent outcome claims](#f36) | High | Verified schema limits; educational validity not established |
| [F37 — Public and strategic claims outpace verified facts](#f37) | Medium | Source inconsistencies; claims evidence unverified |
| [F38 — Test counts overstate critical-path assurance](#f38) | High | Current tests plus coverage inventory |
| [F39 — Deletion, retention, and purpose limitation remain implementation work](#f39) | High | Documented policy, incomplete product controls |
| [F40 — NYC opportunity needs channel validation and current policy qualification](#f40) | High for channel strategy | External current-policy evidence and untested business hypothesis |
| [F41 — Operating ownership and support have not shifted to a software product](#f41) | Medium | Process gap |
| [F42 — Authentication continuation and recovery are incomplete](#f42) | Medium | Verified source gap |
| [F43 — Persistence isolation, sync acknowledgments, and schema evolution need architecture work](#f43) | High | Source-level concurrency/reliability concern; runtime failure not reproduced |
| [F44 — Essential asset and design completion should precede decorative expansion](#f44) | Medium | Verified asset inventory; design QA incomplete |

<a id="f01"></a>

## F01 — Three competing business directions remain embedded in the repository

**Severity:** High. **Evidence class:** Strategic misalignment.

**Observed:** The native PRD prioritizes a sensory game, broad literacy/math, and a frictionless paywall. The August master plan makes the school the business and treats app events as an outcome engine. The web backlog optimizes cohort enrollment and tutoring operations. The user’s current direction is an independently useful learning product supported by educator expertise.

**Consequence:** Without a superseding brief, teams can complete technically valid work that does not test the chosen learner problem or standalone demand. A founder’s Dean/SPED experience is valuable domain input, but neither credentials nor a future school prove software demand.

**Required focus:** Approve one learner/outcome/setting brief, retain tutoring as a separate service, and gate school/institutional expansion on evidence. Reframe engagement as a means to learning, not the primary success claim.

**Source:** [docs/ios-pivot/PRD.md:3](../../../../docs/ios-pivot/PRD.md#L3) · [docs/master-plan.md:15](../../../../docs/master-plan.md#L15) · [docs/tutoring-prd.md:1](../../../../docs/tutoring-prd.md#L1)

**Tickets:** [TASK-LP-001](../../../../docs/tasks/learning-product/TASK-LP-001.md), [TASK-LP-002](../../../../docs/tasks/learning-product/TASK-LP-002.md), [TASK-LP-003](../../../../docs/tasks/learning-product/TASK-LP-003.md), [TASK-LP-005](../../../../docs/tasks/learning-product/TASK-LP-005.md), [TASK-LP-034](../../../../docs/tasks/learning-product/TASK-LP-034.md), [TASK-LP-039](../../../../docs/tasks/learning-product/TASK-LP-039.md), [TASK-LP-072](../../../../docs/tasks/learning-product/TASK-LP-072.md)

<a id="f02"></a>

## F02 — Activity labels and validators do not match claimed skills

**Severity:** High. **Evidence class:** Verified source defect.

**Observed:** All literacy categories route to the tracing feature, including predict, retell, main-idea, and writing targets. Math targetCount is nil for several abstract skills and isCorrect accepts any positive count; grouping/arrays use total-count checks. The catalog has 25 literacy and 13 math definitions, not 38 implemented instructional interactions.

**Consequence:** A child can receive apparent success for an unrelated task. This undermines the proposed reading product and makes mastery statements unsafe even if the UI is engaging.

**Required focus:** Publish only supported activity types, preserve tracing/counting as accurately labeled practice, and implement one complete passage-based quest with an explicit response and rubric before adding nodes.

**Source:** [ios/IEPAndThrive/Core/Data/CurriculumClient.swift:82](../../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift#L82) · [ios/IEPAndThrive/Features/Root/RootFeature.swift:226](../../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L226) · [ios/IEPAndThrive/Features/Math/MathFeature.swift:26](../../../../ios/IEPAndThrive/Features/Math/MathFeature.swift#L26)

**Tickets:** [TASK-LP-023](../../../../docs/tasks/learning-product/TASK-LP-023.md), [TASK-LP-024](../../../../docs/tasks/learning-product/TASK-LP-024.md), [TASK-LP-025](../../../../docs/tasks/learning-product/TASK-LP-025.md), [TASK-LP-027](../../../../docs/tasks/learning-product/TASK-LP-027.md), [TASK-LP-028](../../../../docs/tasks/learning-product/TASK-LP-028.md), [TASK-LP-029](../../../../docs/tasks/learning-product/TASK-LP-029.md), [TASK-LP-031](../../../../docs/tasks/learning-product/TASK-LP-031.md)

<a id="f03"></a>

## F03 — Reward events manufacture completion and cannot establish mastery

**Severity:** High. **Evidence class:** Verified source defect; inherited native regression evidence.

**Observed:** RootFeature handles literacy doneTapped by popping the screen and emitting missionComplete without checking tracing success. Journey awards ten Sparks and stores isCompleted true and score 10. Its local and remote save failures are logged after UI success, and repeated activity completion creates additional records.

**Consequence:** Blank or assisted activity can look like independent success. Historical data cannot recover observations that were never collected; repeated completions can inflate summary counts.

**Required focus:** Distinguish attempt/skip/help/independent outcomes, require the relevant validator, make events idempotent, and separate rewards from evidence. Label old records as legacy practice telemetry.

**Source:** [ios/IEPAndThrive/Features/Root/RootFeature.swift:258](../../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L258) · [ios/IEPAndThrive/Features/Journey/JourneyFeature.swift:78](../../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift#L78) · [lib/ios-progress.ts:172](../../../../lib/ios-progress.ts#L172)

**Tickets:** [TASK-LP-023](../../../../docs/tasks/learning-product/TASK-LP-023.md), [TASK-LP-025](../../../../docs/tasks/learning-product/TASK-LP-025.md), [TASK-LP-029](../../../../docs/tasks/learning-product/TASK-LP-029.md), [TASK-LP-032](../../../../docs/tasks/learning-product/TASK-LP-032.md), [TASK-LP-065](../../../../docs/tasks/learning-product/TASK-LP-065.md)

<a id="f04"></a>

## F04 — Local progress, active child identity, and restoration are incomplete

**Severity:** High. **Evidence class:** Verified source defect.

**Observed:** SwiftData models have no parent/student scope. DatabaseClient fetches the first profile and sums all Sparks. Journey onAppear only loads levels; its index and Sparks start at zero. Root persists neither the selected student nor hydrated history; sign-out leaves local records and most visible journey state intact.

**Consequence:** Two children/accounts on one device can see or attribute the wrong data, and cold starts lose apparent progress. This is a core product trust issue, not optional polish.

**Required focus:** Scope every record, persist active identity, hydrate before interaction, clear/protect state on sign-out, and test actual local stores across two children, accounts, devices, and restarts.

**Source:** [ios/IEPAndThrive/Core/Data/Models.swift:1](../../../../ios/IEPAndThrive/Core/Data/Models.swift#L1) · [ios/IEPAndThrive/Core/Data/DatabaseClient.swift:6](../../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift#L6) · [ios/IEPAndThrive/Features/Journey/JourneyFeature.swift:44](../../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift#L44) · [ios/IEPAndThrive/Features/Root/RootFeature.swift:243](../../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L243)

**Tickets:** [TASK-LP-017](../../../../docs/tasks/learning-product/TASK-LP-017.md), [TASK-LP-018](../../../../docs/tasks/learning-product/TASK-LP-018.md), [TASK-LP-020](../../../../docs/tasks/learning-product/TASK-LP-020.md), [TASK-LP-031](../../../../docs/tasks/learning-product/TASK-LP-031.md), [TASK-LP-068](../../../../docs/tasks/learning-product/TASK-LP-068.md)

<a id="f05"></a>

## F05 — Anonymous migration loses authorization and hides missing data

**Severity:** High. **Evidence class:** Verified source defect; prior emulator denial.

**Observed:** AuthClient signs into a different Firebase user before migrateAnonData reads the old UID. That read is denied by owner rules. The migration uses try? and empty-array fallback; root clears pending migration before a visible durable success receipt and treats student-fetch failure as an empty roster.

**Consequence:** Progress can disappear or be assigned to a fallback child, while logs report a completed migration. Late fetches are not tied to a current identity generation.

**Required focus:** Use secure account linking or an explicit proven transfer of attributed local data; preserve retry state and distinguish failed reads from a genuinely empty account. Do not relax cross-user rules.

**Source:** [ios/IEPAndThrive/Core/Auth/AuthClient.swift:83](../../../../ios/IEPAndThrive/Core/Auth/AuthClient.swift#L83) · [ios/IEPAndThrive/Core/Data/FirestoreClient.swift:100](../../../../ios/IEPAndThrive/Core/Data/FirestoreClient.swift#L100) · [ios/IEPAndThrive/Features/Root/RootFeature.swift:151](../../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L151)

**Tickets:** [TASK-LP-018](../../../../docs/tasks/learning-product/TASK-LP-018.md), [TASK-LP-019](../../../../docs/tasks/learning-product/TASK-LP-019.md), [TASK-LP-068](../../../../docs/tasks/learning-product/TASK-LP-068.md), [TASK-LP-075](../../../../docs/tasks/learning-product/TASK-LP-075.md)

<a id="f06"></a>

## F06 — Child setup, adult controls, and diagnostic collection are not aligned

**Severity:** High. **Evidence class:** Verified source gap.

**Observed:** Onboarding collects and syncs child name/age/focus and explicitly logs firstName. Firebase is configured on app startup and Crashlytics is linked. Settings and the threshold paywall are reachable from the child journey without an implemented adult gate; the root enables reducer state printing.

**Consequence:** The shipped collection path does not demonstrate the consent and privacy promises in documentation. A parental gate is distinct from a verified data-consent process. Third-party SDK collection must be checked in real release traffic.

**Required focus:** Remove explicit sensitive logs immediately; implement minimal adult-led setup, purpose-limited consent enforcement, contextual SDK collection, and adult controls before a child pilot. See sources S02, S04, and S05.

**Source:** [ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift:78](../../../../ios/IEPAndThrive/Features/Onboarding/OnboardingFeature.swift#L78) · [ios/IEPAndThrive/IEPAndThriveApp.swift:17](../../../../ios/IEPAndThrive/IEPAndThriveApp.swift#L17) · [ios/IEPAndThrive/Features/Root/RootFeature.swift:30](../../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L30)

**Tickets:** [TASK-LP-015](../../../../docs/tasks/learning-product/TASK-LP-015.md), [TASK-LP-016](../../../../docs/tasks/learning-product/TASK-LP-016.md), [TASK-LP-060](../../../../docs/tasks/learning-product/TASK-LP-060.md), [TASK-LP-064](../../../../docs/tasks/learning-product/TASK-LP-064.md)

<a id="f07"></a>

## F07 — Billing/profile trust repair exists locally; production and historical integrity remain open

**Severity:** Critical conditional on deployed baseline. **Evidence class:** Local repair, not production verified.

**Observed:** The previous turn allowlisted parent profile edits and derives web roles from admin token claims. Seventeen local security tests plus four auth cases pass. CustomerPortal and subscriptionCheckout still read the historical users/{uid}.stripeCustomerId mapping. No deployed rules comparison or historical mapping verification occurred.

**Consequence:** Local denial fixes prevent future client edits when deployed, but cannot prove that existing customer IDs were never tampered with. A Hosting-only deploy does not deliver the rules.

**Required focus:** Review/release the coordinated repair, verify synthetic production canaries, and reconcile historical mappings through authorized Stripe evidence. Keep compromised/unverified mappings out of trusted billing flows until resolved.

**Source:** [firestore.rules:21](../../../../firestore.rules#L21) · [lib/auth-context.tsx:86](../../../../lib/auth-context.tsx#L86) · [functions/src/customer-portal.ts:59](../../../../functions/src/customer-portal.ts#L59) · [.github/workflows/deploy.yml:52](../../../../.github/workflows/deploy.yml#L52)

**Tickets:** [TASK-LP-006](../../../../docs/tasks/learning-product/TASK-LP-006.md), [TASK-LP-050](../../../../docs/tasks/learning-product/TASK-LP-050.md)

<a id="f08"></a>

## F08 — Signed-PDF access repair exists locally; issued links need separate review

**Severity:** Critical conditional on deployed baseline. **Evidence class:** Local repair, not production verified.

**Observed:** Storage rules now deny all direct signedAgreements client reads/writes. The existing getSignedAgreementPdf endpoint checks owner or admin before issuing a ten-minute signed URL. The vulnerable baseline allowed all authenticated clients to obtain another family’s file URL. Issued download tokens and deployed configuration were not inspected.

**Consequence:** The code fix is useful, but production exposure cannot be declared closed and existing bearer links are not invalidated by changing rules alone.

**Required focus:** Deploy and verify the rules with the authorized endpoint flow, then review/revoke affected durable tokens where appropriate. Preserve signed-record history and restricted investigation evidence.

**Source:** [storage.rules:39](../../../../storage.rules#L39) · [functions/src/e-signature/index.ts:203](../../../../functions/src/e-signature/index.ts#L203) · [docs/audits/2026-09-05/repair-progress.md:20](../../../../docs/audits/2026-09-05/repair-progress.md#L20)

**Tickets:** [TASK-LP-006](../../../../docs/tasks/learning-product/TASK-LP-006.md)

<a id="f09"></a>

## F09 — Private notes are stored in parent-readable documents

**Severity:** High. **Evidence class:** Emulator confirmed for attendance; source-confirmed analogous probe exposure.

**Observed:** The extended emulator probe reads synthetic attendance.notes as the owning parent. ProbeResult also calls notes instructor-private while probeResults rules permit owner reads. Assessment and subtest notes likewise need explicit privacy classification rather than assumed UI redaction.

**Consequence:** Any allowed document read returns its private fields, including through SDKs outside the portal. Moving only new notes leaves old copies exposed; generated reports and emails can also leak migrated fields if readers are not updated.

**Required focus:** Separate private storage, migrate and remove legacy copies, update all staff/parent readers, and enforce restrictive access during the transition. Treat assessment-note privacy as a classification decision, not an already-proven private intent.

**Source:** [lib/attendance-service.ts:9](../../../../lib/attendance-service.ts#L9) · [lib/probe-service.ts:17](../../../../lib/probe-service.ts#L17) · [lib/assessment-service.ts:36](../../../../lib/assessment-service.ts#L36) · [firestore.rules:99](../../../../firestore.rules#L99)

**Tickets:** [TASK-LP-007](../../../../docs/tasks/learning-product/TASK-LP-007.md), [TASK-LP-046](../../../../docs/tasks/learning-product/TASK-LP-046.md)

<a id="f10"></a>

## F10 — Student document authority and downstream identity keys are unsafe

**Severity:** High. **Evidence class:** Emulator confirmed writes; source-confirmed identity risk.

**Observed:** The extended probe changes a student’s enrollmentStatus, parentId, and id under an owner path. Student-service projections spread document data after trusted path IDs. Flat attendance/probe/assessment keys use studentId alone, although native studentId default is reused by different accounts.

**Consequence:** Client-controlled state can influence service eligibility and lifecycle processing; denormalized identity can override trusted values. Flat IDs are vulnerable to collisions if reused native IDs enter staff workflows. Actual production collisions were not inspected.

**Required focus:** Protect server enrollment and identity fields, derive identity from paths, and use canonical fully qualified learner keys. Migrate existing IDs with a reviewable map rather than assuming global uniqueness.

**Source:** [firestore.rules:35](../../../../firestore.rules#L35) · [lib/student-service.ts:58](../../../../lib/student-service.ts#L58) · [lib/assessment-service.ts:55](../../../../lib/assessment-service.ts#L55) · [lib/attendance-service.ts:77](../../../../lib/attendance-service.ts#L77)

**Tickets:** [TASK-LP-008](../../../../docs/tasks/learning-product/TASK-LP-008.md), [TASK-LP-014](../../../../docs/tasks/learning-product/TASK-LP-014.md), [TASK-LP-017](../../../../docs/tasks/learning-product/TASK-LP-017.md), [TASK-LP-046](../../../../docs/tasks/learning-product/TASK-LP-046.md), [TASK-LP-076](../../../../docs/tasks/learning-product/TASK-LP-076.md)

<a id="f11"></a>

## F11 — Bookings are both blocked through the UI path and forgeable directly

**Severity:** High. **Evidence class:** Emulator confirmed.

**Observed:** The extended probe creates a confirmed booking with a nonexistent slot and then changes its owner/recipient. Rules only check parentId on create and the old parentId on update. Normal booking tries to write admin-only slots. Tutoring cancellation trusts client-supplied identity/time and can decrement repeatedly without reading the booking first.

**Consequence:** Legitimate booking fails while attackers can create trigger input. Booking emails and calendar integration consume these client-writable fields. No live invitation or email was sent in the audit.

**Required focus:** Use server transactions for reservation/credit/cancel/reschedule and server-derived recipients/times. Deny arbitrary booking writes, protect original-cycle accounting, and use a durable side-effect outbox.

**Source:** [firestore.rules:61](../../../../firestore.rules#L61) · [lib/booking-service.ts:142](../../../../lib/booking-service.ts#L142) · [lib/subscription-service.ts:146](../../../../lib/subscription-service.ts#L146) · [functions/src/booking-emails.ts:35](../../../../functions/src/booking-emails.ts#L35)

**Tickets:** [TASK-LP-042](../../../../docs/tasks/learning-product/TASK-LP-042.md), [TASK-LP-043](../../../../docs/tasks/learning-product/TASK-LP-043.md), [TASK-LP-044](../../../../docs/tasks/learning-product/TASK-LP-044.md)

<a id="f12"></a>

## F12 — Notification field restrictions and resource audience enforcement are incomplete

**Severity:** High. **Evidence class:** Emulator confirmed.

**Observed:** The extended probe alters notification text/name, adds an arbitrary field, and sets read to a string while preserving the few compared fields. It reads an enrolled resource without enrollment. Resource download tracking attempts an update denied to parents; the UI catches that error and still opens the URL.

**Consequence:** Notification content integrity and resource audience controls are weaker than comments imply. Download metrics are inaccurate and durable file URLs may bypass later access revocation.

**Required focus:** Use an affectedKeys allowlist with types for read status, authorize resources/files through trusted access state, and move counters to bounded server telemetry if they are needed.

**Source:** [firestore.rules:164](../../../../firestore.rules#L164) · [app/portal/resources/page.tsx:31](../../../../app/portal/resources/page.tsx#L31) · [lib/resource-service.ts:115](../../../../lib/resource-service.ts#L115) · [storage.rules:15](../../../../storage.rules#L15)

**Tickets:** [TASK-LP-009](../../../../docs/tasks/learning-product/TASK-LP-009.md), [TASK-LP-047](../../../../docs/tasks/learning-product/TASK-LP-047.md)

<a id="f13"></a>

## F13 — The staff inquiry pipeline has no authorized data path

**Severity:** High. **Evidence class:** Emulator confirmed.

**Observed:** PipelinePage queries and updates enrollmentInquiries directly. No Firestore match authorizes this collection, including for admin tokens; the extended emulator probe confirms permission-denied. The onSnapshot listener has no error callback to leave its loading state.

**Consequence:** Staff can see a permanently loading operational pipeline while enrollment forms continue creating server records. Forms, webhook, and UI also use submittedAt, status, and pipelineStage inconsistently.

**Required focus:** Provide a restricted staff query/transition contract, expose errors, and unify enrollment state and payment associations while keeping family inquiries private.

**Source:** [app/admin/pipeline/page.tsx:51](../../../../app/admin/pipeline/page.tsx#L51) · [functions/src/enroll.ts:80](../../../../functions/src/enroll.ts#L80) · [functions/src/stripe-webhook.ts:306](../../../../functions/src/stripe-webhook.ts#L306) · [firestore.rules:1](../../../../firestore.rules#L1)

**Tickets:** [TASK-LP-045](../../../../docs/tasks/learning-product/TASK-LP-045.md)

<a id="f14"></a>

## F14 — Parent dashboard query and decode contracts do not match authorization/data

**Severity:** High. **Evidence class:** Emulator confirmed query denial; source schema mismatch.

**Observed:** Attendance/report summary queries use studentId but omit the parentId predicate required by rules; the extended probes confirm denial. Probe/portfolio helpers can turn failures into null. The active probe collection is probeResults (some comments still say probes); capturedAt is typed as a string in the portal projection but written as a Firestore timestamp.

**Consequence:** An owner can see missing or incomplete progress instead of an explicit authorization/index/schema error. Broadening rules to make queries work would create a new exposure.

**Required focus:** Use trusted learner/parent filters, shared runtime decoding, appropriate indexes, bounded queries, and distinct empty/error/stale states. Do not report an active collection-name mismatch where only stale comments differ.

**Source:** [lib/portal-progress.ts:138](../../../../lib/portal-progress.ts#L138) · [lib/portal-progress.ts:43](../../../../lib/portal-progress.ts#L43) · [lib/portal-progress.ts:210](../../../../lib/portal-progress.ts#L210) · [lib/probe-service.ts:91](../../../../lib/probe-service.ts#L91)

**Tickets:** [TASK-LP-032](../../../../docs/tasks/learning-product/TASK-LP-032.md), [TASK-LP-037](../../../../docs/tasks/learning-product/TASK-LP-037.md), [TASK-LP-047](../../../../docs/tasks/learning-product/TASK-LP-047.md)

<a id="f15"></a>

## F15 — Intake can falsely claim submission and targets the first child

**Severity:** High. **Evidence class:** Verified source defect.

**Observed:** Intake chooses snap.docs[0], loads only submitted/started flags rather than draft fields, logs the full intake object, and calls setSubmitted(true) after a caught save error or when no student ID exists. No explicit child picker binds the form.

**Consequence:** Families may believe diagnoses, medications, emergency contacts, and consent information were received when nothing persisted, or may submit for the wrong child. The full-payload log exposes unnecessary sensitive data.

**Required focus:** Make intake child-specific with durable draft restoration, acknowledged submission, recoverable errors, and payload-free logs. Keep this service intake separate from minimal digital setup.

**Source:** [app/portal/intake/page.tsx:192](../../../../app/portal/intake/page.tsx#L192) · [app/portal/intake/page.tsx:304](../../../../app/portal/intake/page.tsx#L304) · [app/portal/intake/page.tsx:355](../../../../app/portal/intake/page.tsx#L355)

**Tickets:** [TASK-LP-036](../../../../docs/tasks/learning-product/TASK-LP-036.md)

<a id="f16"></a>

## F16 — IEP and report object paths disagree with ownership rules

**Severity:** High. **Evidence class:** IEP emulator confirmed; report source-confirmed mismatch.

**Observed:** Profile IEP uploads use iep-documents/{uid}, which is unmatched by rules covering ieps/{uid}; the extended probe confirms denial. Report uploads use reports/{studentId}, while Storage rules interpret that segment as userId. Parent file delivery currently relies on stored download URLs.

**Consequence:** Legitimate upload/direct-read operations fail or depend on durable bearer links rather than the intended authorization. Metadata/file cleanup is not atomic.

**Required focus:** Create one owner-scoped storage contract, migrate legacy paths and metadata, use safe authorized delivery for sensitive documents, and validate type/size and orphan cleanup.

**Source:** [app/portal/profile/page.tsx:71](../../../../app/portal/profile/page.tsx#L71) · [lib/report-service.ts:64](../../../../lib/report-service.ts#L64) · [storage.rules:23](../../../../storage.rules#L23)

**Tickets:** [TASK-LP-013](../../../../docs/tasks/learning-product/TASK-LP-013.md)

<a id="f17"></a>

## F17 — Enrollment signatures do not establish approved terms or inquiry ownership

**Severity:** High. **Evidence class:** Verified source defect; endpoint not invoked.

**Observed:** The handler verifies the Firebase token but validates documentHash only against the client’s own documentText. It accepts documentVersion and inquiryId without canonical document lookup or ownership validation. PDF generation catches image decode failure and inserts a placeholder; the successful record can still be saved.

**Consequence:** A signed artifact can contain arbitrary terms or an unrelated inquiry reference. This is a provenance/integrity defect; this audit does not determine legal enforceability or inspect actual agreements.

**Required focus:** Use canonical server documents, verified inquiry binding, explicit assent, strict image validation, idempotent signing, and immutable history with partial-write recovery.

**Source:** [functions/src/e-signature/index.ts:76](../../../../functions/src/e-signature/index.ts#L76) · [functions/src/e-signature/index.ts:128](../../../../functions/src/e-signature/index.ts#L128) · [functions/src/e-signature/pdf-generator.ts:178](../../../../functions/src/e-signature/pdf-generator.ts#L178)

**Tickets:** [TASK-LP-012](../../../../docs/tasks/learning-product/TASK-LP-012.md)

<a id="f18"></a>

## F18 — Advertised tutoring purchase CTAs do not complete the checkout contract

**Severity:** High. **Evidence class:** Verified source wiring defect.

**Observed:** PricingCard navigates directly to its href and does not fetch the JSON response. Subscription checkout requires a bearer header that a normal anchor does not attach. Drop-in and IEP-review links send product= values to stripeCheckout, which only accepts program full/reading/math and payment type deposit/balance.

**Consequence:** Visitors can reach JSON/401/400 responses instead of a checkout experience. Link-existence tests can pass while the purchase path fails. Current recurring-slot and pause claims also need verification against actual fulfillment.

**Required focus:** Use a shared authenticated checkout controller, supported server SKUs, idempotent attempts, preserved login continuation, and a test-mode end-to-end fulfillment check.

**Source:** [components/ui/PricingCard.tsx:83](../../../../components/ui/PricingCard.tsx#L83) · [components/sections/TutoringPricing.tsx:48](../../../../components/sections/TutoringPricing.tsx#L48) · [components/ui/IEPReviewBanner.tsx:23](../../../../components/ui/IEPReviewBanner.tsx#L23) · [functions/src/subscription-checkout.ts:57](../../../../functions/src/subscription-checkout.ts#L57)

**Tickets:** [TASK-LP-038](../../../../docs/tasks/learning-product/TASK-LP-038.md), [TASK-LP-050](../../../../docs/tasks/learning-product/TASK-LP-050.md), [TASK-LP-069](../../../../docs/tasks/learning-product/TASK-LP-069.md)

<a id="f19"></a>

## F19 — Webhook acknowledgment and claim semantics can permanently lose paid updates

**Severity:** High. **Evidence class:** Verified source defect.

**Observed:** claimEvent creates webhookEventLog/{id} before processing. A later exception returns HTTP 200, and the next delivery of that ID is classified as a duplicate. Some inner handlers also catch and acknowledge failures. No tested replay/status lifecycle is implemented.

**Consequence:** Transient write or provider failures can leave customers incorrectly paid/unpaid and cannot be repaired by merely resending the event. Stripe’s documented retry and ordering behavior requires independently idempotent handlers (source S06).

**Required focus:** Use durable processing states/leases, safe non-success responses or accepted-work queues, idempotent billing writes, an outbox, and a restricted reconciliation/replay workflow.

**Source:** [functions/src/stripe-webhook.ts:154](../../../../functions/src/stripe-webhook.ts#L154) · [functions/src/stripe-webhook.ts:946](../../../../functions/src/stripe-webhook.ts#L946)

**Tickets:** [TASK-LP-048](../../../../docs/tasks/learning-product/TASK-LP-048.md), [TASK-LP-053](../../../../docs/tasks/learning-product/TASK-LP-053.md)

<a id="f20"></a>

## F20 — Payment identity, invoice-version compatibility, and cycle state need reconciliation

**Severity:** High. **Evidence class:** Verified source risks; deployed API version unverified.

**Observed:** One-time checkout has no authenticated enrollment reference and the webhook matches by email or creates a random user doc. Subscription checkout can create a new customer after lookup failure. Invoice handlers cast to legacy invoice.subscription; installed Stripe types use parent.subscription_details.subscription. Paid handlers reset usage without a documented event-order/cycle ledger.

**Consequence:** Current-version invoice events may be skipped, old events may regress state, and paid records may not belong to the Auth UID the portal uses. Exact deployed impact depends on webhook/API version and historical data.

**Required focus:** Pin supported event versions, implement typed adapters and cycle identities, bind checkout to verified account/enrollment, prevent duplicates, and reconcile ambiguous legacy mappings.

**Source:** [functions/src/stripe-webhook.ts:302](../../../../functions/src/stripe-webhook.ts#L302) · [functions/src/stripe-webhook.ts:673](../../../../functions/src/stripe-webhook.ts#L673) · [functions/src/subscription-checkout.ts:124](../../../../functions/src/subscription-checkout.ts#L124) · [functions/package.json:22](../../../../functions/package.json#L22)

**Tickets:** [TASK-LP-014](../../../../docs/tasks/learning-product/TASK-LP-014.md), [TASK-LP-045](../../../../docs/tasks/learning-product/TASK-LP-045.md), [TASK-LP-049](../../../../docs/tasks/learning-product/TASK-LP-049.md), [TASK-LP-050](../../../../docs/tasks/learning-product/TASK-LP-050.md), [TASK-LP-053](../../../../docs/tasks/learning-product/TASK-LP-053.md)

<a id="f21"></a>

## F21 — Email lifecycle and calendar side effects lack consistent consent/retry semantics

**Severity:** High. **Evidence class:** Verified source defects; provider delivery unverified.

**Observed:** Guide drip sends through the default transactional path without a user preference binding and advances its phase even if sendEmail returns false. The shared preference lookup proceeds after an error. Booking calendar creation catches failures as null; deterministic side-effect recovery is absent. Some newer lifecycle functions do track sent flags, but that is not a common transactional delivery system.

**Consequence:** Messages can be lost, repeated, or sent despite unresolved marketing preferences. Calendar state can diverge from bookings without an actionable operator signal. The active Gmail implementation does report missing credentials; not all email is a success-returning stub.

**Required focus:** Classify every message, implement a durable delivery ledger with suppression and retry policy, isolate test recipients, and reconcile calendar events by stable identity.

**Source:** [functions/src/summer-guide-drip.ts:72](../../../../functions/src/summer-guide-drip.ts#L72) · [functions/src/email-service.ts:126](../../../../functions/src/email-service.ts#L126) · [functions/src/calendar-sync.ts:17](../../../../functions/src/calendar-sync.ts#L17) · [functions/src/attendance-notifications.ts:170](../../../../functions/src/attendance-notifications.ts#L170)

**Tickets:** [TASK-LP-044](../../../../docs/tasks/learning-product/TASK-LP-044.md), [TASK-LP-063](../../../../docs/tasks/learning-product/TASK-LP-063.md), [TASK-LP-066](../../../../docs/tasks/learning-product/TASK-LP-066.md)

<a id="f22"></a>

## F22 — Public endpoints can amplify unbounded requests into writes and email

**Severity:** High. **Evidence class:** Source-level protection gap; no load test performed.

**Observed:** Contact/enroll validate minimum lengths but lack application maximums. Guide capture accepts repeated leads and sends immediately. Public checkout endpoints create sessions; no common App Check verification, rate limiter, request idempotency, or explicit maxInstances controls were found in principal handlers. CORS contains an unanchored localhost regex.

**Consequence:** Bots or repeated submissions can consume quota, send unwanted email, or create duplicate records. This is an application control gap; platform quotas and production gateway controls were not inspected.

**Required focus:** Add bounded validation, exact origins, safe public-form friction/quotas, explicit idempotency, durable capture-before-send, cost limits, and accessible recovery. Keep authorization separate from bot signals.

**Source:** [functions/src/contact.ts:12](../../../../functions/src/contact.ts#L12) · [functions/src/enroll.ts:15](../../../../functions/src/enroll.ts#L15) · [functions/src/summer-guide-capture.ts:53](../../../../functions/src/summer-guide-capture.ts#L53) · [functions/src/stripe-checkout.ts:11](../../../../functions/src/stripe-checkout.ts#L11)

**Tickets:** [TASK-LP-010](../../../../docs/tasks/learning-product/TASK-LP-010.md)

<a id="f23"></a>

## F23 — Environment defaults mix development/testing with production

**Severity:** High. **Evidence class:** Verified configuration defect.

**Observed:** Functions URLs hardcode the production project and select local endpoints only for window.hostname localhost. lib/firebase.ts has no emulator connections. .firebaserc defaults to production, native plist points to production, and Playwright defaults to the production site. Test fixtures include predictable credential fallbacks including admin; validity was not tested.

**Consequence:** Local/staging activities can accidentally use production identity/data or side effects. The existing audit avoided this with loopback-only synthetic probes, but that safety is not built into the normal workflow.

**Required focus:** Introduce explicit all-service environment manifests, refuse mixed targets, isolate staging recipients/payments, and rotate/remove production test defaults through authorized operations.

**Source:** [lib/functions-config.ts:15](../../../../lib/functions-config.ts#L15) · [lib/firebase.ts:2](../../../../lib/firebase.ts#L2) · [.firebaserc:3](../../../../.firebaserc#L3) · [playwright.config.ts:3](../../../../playwright.config.ts#L3) · [tests/e2e/fixtures.ts:3](../../../../tests/e2e/fixtures.ts#L3)

**Tickets:** [TASK-LP-011](../../../../docs/tasks/learning-product/TASK-LP-011.md), [TASK-LP-054](../../../../docs/tasks/learning-product/TASK-LP-054.md)

<a id="f24"></a>

## F24 — Verification does not gate a complete release

**Severity:** High. **Evidence class:** Verified workflow defect.

**Observed:** deploy.yml builds web/Functions but uses only the Hosting action. Rules, indexes, and Functions are not deployed there. E2E is a separate production-targeted workflow and does not block Hosting. CI Node is 20 while Functions declares 22. Native validation is post-merge or label-triggered and iOS release does not depend on test results.

**Consequence:** A green deployment can publish code that depends on undeployed rules/functions or already-failing user paths. Cost controls are reasonable but need an explicit release gate.

**Required focus:** Promote verified artifacts through staging; sequence indexes/functions/rules/web with compatibility checks and retain an independently reviewed emergency repair path.

**Source:** [.github/workflows/deploy.yml:52](../../../../.github/workflows/deploy.yml#L52) · [.github/workflows/e2e.yml:16](../../../../.github/workflows/e2e.yml#L16) · [.github/workflows/ios-ci.yml:3](../../../../.github/workflows/ios-ci.yml#L3) · [.github/workflows/ios-release.yml:14](../../../../.github/workflows/ios-release.yml#L14)

**Tickets:** [TASK-LP-055](../../../../docs/tasks/learning-product/TASK-LP-055.md), [TASK-LP-062](../../../../docs/tasks/learning-product/TASK-LP-062.md), [TASK-LP-069](../../../../docs/tasks/learning-product/TASK-LP-069.md)

<a id="f25"></a>

## F25 — Native release configuration is not equivalent to a validated distribution pipeline

**Severity:** High. **Evidence class:** Source risks; archive/store operations unverified.

**Observed:** Fastlane requests latest_testflight_build_number before creating the App Store Connect API key. Gemfile.lock is ignored. Info.plist has literal version/build values while project.yml comments assume generated replacements. AppIcon contains no filename. Signing, product availability, archive metadata, and upload success were not established by simulator tests.

**Consequence:** Release automation can fail or ship incorrect metadata/assets even when native code builds. The auth ordering is a concrete source concern; actual runner credentials or final archive behavior require validation.

**Required focus:** Authenticate before remote actions, lock release dependencies, inspect final archived values/assets, serialize numbering, and run a controlled TestFlight rehearsal after safety gates.

**Source:** [ios/fastlane/Fastfile:40](../../../../ios/fastlane/Fastfile#L40) · [ios/fastlane/Fastfile:48](../../../../ios/fastlane/Fastfile#L48) · [.gitignore:49](../../../../.gitignore#L49) · [ios/project.yml:47](../../../../ios/project.yml#L47)

**Tickets:** [TASK-LP-056](../../../../docs/tasks/learning-product/TASK-LP-056.md)

<a id="f26"></a>

## F26 — Dependency advisory debt requires runtime-specific triage

**Severity:** High. **Evidence class:** Current automated advisory scan.

**Observed:** The fresh npm production scans report 23 root packages (2 critical, 8 high, 12 moderate, 1 low) and 22 Functions packages (2 critical, 5 high, 13 moderate, 2 low). Complete JSON is preserved in evidence. Critical package names include protobufjs and websocket-driver. These counts include transitive issues, not confirmed exploitable application paths.

**Consequence:** Unreviewed dependencies create release risk, but indiscriminate forced upgrades can break a static-export app or payment backend. Server-only Next issues need different treatment from deployed Functions runtime paths.

**Required focus:** Create a reachability/remediation ledger, patch supported dependency families with integration checks, remove unused legacy runtime packages, and record time-bounded justified exceptions.

**Source:** [package-lock.json:1](../../../../package-lock.json#L1) · [functions/package-lock.json:1](../../../../functions/package-lock.json#L1) · [package.json:32](../../../../package.json#L32)

**Tickets:** [TASK-LP-057](../../../../docs/tasks/learning-product/TASK-LP-057.md)

<a id="f27"></a>

## F27 — Deployed access, secrets, regional configuration, and security headers are unverified

**Severity:** High. **Evidence class:** Repository inventory plus production unknowns.

**Observed:** Email/calendar/preview secrets are read through environment variables while Stripe uses defineSecret. Backup scripts grant broad roles to a default service account. Documentation cites us-east4 while most functions use us-east1. Hosting has no custom security-header configuration in firebase.json. Actual IAM, bound secrets, project regions, platform headers, and App Check settings were not inspected.

**Consequence:** Operational protection cannot be inferred from source comments or successful builds. Mixed regions can affect latency/cost; missing explicit header configuration is not proof every deployed response lacks security headers.

**Required focus:** Inventory actual metadata and least privilege, verify secret binding/rotation and exact origins, review effective headers/CSP with Firebase auth compatibility, and document accepted configuration.

**Source:** [functions/src/email-service.ts:66](../../../../functions/src/email-service.ts#L66) · [functions/src/calendar-sync.ts:14](../../../../functions/src/calendar-sync.ts#L14) · [scripts/setup-firestore-backups.sh:59](../../../../scripts/setup-firestore-backups.sh#L59) · [firebase.json:19](../../../../firebase.json#L19)

**Tickets:** [TASK-LP-058](../../../../docs/tasks/learning-product/TASK-LP-058.md)

<a id="f28"></a>

## F28 — Recovery documentation does not establish recoverability or full coverage

**Severity:** High. **Evidence class:** Documentation gap; deployed backups unverified.

**Observed:** Backup/restore scripts and runbooks are useful, but the audit did not inspect recent successful exports or perform a restore. Firestore backups exclude Auth identities and Storage objects. The low cost estimate does not demonstrate retained-copy/read/export accounting. Deletion suppression and replay-safe restoration are not implemented.

**Consequence:** A restored database can reference missing files, revive deleted child data, or cause historical messages/payment processing to replay. A backup job’s existence is not recovery evidence.

**Required focus:** Approve RPO/RTO, verify freshness, include file/identity/config recovery, rehearse with synthetic data, and apply deletion manifests before reopening access or side effects.

**Source:** [docs/runbooks/firestore-backups.md:67](../../../../docs/runbooks/firestore-backups.md#L67) · [docs/runbooks/firestore-restore.md:79](../../../../docs/runbooks/firestore-restore.md#L79) · [scripts/verify-firestore-backup.sh:1](../../../../scripts/verify-firestore-backup.sh#L1)

**Tickets:** [TASK-LP-059](../../../../docs/tasks/learning-product/TASK-LP-059.md), [TASK-LP-076](../../../../docs/tasks/learning-product/TASK-LP-076.md)

<a id="f29"></a>

## F29 — Scalability, cost controls, and operational signals are not product-ready

**Severity:** Medium. **Evidence class:** Verified query patterns; unmeasured capacity.

**Observed:** Admin student retrieval scans users then their students; lifecycle jobs also scan user/child collections. Native summary readers fetch complete lesson/Sparks history. Most failures become console logs. No measured SLOs, cloud budget ownership, or bounded product-wide capacity plan was found.

**Consequence:** Growth can raise read counts, latency, scheduled-job duration, and support burden. Actual load/cost limits were not measured, so this is not a claim that present traffic exceeds capacity.

**Required focus:** Measure representative workloads, add bounded reads and incremental projections, set alert/cost ownership, and avoid premature microservices or enterprise infrastructure.

**Source:** [lib/student-service.ts:47](../../../../lib/student-service.ts#L47) · [lib/ios-progress.ts:99](../../../../lib/ios-progress.ts#L99) · [functions/src/weekly-digest.ts:137](../../../../functions/src/weekly-digest.ts#L137) · [ios/IEPAndThrive/Core/Observability/CrashlyticsClient.swift:1](../../../../ios/IEPAndThrive/Core/Observability/CrashlyticsClient.swift#L1)

**Tickets:** [TASK-LP-060](../../../../docs/tasks/learning-product/TASK-LP-060.md), [TASK-LP-061](../../../../docs/tasks/learning-product/TASK-LP-061.md), [TASK-LP-062](../../../../docs/tasks/learning-product/TASK-LP-062.md), [TASK-LP-065](../../../../docs/tasks/learning-product/TASK-LP-065.md)

<a id="f30"></a>

## F30 — Native accessibility and audio need task-level device validation

**Severity:** High for pilot. **Evidence class:** Source gaps; manual device coverage missing.

**Observed:** Tracing and cubes rely on gestures with partial accessibility labels. Many text sizes are fixed; no reduced-motion/Dynamic Type policy was found in the scanned features. SpeechClient creates a local AVSpeechSynthesizer and does not track completion. SafeSpace references ambient_forest.mp3, absent from the inventoried source assets.

**Consequence:** A product aimed at diverse learning/access needs cannot rely on visual responsiveness alone. Missing audio or inaccessible controls can be mistaken for learning difficulty. Audio duration and assistive use were not tested on devices.

**Required focus:** Implement supported accessible alternatives and sensory settings, durable audio lifecycle handling, actual assets, and real-device VoiceOver/Switch Control/large-text tests with educator review of instructional equivalence.

**Source:** [ios/IEPAndThrive/Features/Literacy/SandTrayView.swift:63](../../../../ios/IEPAndThrive/Features/Literacy/SandTrayView.swift#L63) · [ios/IEPAndThrive/Core/Audio/SpeechClient.swift:16](../../../../ios/IEPAndThrive/Core/Audio/SpeechClient.swift#L16) · [ios/IEPAndThrive/Features/SafeSpace/SafeSpaceFeature.swift:29](../../../../ios/IEPAndThrive/Features/SafeSpace/SafeSpaceFeature.swift#L29) · [ios/IEPAndThrive/Core/DesignSystem/Theme.swift:1](../../../../ios/IEPAndThrive/Core/DesignSystem/Theme.swift#L1)

**Tickets:** [TASK-LP-029](../../../../docs/tasks/learning-product/TASK-LP-029.md), [TASK-LP-070](../../../../docs/tasks/learning-product/TASK-LP-070.md), [TASK-LP-074](../../../../docs/tasks/learning-product/TASK-LP-074.md)

<a id="f31"></a>

## F31 — Web accessibility has useful components but no complete task evidence

**Severity:** Medium. **Evidence class:** Partial implementation; manual coverage missing.

**Observed:** The site has semantic controls, labels, a skip link, and a prior 18-observation desktop/mobile probe without overflow. The program page had no H1 in that probe. Signature drawing, multi-step intake, custom calendar, error handling, and report accessibility have not been comprehensively tested with assistive technology.

**Consequence:** An attractive page and a passing layout probe do not establish accessible enrollment, account management, or evidence interpretation. The new product will add additional reading and data visualization tasks.

**Required focus:** Use WCAG 2.2 AA as the web engineering target with a criterion/task matrix, automated checks, keyboard/screen-reader testing, accessible documents, and clearly recorded exceptions (source S07).

**Source:** [components/portal/SignatureCanvas.tsx:1](../../../../components/portal/SignatureCanvas.tsx#L1) · [components/booking/MonthCalendar.tsx:1](../../../../components/booking/MonthCalendar.tsx#L1) · [styles/globals.css:1](../../../../styles/globals.css#L1) · [app/program/page.tsx:1](../../../../app/program/page.tsx#L1)

**Tickets:** [TASK-LP-040](../../../../docs/tasks/learning-product/TASK-LP-040.md)

<a id="f32"></a>

## F32 — Native monetization is a dismissible prompt, not a defined entitlement product

**Severity:** Medium. **Evidence class:** Verified source gap.

**Observed:** The paywall appears after 30 Sparks and can be dismissed; level selection does not check premium. StoreKit treats any verified current entitlement as premium, does not distinguish pending from cancellation in its return value, and has limited restoration feedback. Web tutoring is a different purchase system.

**Consequence:** There is no agreed free/paid boundary or tested cross-device digital benefit. Enforcing the existing Boolean would not by itself create a sensible offer, and child-facing commercial interruption conflicts with adult-led setup.

**Required focus:** Approve the offer/authority model, put commerce behind adult controls, filter/verify product state, test restoration/revocation, and keep tutoring credits distinct.

**Source:** [ios/IEPAndThrive/Features/Root/RootFeature.swift:26](../../../../ios/IEPAndThrive/Features/Root/RootFeature.swift#L26) · [ios/IEPAndThrive/Core/StoreKit/StoreKitClient.swift:70](../../../../ios/IEPAndThrive/Core/StoreKit/StoreKitClient.swift#L70) · [ios/IEPAndThrive/Features/Paywall/PaywallFeature.swift:19](../../../../ios/IEPAndThrive/Features/Paywall/PaywallFeature.swift#L19) · [lib/subscription.ts:1](../../../../lib/subscription.ts#L1)

**Tickets:** [TASK-LP-005](../../../../docs/tasks/learning-product/TASK-LP-005.md), [TASK-LP-016](../../../../docs/tasks/learning-product/TASK-LP-016.md), [TASK-LP-051](../../../../docs/tasks/learning-product/TASK-LP-051.md), [TASK-LP-052](../../../../docs/tasks/learning-product/TASK-LP-052.md), [TASK-LP-053](../../../../docs/tasks/learning-product/TASK-LP-053.md)

<a id="f33"></a>

## F33 — Content is a useful library without a digital publishing or validity lifecycle

**Severity:** High for product direction. **Evidence class:** Implemented foundation plus new capability gap.

**Observed:** Forty-two curriculum Markdown files provide a six-week instructor program. TypeScript renders course/material data and Swift hardcodes 38 catalog entries primarily from weeks 1–2. There is no shared versioned published content/rubric contract, asset-rights registry, editorial approval state, or complete comprehension renderer.

**Consequence:** Content changes can diverge across platforms or reassign historical index-based records. The instructor sequence cannot simply be turned into tracing tokens and remain the same instruction.

**Required focus:** Retain the library, establish educator ownership and rights, publish immutable reviewed bundles, separate practice from independent tasks, and build one complete reading unit before curriculum expansion.

**Source:** [curriculum/scope-and-sequence.md:1](../../../../curriculum/scope-and-sequence.md#L1) · [lib/curriculum-data.ts:1](../../../../lib/curriculum-data.ts#L1) · [lib/curriculum-lessons.ts:1](../../../../lib/curriculum-lessons.ts#L1) · [ios/IEPAndThrive/Core/Data/CurriculumClient.swift:1](../../../../ios/IEPAndThrive/Core/Data/CurriculumClient.swift#L1)

**Tickets:** [TASK-LP-002](../../../../docs/tasks/learning-product/TASK-LP-002.md), [TASK-LP-014](../../../../docs/tasks/learning-product/TASK-LP-014.md), [TASK-LP-024](../../../../docs/tasks/learning-product/TASK-LP-024.md), [TASK-LP-026](../../../../docs/tasks/learning-product/TASK-LP-026.md), [TASK-LP-027](../../../../docs/tasks/learning-product/TASK-LP-027.md), [TASK-LP-031](../../../../docs/tasks/learning-product/TASK-LP-031.md), [TASK-LP-047](../../../../docs/tasks/learning-product/TASK-LP-047.md), [TASK-LP-062](../../../../docs/tasks/learning-product/TASK-LP-062.md), [TASK-LP-066](../../../../docs/tasks/learning-product/TASK-LP-066.md)

<a id="f34"></a>

## F34 — Web architecture serves tutoring operations, not independent learning

**Severity:** High for product direction. **Evidence class:** Product capability gap and verified routing defect.

**Observed:** The root layout wraps all pages in marketing navigation/footer/urgency; portal surfaces assume enrollment, reports, and bookings. There is no browser child quest or practitioner assignment product. The static student route exports only a placeholder and unknown Hosting paths fall back to the homepage; prior browser evidence confirms this.

**Consequence:** A digital-only family lacks a coherent setup/evidence journey. Treating the web app as obsolete would also discard useful adult infrastructure and limit practitioner reach without device-market evidence.

**Required focus:** Separate public/service/family/practitioner layouts, repair routes, build a minimal adult evidence flow, and evaluate browser learning access based on device/channel evidence before funding a second runtime.

**Source:** [app/layout.tsx:75](../../../../app/layout.tsx#L75) · [app/portal/layout.tsx:1](../../../../app/portal/layout.tsx#L1) · [app/portal/students/[studentId]/layout.tsx:2](../../../../app/portal/students/[studentId]/layout.tsx#L2) · [firebase.json:22](../../../../firebase.json#L22)

**Tickets:** [TASK-LP-001](../../../../docs/tasks/learning-product/TASK-LP-001.md), [TASK-LP-028](../../../../docs/tasks/learning-product/TASK-LP-028.md), [TASK-LP-032](../../../../docs/tasks/learning-product/TASK-LP-032.md), [TASK-LP-033](../../../../docs/tasks/learning-product/TASK-LP-033.md), [TASK-LP-034](../../../../docs/tasks/learning-product/TASK-LP-034.md), [TASK-LP-035](../../../../docs/tasks/learning-product/TASK-LP-035.md), [TASK-LP-041](../../../../docs/tasks/learning-product/TASK-LP-041.md)

<a id="f35"></a>

## F35 — Independent practitioner use lacks a tenant and sharing boundary

**Severity:** High before external practitioner access. **Evidence class:** New capability gap.

**Observed:** Rules use owner or global admin. Staff roster reads all users and child subcollections; there are no organization memberships, invitations, assigned-learner grants, or revocation flows in the reviewed data paths.

**Consequence:** Giving an independent tutor admin access would expose unrelated families. A parent subscription and an institutional contract also imply different responsibilities and data-access expectations.

**Required focus:** Design a minimal explicit sharing model for the first practitioner pilot; defer full district tenancy/SSO/SIS integrations until demand. Enforce permissions server-side across data, files, and reports.

**Source:** [firestore.rules:11](../../../../firestore.rules#L11) · [lib/student-service.ts:41](../../../../lib/student-service.ts#L41) · [app/admin/layout.tsx:32](../../../../app/admin/layout.tsx#L32)

**Tickets:** [TASK-LP-014](../../../../docs/tasks/learning-product/TASK-LP-014.md), [TASK-LP-022](../../../../docs/tasks/learning-product/TASK-LP-022.md), [TASK-LP-033](../../../../docs/tasks/learning-product/TASK-LP-033.md)

<a id="f36"></a>

## F36 — Assessment/report records do not support defensible independent outcome claims

**Severity:** High. **Evidence class:** Verified schema limits; educational validity not established.

**Observed:** Native events lack rubric/provenance and store reward scores. Staff assessment instruments are free text; pre/post IDs reuse studentId and probes reuse week/type/studentId without cohort or administration. Report templates accept aggregate accuracy and narrative inputs; no independent evaluation study or verified cohort results were inspected.

**Consequence:** New cohorts can overwrite prior results; incomparable instruments can appear comparable. An educator-entered score can be useful but is not automatically normed, causally attributable, or appropriate for an outcome-financing claim.

**Required focus:** Version administrations and corrections, specify permissible comparisons, separate rewards/practice/verified evidence, use fresh tasks and reviewer calibration, and publish uncertainty and missing data. Licensed instruments need appropriate rights and qualified administration.

**Source:** [lib/assessment-service.ts:54](../../../../lib/assessment-service.ts#L54) · [lib/probe-service.ts:59](../../../../lib/probe-service.ts#L59) · [lib/report-service.ts:37](../../../../lib/report-service.ts#L37) · [docs/master-plan.md:67](../../../../docs/master-plan.md#L67)

**Tickets:** [TASK-LP-003](../../../../docs/tasks/learning-product/TASK-LP-003.md), [TASK-LP-025](../../../../docs/tasks/learning-product/TASK-LP-025.md), [TASK-LP-027](../../../../docs/tasks/learning-product/TASK-LP-027.md), [TASK-LP-030](../../../../docs/tasks/learning-product/TASK-LP-030.md), [TASK-LP-032](../../../../docs/tasks/learning-product/TASK-LP-032.md), [TASK-LP-046](../../../../docs/tasks/learning-product/TASK-LP-046.md)

<a id="f37"></a>

## F37 — Public and strategic claims outpace verified facts

**Severity:** Medium. **Evidence class:** Source inconsistencies; claims evidence unverified.

**Observed:** Public pages emphasize an expired Summer 2026 campaign and older credential counts; curriculum describes different group sizes/schedules from marketing. Testimonials and gain claims are hardcoded. The school plan assumes a completed cohort and publishable outcomes. Earlier audit DNS checks found the custom domain unresolved; this was not rechecked in this pass.

**Consequence:** Campaign spend could amplify unavailable features, unsupported evidence claims, or outdated service details. Current user-supplied credentials should be recorded accurately without inferring certifications or employer endorsement.

**Required focus:** Create a claims/permissions register, reconcile service facts, separate software positioning from school research, and verify domain/metadata/CTAs before campaigning.

**Source:** [components/sections/Testimonials.tsx:1](../../../../components/sections/Testimonials.tsx#L1) · [components/sections/AboutFounder.tsx:1](../../../../components/sections/AboutFounder.tsx#L1) · [curriculum/scope-and-sequence.md:17](../../../../curriculum/scope-and-sequence.md#L17) · [docs/master-plan.md:90](../../../../docs/master-plan.md#L90)

**Tickets:** [TASK-LP-002](../../../../docs/tasks/learning-product/TASK-LP-002.md), [TASK-LP-039](../../../../docs/tasks/learning-product/TASK-LP-039.md), [TASK-LP-066](../../../../docs/tasks/learning-product/TASK-LP-066.md)

<a id="f38"></a>

## F38 — Test counts overstate critical-path assurance

**Severity:** High. **Evidence class:** Current tests plus coverage inventory.

**Observed:** Current local web tests: 41 passed; local rule regression tests: 17 passed. Extended synthetic probes reproduce twelve observations, including vulnerabilities. Functions builds but has no test script. Native unchanged baseline had 95 simulator tests. Root unit files for iOS/subscription schemas mirror definitions; several Swift tests outside the configured native test target are not part of that 95-test result. Production-targeted E2E is not a candidate-build release gate.

**Consequence:** Passing tests demonstrate specific behaviors, not live sync, payment recovery, consent, learning validity, or accessibility. The existing suite even encodes some permissive completion behavior.

**Required focus:** Import actual logic, add backend/emulator and real-store native tests, isolate E2E, test failures/concurrency/lifecycle, and keep a manual pilot/real-device gate.

**Source:** [functions/package.json:4](../../../../functions/package.json#L4) · [tests/unit/ios-progress.test.mjs:17](../../../../tests/unit/ios-progress.test.mjs#L17) · [ios/project.yml:67](../../../../ios/project.yml#L67) · [playwright.config.ts:3](../../../../playwright.config.ts#L3)

**Tickets:** [TASK-LP-011](../../../../docs/tasks/learning-product/TASK-LP-011.md), [TASK-LP-067](../../../../docs/tasks/learning-product/TASK-LP-067.md), [TASK-LP-068](../../../../docs/tasks/learning-product/TASK-LP-068.md), [TASK-LP-069](../../../../docs/tasks/learning-product/TASK-LP-069.md), [TASK-LP-071](../../../../docs/tasks/learning-product/TASK-LP-071.md)

<a id="f39"></a>

## F39 — Deletion, retention, and purpose limitation remain implementation work

**Severity:** High. **Evidence class:** Documented policy, incomplete product controls.

**Observed:** The legal/deletion documents describe manual processes, while Settings only offers sign-out. No complete account/learner export/delete pipeline, backup deletion manifest, automated retention, or consent-withdrawal enforcement was found. Web intake collects extensive service data and GA can load globally when configured.

**Consequence:** New voice/AI/media or institutional data would expand obligations before the current lifecycle is complete. Anonymous Auth does not make named child records non-identifying. Actual production retention and SDK settings remain unknown.

**Required focus:** Minimize digital setup, implement adult requests and durable lifecycle jobs, inventory processors/retention, enforce withdrawal, and reconcile published policy with behavior using qualified privacy review. Sources S02/S03/S05 ground the requirements; this is not a legal certification.

**Source:** [docs/legal/data-deletion-process.md:1](../../../../docs/legal/data-deletion-process.md#L1) · [ios/IEPAndThrive/Features/Settings/SettingsFeature.swift:1](../../../../ios/IEPAndThrive/Features/Settings/SettingsFeature.swift#L1) · [app/portal/intake/page.tsx:21](../../../../app/portal/intake/page.tsx#L21) · [components/layout/GoogleAnalytics.tsx:1](../../../../components/layout/GoogleAnalytics.tsx#L1)

**Tickets:** [TASK-LP-015](../../../../docs/tasks/learning-product/TASK-LP-015.md), [TASK-LP-021](../../../../docs/tasks/learning-product/TASK-LP-021.md), [TASK-LP-036](../../../../docs/tasks/learning-product/TASK-LP-036.md), [TASK-LP-059](../../../../docs/tasks/learning-product/TASK-LP-059.md), [TASK-LP-064](../../../../docs/tasks/learning-product/TASK-LP-064.md)

<a id="f40"></a>

## F40 — NYC opportunity needs channel validation and current policy qualification

**Severity:** High for channel strategy. **Evidence class:** External current-policy evidence and untested business hypothesis.

**Observed:** The educator’s NYC roots and supplied experience support discovery access, but no external paid adoption evidence is established. NYCPS 2026–27 guidance restricts student-facing generative AI in grades 2K–8 and individual screen use by grade; assistive-technology exceptions are determined through the applicable student process, not a vendor’s SPED branding (source S01).

**Consequence:** An unrestricted child-facing AI or screen-first classroom pitch could conflict with the intended buyer setting. Direct family use, independent practice, and school-authorized deployment are distinct channels.

**Required focus:** Keep the first quest reviewed and non-generative, validate learner need and device access with families/practitioners, offer teacher-led/printable options where useful, and qualify institutional approvals separately. This is a strategy inference from current policy, not a ban on all educational software.

**Source:** [docs/gtm-plan.md:1](../../../../docs/gtm-plan.md#L1) · [docs/ios-pivot/PRD.md:43](../../../../docs/ios-pivot/PRD.md#L43) · [docs/strategy-nyc-alignment-and-financing.md:1](../../../../docs/strategy-nyc-alignment-and-financing.md#L1)

**Tickets:** [TASK-LP-001](../../../../docs/tasks/learning-product/TASK-LP-001.md), [TASK-LP-003](../../../../docs/tasks/learning-product/TASK-LP-003.md), [TASK-LP-004](../../../../docs/tasks/learning-product/TASK-LP-004.md), [TASK-LP-005](../../../../docs/tasks/learning-product/TASK-LP-005.md), [TASK-LP-039](../../../../docs/tasks/learning-product/TASK-LP-039.md), [TASK-LP-041](../../../../docs/tasks/learning-product/TASK-LP-041.md), [TASK-LP-065](../../../../docs/tasks/learning-product/TASK-LP-065.md), [TASK-LP-071](../../../../docs/tasks/learning-product/TASK-LP-071.md)

<a id="f41"></a>

## F41 — Operating ownership and support have not shifted to a software product

**Severity:** Medium. **Evidence class:** Process gap.

**Observed:** The repository contains service operations, backup, release, and lifecycle verification runbooks, but no unified software incident/support/evidence gate with named accountabilities for sync loss, privacy requests, content defects, or digital refunds. Historical STATE.md claims and multiple backlog formats remain.

**Consequence:** The educator can become a bottleneck for every content/support decision, and engineering may optimize for shipping artifacts rather than resolving user outcomes. Low software infrastructure costs can be offset by unplanned support and review work.

**Required focus:** Assign proposed role owners and real capacity, consolidate the active backlog, retain useful runbooks, define escalation/service objectives, and require a reviewed release dossier before pilot or paid expansion.

**Source:** [STATE.md:1](../../../../STATE.md#L1) · [docs/operations-manual.md:1](../../../../docs/operations-manual.md#L1) · [docs/runbooks/email-lifecycle-verification.md:1](../../../../docs/runbooks/email-lifecycle-verification.md#L1) · [scripts/backlog.yml:1](../../../../scripts/backlog.yml#L1)

**Tickets:** [TASK-LP-060](../../../../docs/tasks/learning-product/TASK-LP-060.md), [TASK-LP-071](../../../../docs/tasks/learning-product/TASK-LP-071.md), [TASK-LP-072](../../../../docs/tasks/learning-product/TASK-LP-072.md)

<a id="f42"></a>

## F42 — Authentication continuation and recovery are incomplete

**Severity:** Medium. **Evidence class:** Verified source gap.

**Observed:** Agreement login links include next but LoginPage always chooses admin/portal. Web signup updates Auth displayName after creation while profile initialization can race and persist a blank name. Native auth has multiple providers but no complete account-recovery/link-conflict experience; Settings primarily exposes a truncated UID.

**Consequence:** Families can lose enrollment context, become stranded after credential problems, or mistake account identity. The locally fixed web claim/generation handling is a positive improvement but does not complete these flows.

**Required focus:** Implement safe local return paths, idempotent profile initialization, password recovery/verification policy, provider conflicts, meaningful account identity, and late-effect guards.

**Source:** [app/enroll/agreement/page.tsx:112](../../../../app/enroll/agreement/page.tsx#L112) · [app/login/page.tsx:16](../../../../app/login/page.tsx#L16) · [lib/auth-context.tsx:12](../../../../lib/auth-context.tsx#L12) · [ios/IEPAndThrive/Features/Settings/SettingsFeature.swift:17](../../../../ios/IEPAndThrive/Features/Settings/SettingsFeature.swift#L17)

**Tickets:** [TASK-LP-035](../../../../docs/tasks/learning-product/TASK-LP-035.md), [TASK-LP-075](../../../../docs/tasks/learning-product/TASK-LP-075.md)

<a id="f43"></a>

## F43 — Persistence isolation, sync acknowledgments, and schema evolution need architecture work

**Severity:** High. **Evidence class:** Source-level concurrency/reliability concern; runtime failure not reproduced.

**Observed:** DatabaseContainer exposes a MainActor mainContext, then async client closures call fetch/insert/save without retaining an explicit actor-isolated operation. Live model objects cross Sendable effect boundaries. Remote Codable writes are separate from local saves and malformed records are compactMapped away. No versioned migration/outbox protocol is implemented.

**Consequence:** Actor correctness and successful server acknowledgment cannot be inferred from reducer tests. Upgrading to scoped identities without migration/compatibility planning risks corrupting or losing historical data.

**Required focus:** Use an isolated persistence repository exchanging immutable DTOs, typed failures, durable outbox acknowledgments, and resumable schema migrations. Validate concurrency with real stores and distinguish source concerns from reproduced crashes.

**Source:** [ios/IEPAndThrive/Core/Data/DatabaseClient.swift:19](../../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift#L19) · [ios/IEPAndThrive/Core/Data/DatabaseClient.swift:83](../../../../ios/IEPAndThrive/Core/Data/DatabaseClient.swift#L83) · [ios/IEPAndThrive/Core/Data/FirestoreClient.swift:69](../../../../ios/IEPAndThrive/Core/Data/FirestoreClient.swift#L69) · [ios/IEPAndThrive/Features/Journey/JourneyFeature.swift:89](../../../../ios/IEPAndThrive/Features/Journey/JourneyFeature.swift#L89)

**Tickets:** [TASK-LP-014](../../../../docs/tasks/learning-product/TASK-LP-014.md), [TASK-LP-017](../../../../docs/tasks/learning-product/TASK-LP-017.md), [TASK-LP-020](../../../../docs/tasks/learning-product/TASK-LP-020.md), [TASK-LP-068](../../../../docs/tasks/learning-product/TASK-LP-068.md), [TASK-LP-073](../../../../docs/tasks/learning-product/TASK-LP-073.md), [TASK-LP-076](../../../../docs/tasks/learning-product/TASK-LP-076.md)

<a id="f44"></a>

## F44 — Essential asset and design completion should precede decorative expansion

**Severity:** Medium. **Evidence class:** Verified asset inventory; design QA incomplete.

**Observed:** The app has forest, sand, and safe-space raster assets and working native layout foundations. The icon asset catalog lacks an image filename; SafeSpace pet visuals are placeholders and distinct desert/mountain artwork is not present. The web uses Playfair/DM Sans while native typography is separately defined.

**Consequence:** An archive may be unsuitable for distribution and a growing visual catalog can consume effort without resolving reading usability or evidence. Cross-platform consistency needs semantic tokens, not identical platform widgets.

**Required focus:** Complete required icon/readability/help/error states and accessibility token behavior first. Validate bundled rights/assets and defer virtual economy/new worlds until the focused quest is useful.

**Source:** [ios/IEPAndThrive/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json:1](../../../../ios/IEPAndThrive/Resources/Assets.xcassets/AppIcon.appiconset/Contents.json#L1) · [ios/IEPAndThrive/Features/SafeSpace/SafeSpaceView.swift:96](../../../../ios/IEPAndThrive/Features/SafeSpace/SafeSpaceView.swift#L96) · [ios/IEPAndThrive/Core/DesignSystem/Theme.swift:1](../../../../ios/IEPAndThrive/Core/DesignSystem/Theme.swift#L1) · [app/layout.tsx:2](../../../../app/layout.tsx#L2)

**Tickets:** [TASK-LP-056](../../../../docs/tasks/learning-product/TASK-LP-056.md), [TASK-LP-074](../../../../docs/tasks/learning-product/TASK-LP-074.md)
