# Backend architecture

This document implements ADR-000 D6-D8 and D10. The MVP backend is deliberately tiny: Firebase
Hosting for five static pages and exactly one callable surface, the consented cohort ingest
Function. It has no learner backend. The parent-record services below are post-MVP and must not be
deployed as part of the retention MVP.

## MVP deployment

```mermaid
flowchart LR
    Adult["Adult browser"]
    Site["Firebase Hosting<br/>serves Next.js static export only"]
    CohortApp["Opted-in iOS CohortUploadClient<br/>weekly aggregates only"]
    Function["cohortIngest<br/>Functions v2, Node 22 TypeScript"]
    Secret["Firebase secret parameter<br/>cohort-code and token HMAC keys"]
    Firestore[("cohortMeasurements<br/>single write-only Firestore collection")]

    Adult -->|"GET static assets"| Site
    CohortApp -->|"POST weekly batch or revocation"| Function
    Function -->|"reads at invocation"| Secret
    Function -->|"Admin SDK transaction"| Firestore
```

The deployed Functions barrel exports `cohortIngest` and nothing else. Static Hosting does not
rewrite a page request to a Function. There is no Firebase Auth tenant, learner collection,
email capture, payment webhook, scheduled messaging, analytics ingestion, or content API in the
MVP. Secrets are Firebase secret parameters supplied by deployment configuration and are never
hardcoded in TypeScript, JSON, the iOS bundle, or documentation.

## `cohortIngest` HTTP contract

### Request

`POST /v1/cohort/batches`

Required headers:

```http
Authorization: Cohort <issued-code>
Content-Type: application/json
Idempotency-Key: <UUID matching body.batchId, for weeklyBatch>
```

Only HTTPS `POST` is allowed. The native client does not need CORS; browser origins receive no
CORS allow header. The maximum request body is 4 KiB. The Function validates the raw body with a
strict Zod discriminated union before any Firestore access.

A weekly batch request is:

```json
{
  "schemaVersion": 1,
  "operation": "weeklyBatch",
  "batchId": "018f24f7-b0ae-7bb1-9d7e-b39f7d5a3d51",
  "participantToken": "base64url-encoded-32-random-bytes",
  "periodStart": "2026-09-07",
  "periodEnd": "2026-09-13",
  "counters": {
    "sessionsStarted": 3,
    "skillsReached": 4,
    "daysSinceFirstOpen": 27
  }
}
```

A revocation request, sent through the same Function and route, is:

```json
{
  "schemaVersion": 1,
  "operation": "revoke",
  "participantToken": "base64url-encoded-32-random-bytes",
  "requestedAt": "2026-09-07T18:30:00Z"
}
```

Validation requires UUIDv7/UUIDv4 syntax for `batchId`, exactly 32 random bytes in the base64url
participant token, ISO dates, a period of one through eight days, nonnegative integer counters,
`sessionsStarted <= 100`, `skillsReached <= 500`, and `daysSinceFirstOpen <= 3650`. Unknown fields
are rejected. The client generates the participant token with a cryptographically secure system
random generator; the server never returns or mints an identifier.

The Function normalizes and HMACs the issued code with a server secret, then constant-time
compares it with the active code-hash allowlist stored in a Firebase secret parameter. It HMACs
the participant token with a different secret before constructing document IDs. Raw codes,
tokens, authorization headers, request bodies, and IP addresses are not copied to application
logs or Firestore.

### Success response

An accepted or already-accepted weekly batch returns `202 Accepted`:

```json
{
  "schemaVersion": 1,
  "accepted": true,
  "duplicate": false,
  "requestId": "018f2500-e9a4-77f0-b17a-36f73f8aca76",
  "nextUploadAfter": "2026-09-14T00:00:00Z"
}
```

An idempotent replay sets `duplicate: true` and returns the original next-upload boundary without
incrementing counters or quota. Accepted revocation returns `202` with `accepted`, `requestId`,
and `revoked: true`; repeating it is also successful.

### Rate limit and errors

For `weeklyBatch`, enforce both six requests per participant-token hash per rolling hour and 120
accepted requests per cohort-code hash per UTC day. Only one batch ID and one accepted batch per
participant/week are stored. Quota documents live in the same `cohortMeasurements` collection so
D6's one-collection boundary is preserved. A revocation with a valid code bypasses an exhausted
write quota so a parent is never prevented from stopping participation.

Every non-2xx response uses this envelope and includes no submitted value:

```json
{
  "schemaVersion": 1,
  "error": {
    "code": "rate_limited",
    "message": "Try again after the supplied delay.",
    "requestId": "018f2500-e9a4-77f0-b17a-36f73f8aca76",
    "retryable": true,
    "retryAfterSeconds": 1800
  }
}
```

| Status | Stable code | Meaning/client behavior |
| --- | --- | --- |
| 400 | `invalid_request` | Shape, range, date, or idempotency header failed; do not retry unchanged |
| 401 | `cohort_code_invalid` | Code is invalid, expired, or revoked; stop automatic upload and surface parent action |
| 409 | `period_conflict` | A different batch ID already owns this participant/week; retain locally for explicit resolution |
| 413 | `payload_too_large` | Body exceeds 4 KiB; do not retry unchanged |
| 429 | `rate_limited` | Honor `Retry-After` and `retryAfterSeconds`; keep the single local batch |
| 500 | `internal` | No commit is acknowledged; bounded exponential retry is allowed |
| 503 | `temporarily_unavailable` | Preserve local batch and retry after the supplied delay |

Responses set `Cache-Control: no-store`. Logs use generated `requestId`, operation, status,
latency bucket, and error code only. Metric values and authorization material are excluded.

## Firestore shape and rules

The one `cohortMeasurements` collection holds three server-authored document kinds, each stamped
with `_schemaVersion: 1`: idempotent `batch`, transactional `quota`, and `revocation`. A batch stores
the participant-token HMAC, code HMAC, period, three counters, received timestamp, and batch ID.
A quota stores only bucket keys and counts. A revocation tombstone blocks later batches and drives
deletion under the signed study retention policy. None is connected to a household or learner.

Client rules deny every operation. "Write-only" describes the product path: the Function writes
with Admin SDK authority, while iOS and web clients can neither write Firestore directly nor read
the collection.

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /cohortMeasurements/{documentId} {
      allow read, write: if false;
    }
    match /{document=**} {
      allow read, write: if false;
    }
  }
}
```

The emulator suite proves anonymous, authenticated, and admin-claim client contexts all receive
permission denied. The Function integration test uses Admin SDK and separately proves that a
valid request commits exactly once.

## Post-MVP parent-record backend

```mermaid
flowchart TB
    IOS["Parent-enabled iOS sync adapter"]
    Web["Authenticated parent record web"]
    Auth["Firebase Auth<br/>Sign in with Apple provider"]
    RecordAPI["recordApi<br/>Functions v2, Node 22 TypeScript"]
    StoreKitAPI["storeKitNotifications<br/>Functions v2, Node 22 TypeScript"]
    ExportAPI["recordExport<br/>Functions v2, Node 22 TypeScript"]
    Apple["Apple<br/>identity and signed StoreKit events"]
    DB[("Firestore<br/>household-scoped versioned record")]
    Object[("Expiring export object<br/>parent download only")]

    IOS -->|"Firebase ID token plus validated command"| RecordAPI
    Web -->|"Firebase ID token plus validated query"| RecordAPI
    RecordAPI -->|"verify identity"| Auth
    RecordAPI -->|"transactional sync and reads"| DB
    Apple -->|"Sign in with Apple assertion"| Auth
    Apple -->|"App Store Server Notification v2 JWS"| StoreKitAPI
    StoreKitAPI -->|"verified entitlement update"| DB
    Web -->|"request export"| ExportAPI
    ExportAPI -->|"verify identity and entitlement"| Auth
    ExportAPI -->|"consistent record snapshot"| DB
    ExportAPI -->|"write short-lived package"| Object
```

All Functions use the repository's existing Node 22 TypeScript runtime, Firebase Functions v2,
structured logs without record payloads, Zod input validation, and Secret Manager parameters.
No client reads or writes Firestore directly; the deny-by-default rules remain closed and trusted
Functions use Admin SDK after application authorization.

### Service responsibilities

| Service | Contract and authorization |
| --- | --- |
| `recordApi` | Verifies a Firebase ID token backed by Sign in with Apple, derives the household from the verified UID, checks consent and server entitlement for paid record operations, accepts idempotent staged sync chunks, and serves only that household. Instruction never calls it and never checks entitlement. |
| `storeKitNotifications` | Accepts App Store Server Notifications v2, verifies the signed JWS chain/environment/bundle/product, deduplicates notification and transaction IDs, and transactionally projects `active`, `gracePeriod`, `expired`, `revoked`, or `billingRetry` into `entitlements/current`. It trusts no entitlement flag sent by a client. |
| `recordExport` | Verifies parent identity, ownership, and current entitlement; reads a consistent learner snapshot; resolves skill labels against the stamped taxonomy version; creates a versioned JSON plus human-readable PDF package; and returns a short-lived, single-household download. |

Sign in with Apple private relay is the default address retained by Firebase Auth when Apple
provides it. The `Household` document stores the verified owner UID and consent facts, not an email
copied from a client claim. Multi-child records remain subcollections of that household.

### Sync and entitlement invariants

- The first local migration uses an idempotency key, a staging generation, record counts, and
  checksums. Only a validated generation becomes active; rollback leaves local history untouched.
- Incremental writes are idempotent by stable local UUID and reject an unknown `_schemaVersion`.
- An entitlement unlocks parent record views, snapshots, and exports. It never filters curriculum,
  teaching engines, attempts, or local mastery.
- A client-supplied `householdId`, owner UID, mastery label, or entitlement state is never trusted.
- Record snapshots contain evidence-backed skill language and never represent diagnosis.

## Migrations

The repository already provides `scripts/migrate.mjs`, a Firestore migration runner with explicit
project selection, dry-run plans, bounded batches, checkpoint-after-write behavior, quarantine,
idempotent `_schemaVersion` stamps, and non-destructive expansion. Every post-MVP Firestore
migration uses that runner. A migration is planned and rehearsed against synthetic data, applied
as the expand/migrate step, verified by counts and checksums, and contracted only in a later
release. Do not add one-off Admin SDK migration scripts.

## Deployment gates

For the MVP, the deploy manifest must contain one Hosting site, one `cohortIngest` Function, one
Firestore ruleset, and no other Function export. For the record phase, deployments remain
environment-explicit and require emulator contract tests, Firestore rule tests, migration plan
output, entitlement replay tests, and a local-to-cloud rollback rehearsal. Neither phase is
authorized for production merely by this document.
