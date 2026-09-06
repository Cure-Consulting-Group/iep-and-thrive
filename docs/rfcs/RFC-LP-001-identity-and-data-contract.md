# RFC-LP-001 — account, learner, and enrollment data contract

**Status: PROPOSED — requires owner and educator approval. Not implemented.**
Covers **TASK-LP-014**. Drafted September 6, 2026 from the code as it stands.

## Why now

Every remaining G0 data repair (007 private notes, 008 enrollment authority,
012 signed agreements, 013 document paths, 036 intake, 037 parent queries)
writes against a model nobody has written down. TASK-LP-014 blocks 22 tickets
because they would each invent their own answer.

## What is actually true today

Verified against the code, not assumed:

| Fact | Evidence |
| --- | --- |
| Learner ids **are** globally unique | `lib/student-service.ts:89` uses `doc(studentsRef)`, a Firestore auto-id |
| Learners live under a parent | `users/{parentId}/students/{studentId}` |
| Flat collections authorize on a data field | `firestore.rules:146` — `resource.data.parentId == request.auth.uid` |
| Composite ids embed only the learner | `lib/probe-service.ts:60` — `week${week}_${type}_${studentId}` |
| Two enrollment concepts coexist | `programTrack` (54 uses) vs `enrollmentStatus` (5) |
| Intake is not learner-specific | `app/portal/intake/page.tsx:192` takes `snap.docs[0]` |
| iOS mints its own ids | SwiftData local UUIDs, unrelated to Firestore ids |

One correction worth recording, because it changes the priority: learner ids are
**not** colliding. They are Firestore auto-ids and globally unique. The problem
is not uniqueness — it is that a flat record's ownership lives in a mutable data
field rather than in the reference itself, and that two clients mint identity
independently.

## The proposal

### 1. Identity

- **Adult account** — keyed by Firebase Auth uid. The only authentication
  identity. Never derive an account from an email address; TASK-LP-014 is
  explicit that unverified email matching is not proof, and historical
  email-only payments are exactly where that temptation arises.
- **Household** — a new container. A learner belongs to a household, not to a
  single adult, so a second parent or a practitioner can be granted access
  without re-parenting records. Today `parentId` conflates "who owns this" with
  "who may read this", and those separate the moment a second adult exists.
- **Learner** — keeps its existing auto-id. Referenced everywhere as a fully
  qualified `{householdId}/{learnerId}` pair, never a bare `learnerId`.
- **Practitioner grant** — an explicit, revocable, scoped record. Not a global
  admin claim. The current model has exactly one staff authority level, which
  TASK-LP-022 already flags as unworkable for multiple practitioners.

### 2. Flat collections

`probes`, `probeResults`, `attendance`, `assessmentResults`,
`portfolioArtifacts`, `progressReports` each carry a `parentId` used for
authorization. Proposal: carry `householdId` **and** `learnerRef` as written
fields, and make the document id fully qualified. A reference must be
self-describing — a record whose ownership can be edited is a record whose
ownership can be wrong.

### 3. Server-owned versus client-editable

Every collection declares which fields the client may write. `firestore.rules`
already does this for `/users/{userId}` after A01; extend the same allowlist
shape everywhere rather than inventing per-collection conventions.

Server-owned: identity, enrollment state, billing, entitlement, timestamps,
`_schemaVersion`.
Client-editable: contact details, preferences, and learner display fields.

### 4. Enrollment

Collapse `programTrack` and `enrollmentStatus` into one versioned enrollment
record with an explicit state machine. Which of the two is authoritative today
is genuinely unclear from the code, and that ambiguity is the point — it needs
deciding, not documenting.

### 5. Schema versioning

Every document carries `_schemaVersion`. Both clients tolerate the versions they
know and refuse the ones they do not, rather than decoding partially. The
migration runner from TASK-LP-076 already keys on this field.

### 6. Legacy reconciliation

Historical email-only payments cannot be attributed to an Auth account without
proof. They are **quarantined for human review** — never matched heuristically on
an unverified email. `scripts/migrate.mjs` already implements quarantine, and
`tests/unit/migrate.test.mjs` covers it. This is the ticket's second acceptance
criterion and it is already enforceable.

## Open questions — owner and educator

1. Does a household ever contain more than one adult in the near term? If not,
   household can be a thin wrapper now and grow later; if yes, it must be real
   from the start.
2. Is `programTrack` or `enrollmentStatus` authoritative today? A wrong answer
   silently mis-migrates every enrolled family.
3. What is the minimum supported iOS version? It sets when the contract step of
   any migration may run.
4. Do practitioners other than the founder need access within two quarters? This
   decides whether practitioner grants are built now or stubbed.

## Not in scope

Content and rubric contracts (TASK-LP-025), and the reading-product audience
decision (TASK-LP-001). This RFC deliberately describes identity only, so it can
be approved without settling the product brief.
