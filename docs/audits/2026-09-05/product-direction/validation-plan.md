# Validation plan and evidence requirements

**September 5, 2026.** This separates checks actually performed from proposed verification. It is not a claim that the proposed tests already exist or that production is ready. [Verification summary](evidence/verification-summary.json) records the current run; [original audit](../build-audit.md) records carried-forward checks. Ticket references below are implementation work in the [index](ticket-index.md).

## Existing coverage assessment

| Surface | Rating | Current evidence | Consequential missing evidence |
| --- | --- | --- | --- |
| Web unit logic | Partial | 41 current passes; four exercise the actual auth provider with adapters | Complete actual component/business integration, meaningful coverage measurement and error/auth lifecycle cases |
| Firestore/Storage rules | Partial | 17 current regression passes plus 12 separate diagnostic observations | Full owner/admin/practitioner/stranger matrix, every allowed field/type and all active query shapes |
| Backend handlers | Missing comprehensive integration suite | Current Functions TypeScript compilation | Real handler transactions, triggers, retries, concurrency and provider adapters; compilation proves none of these |
| Native reducers/geometry | Partial | 95 tests carried from same-day simulator verification | Full production-effect lifecycle, real SwiftData persistence, account switching, sync recovery, deletion and purchases |
| Native real-store integration | Missing | Some adapters/reducers tested separately | Actual scoped store + outbox + identity hydration across restart/migration |
| Web end-to-end | Partial | Prior marketing 7 pass / 2 stale-deadline failures; 18 browser observations | Isolated authenticated family/staff journeys with persistence and server side effects |
| Native accessibility/store release | Partial / unverified | Source review, simulator build/test, archive workflow inspection | Signed archive/TestFlight proof, actual device assistive technology, sensory/audio interruptions and adult gate |
| Learning validity and demand | Missing external validation | Curriculum and implemented-task comparison | Educator-reviewed construct/task match, independent tasks, external usability and demand; controlled efficacy work if later claims require it |
| Operations | Partial documentation only | Config/workflow/runbook review and advisory scans | Deployed configuration/IAM, restoration, alert delivery, load/cost measurements and provider reconciliation |
| Android | Not applicable | No Android implementation found | Evaluate only if platform scope changes |

A test-file/source-file ratio is an inventory signal, not a coverage percentage. The 95 native tests apply to the configured `ios/IEPAndThriveTests` target; miscellaneous Swift files under `tests/unit` are not automatically part of that target. Existing success tests must be retained, but passing them does not contradict the source/integration findings.

## Reproduce current local checks

Use the audited lockfiles and compatible tooling. The observed runtime was Node 25.9.0/npm 11.12.1; Functions declares Node 22. TASK-LP-054/055 requires verification under the declared supported runtime before promotion.

```sh
npm run test:unit
npm run test:security
npm --prefix functions run build
npm audit --omit=dev --json
npm --prefix functions audit --omit=dev --json
```

Run each as a separate command and retain exit status/output. Advisory scans return nonzero when they report vulnerabilities; classify package/runtime reachability and remediation instead of treating every flagged dependency as a demonstrated exploitable production endpoint. Root and Functions counts are separate trees and must not be added as unique vulnerabilities.

`npm run test:security` invokes the Node rules tests against already-running loopback emulators; it does not start them. Start Firestore/Storage with `firebase.security.json` when needed, or use `emulators:exec` to wrap the test command. Do not start competing listeners. Consult `package.json` and the test setup for the current command. Ports 39188/39299 are loopback Firestore/Storage with demo project IDs. Do not substitute production project IDs or service credentials.

The extended probe can run against those existing loopback emulators:

```sh
node docs/audits/2026-09-05/product-direction/evidence/extended-rules-probe.cjs
```

It initializes `demo-iep-direction`, loads local rules and seeds synthetic data through a disabled-rules test context. It writes its JSON observations to stdout; the saved [results](evidence/extended-rules-results.json) are the audit snapshot. The script deliberately expects current exposures and denials; a zero exit status means those observations reproduced, **not** that the rules are secure. Once fixed, convert those cases to permitted/denied regression expectations and retain the old snapshot as evidence. Do not run this probe on production or label it a release-gating security suite.

The standalone emulator startup alternative, when ports are free, is:

```sh
npx firebase emulators:exec --config firebase.security.json --project demo-iep-direction --only firestore,storage 'node docs/audits/2026-09-05/product-direction/evidence/extended-rules-probe.cjs'
```

Firestore emulator results validate rule/query logic but do not establish deployed composite-index availability or every production service behavior. Verify needed indexes in isolated staging. Browser/auth/provider and native commands belong in their release tickets because the current environment/provider separation must be repaired before reproducing flows that could send messages or create real records.

## Required scenario matrix

| Test ID | Scenario and observable result | Level / tickets |
| --- | --- | --- |
| SEC-01 | Parent/stranger cannot alter billing IDs, roles, enrollment or document ownership; permitted profile edits still work | Rules + actual endpoint integration; 006/008/067 |
| SEC-02 | Parent cannot fetch private educator notes by document or query; authorized instructor can; no private field remains in shared documents | Rules + migration + portal; 007/046 |
| SEC-03 | Booking direct-write forgery denied, invalid slot rejected and simultaneous reservations produce only permitted capacity | Rules + real handler concurrency; 042/067 |
| SEC-04 | Notification edits limited to valid read state; enrollment-only resources require genuine entitlement; arbitrary metadata rejected | Rules + frontend; 009/047 |
| SEC-05 | IEP/report upload and authorized download succeed for owner, fail for stranger, reject wrong type/size; old token disposition recorded | Storage + delivery endpoint; 006/013 |
| SEC-06 | Agreement rejects foreign inquiry, altered canonical terms, invalid signature and replay mismatch; canonical valid case succeeds once | Actual handler + synthetic document generation; 012 |
| SEC-07 | Public endpoints reject malformed/oversized/rate-excess requests without creating state or sending mail | Handler + abuse simulation in isolated environment; 010/058 |
| ID-01 | First launch, returning launch, new device and account switch show only the authorized learner and correct restore state | Native real store + emulator; 017/018/068/073 |
| ID-02 | Anonymous linking requires both identity proofs; conflict and interruption resume without duplicates or guessed ownership | Native/backend integration; 019/076 |
| ID-03 | Outbox survives termination/offline/repeated acknowledgment; each event yields one accepted attempt/reward | Native real store + actual ingestion; 020/068 |
| ID-04 | Corrupt legacy record produces a typed recoverable error, never a fabricated new blank profile replacing evidence | Migration/adapter tests; 073/076 |
| PRIV-01 | No child cloud collection before required consent; adult gate cannot be bypassed by navigation, deep link or purchase UI | UI + network/event inspection; 015/016 |
| PRIV-02 | Withdrawal/deletion stops queued writes, traverses stores and providers, preserves only justified exceptions, and reports completion | End-to-end deletion job + restored backup exercise; 021/059 |
| PRIV-03 | Logs/analytics contain no names, IEP contents or responses; collection matches approved purpose/context | Structured log assertions + build inspection; 064/065 |
| LEARN-01 | Each published activity's visible skill matches its actual stimulus, interaction, response and rubric | Educator review + contract tests; 024/026/027 |
| LEARN-02 | Back/skip/failed/assisted/independent actions retain distinct outcomes; retries/reopen cannot farm completion credit | TCA actual reducer + ingestion; 023/025/028/029 |
| LEARN-03 | Content version changes do not reinterpret historical responses; withdrawal blocks new assignment safely | Publication + reader compatibility; 026/062 |
| LEARN-04 | Fresh independent task and educator assessment retain provenance/history; adult report distinguishes help and limited evidence | Content review + integration/UI; 030/032/046 |
| WEB-01 | Direct load/refresh of each declared route returns intended page; unknown path yields real not-found behavior | Export + hosting preview + browser; 035/069 |
| WEB-02 | Login/signup/recovery preserves allowed destination, rejects unsafe redirects and handles delayed profile initialization | Actual auth provider/component + E2E; 075 |
| WEB-03 | Intake partial state is labeled accurately; failed child creation never reports completed enrollment | UI + persisted-state assertions; 036/045 |
| WEB-04 | Parent attendance/progress/report query matches ownership rules and Timestamp DTOs; errors differ from no data | Emulator + real client adapters + staging indexes; 037 |
| WEB-05 | Purchase CTA reaches authenticated supported offer and actual test checkout; unsupported placeholder plans cannot transact | Browser + server SKU integration; 038/050 |
| PAY-01 | Crash after event claim, duplicate delivery and replay recover exactly once; completed state follows durable effects | Actual handler + failure injection; 048 |
| PAY-02 | Invoice fixtures from configured API version, out-of-order events and renewal/refund reconcile without double credit | Contract + provider sandbox; 049/053 |
| PAY-03 | Invalid SKU/foreign inquiry/body UID rejected; repeated checkout request returns appropriate existing operation | Actual checkout handler; 050 |
| PAY-04 | Native purchase pending, expiry, revoke, refund, restore and interrupted launch all produce the correct digital access | StoreKit test configuration + server tests + staged device; 051/052 |
| SVC-01 | Cancellation/reschedule obey cutoff, capacity, timezone/DST and credit policy once under retry/concurrency | Transaction integration; 042/043 |
| MSG-01 | Provider failure leaves retryable job; duplicate trigger sends no duplicate; calendar event update/cancel stable | Provider fakes recording actual adapter calls; 044/063 |
| MSG-02 | Transactional/promotional preferences and unsubscribe semantics match approved purpose; expired seasonal jobs stop | Scheduled-handler time travel tests; 063/066 |
| OPS-01 | Environment/config checks reject mismatched bundle/project/credentials; test seed rejects production | Script/CI tests; 011/054 |
| OPS-02 | A failed required check blocks deployment; promotion covers intended rules/indexes/Storage/functions/web revisions | Workflow test/rehearsal; 055/069 |
| OPS-03 | Signed native archive uses correct app identity/version/assets; auth preflight fails before irreversible numbering/upload steps | Archive and release rehearsal; 056/074 |
| OPS-04 | Backup restores representative relationships/files/auth mapping; deleted data is not reintroduced as active | Isolated recovery drill; 059/076 |
| OPS-05 | Representative load has bounded reads/retries/queue size/cost; injected failures trigger actionable non-sensitive alerts | Load/fault tests; 060/061 |
| A11Y-01 | Web keyboard, focus, labels, errors, contrast, zoom and screen-reader journeys work across adult/public flows | Automated assist plus manual browser/AT; 040 |
| A11Y-02 | Native VoiceOver, large text, reduced motion, sensory controls and alternate motor paths preserve task meaning | Simulator plus real device/participant observation; 070/074 |
| PILOT-01 | External family completes the reviewed journey and interprets report; usability/assistance/return-use measures captured separately | Consented feasibility observation; 003/065/071 |

## Missing-test scaffolds for implementation

These are deliberately non-executable design scaffolds. They identify the missing seam without inventing exports in the current codebase or adding skipped tests that inflate suite totals. Implement in the owning tickets and import the actual production handler/reducer/adapter.

### Backend reservation and payment integration — TASK-LP-067

```ts
// Pseudocode: harness must invoke the actual reservation command with test auth.
const [first, second] = await Promise.all([
  harness.invokeRealReservation({ slotId, requestId: "one" }, parentA),
  harness.invokeRealReservation({ slotId, requestId: "two" }, parentB),
]);
expect(successes(first, second)).toHaveLength(1);
expect(await harness.readPersistedReservations(slotId)).toHaveLength(1);
expect(await harness.totalConsumedCredits(slotId)).toBe(1);
// Also assert that the losing request created no email/calendar job.
```

Use emulator transactions and synthetic fixtures, not a separate in-test reimplementation of the booking algorithm. Provider adapters may be faked to record calls; the business handler and persistence path stay real. For webhook recovery, inject a failure after claim and before completion, invoke the same verified event again, and assert one durable entitlement change and one delivery job.

### Native restart/account-switch integration — TASK-LP-068

```swift
// Pseudocode: use the production data adapter with temporary on-disk containers.
let firstRun = makeHarness(account: accountA, storeURL: temporaryStore)
await firstRun.submitAttemptWhileOffline(attempt)
await firstRun.terminateAndCloseStore()
let restarted = makeHarness(account: accountA, storeURL: temporaryStore)
await restarted.reconnectAndAwaitAcknowledgment()
assertOneRemoteAttemptAndReward(attempt.id)
await restarted.switchAccount(to: accountB)
assertNoProfileProgressOrQueuedWritesFrom(accountA)
```

Use TCA `TestStore` for actual reducer actions/effects and separate integration tests for real persistence. Test cancellation, double-tap, sign-out during replay, disk/open failure and unsupported legacy schemas. In-memory fake arrays cannot establish SwiftData restart/migration correctness.

### Rules regression conversion — TASK-LP-007/008/009

```ts
// Pseudocode: fixtures move private data to its new protected path.
await assertFails(getDoc(doc(parentDb, privateNotePath)));
await assertSucceeds(getDoc(doc(instructorDb, privateNotePath)));
await assertFails(updateDoc(doc(parentDb, ownedStudentPath), {
  enrollmentStatus: "confirmed",
}));
await assertSucceeds(updateDoc(doc(parentDb, ownedStudentPath), {
  displayName: "Synthetic learner",
})); // only if approved schema permits this field
```

Add query tests and invalid-field/type tests, not just known-ID document reads. Keep positive controls so deny-all rules cannot falsely appear to solve the workflow.

## Release evidence record

For each release candidate record commit/artifact hashes, environment/project IDs, rule/index/config versions, content/rubric versions, relevant test output, unresolved defects, migration dry-run/results, designated approvers, rollback/containment path and post-release checks. Distinguish local, staging and operational evidence. A production credential or a historical successful build is not a release receipt.

Before G2, demonstrate a synthetic end-to-end journey: adult account/consent → learner → reviewed quest → assisted/independent outcome → acknowledged progress → adult report → account switch/restore → export/deletion. Repeat consequential interruption paths and actual accessibility workflows. Resolve all applicable P0 gate items or remove the affected capability and explicitly narrow the pilot promise. No real participants enter merely because unit tests passed.

Before G3, add store/provider lifecycle, reconciled entitlement, purchase disclosures and support readiness. Before G4, add qualified institutional workflow, sharing revocation, applicable agreements and device/policy evidence. Review the [source register](sources.md) at the point of release because policies can change.

## Instructional and participant review

The educator signs off the skill/prerequisites, content rights, task/rubric alignment, accommodations, fresh independent tasks, interpretation and stop/adjust criteria. Product research records consented observation, accessibility/support needs and burden without unnecessary sensitive data. Separate usability, engagement, educational evidence and willingness to pay in reporting.

The proposed small pilot answers feasibility and product-fit questions. It does not establish diagnosis, causal improvement or broad SPED effectiveness. Any future stronger outcome claim needs a study design and qualified interpretation suited to that claim. Keep individual feedback and support requests out of public marketing without an appropriate separate permission process.
