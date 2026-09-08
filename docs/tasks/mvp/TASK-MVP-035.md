# TASK-MVP-035 — Implement the single consented cohort upload Function

| Field | Value |
| --- | --- |
| Epic | EPIC-M8 — Measurement |
| Priority / release gate | P0 / Stage 3 gate |
| Status | Proposed — review required |
| Proposed owner | Backend engineer |
| Estimate | 8 points; planning estimate, not a delivery commitment |
| Dependencies | TASK-MVP-034 |
| Design | None |

## Problem and intended outcome

The measurement exception needs one narrow server Function, not a general backend. It must
exchange a per-family single-use enrollment code once for a device-generated participant token,
accept an authenticated batch of approved aggregate counters, write it once, and expose no client
read path. A shared cohort code must not let one participant consume the study's quota.

## Implementation scope

1. Implement `POST /v1/cohort/enroll` with bounded request size, schema validation, constant-time
   single-use per-family enrollment-code verification, device-generated random-token validation,
   and an atomic consumed-code write. Never return the enrollment code or participant token.
2. Implement `POST /v1/cohort/batches` with the enrolled participant token, replay protection,
   idempotency, wide `daysSinceFirstOpen` buckets, and aggregate-field allowlisting. A revocation
   uses the same participant-token authentication and remains possible after a write quota is
   exhausted.
3. Apply failed-authentication rate limiting at the edge by source address with exponential
   backoff. Strip the address before the Function sees it. Apply accepted-request quotas per
   participant-token hash, never by shared cohort or enrollment code.
4. Write to one dedicated collection with deny-by-default rules; do not add reads, learner
   lookup, names, device identifiers, or arbitrary event ingestion.
5. Return the bounded error envelope in the backend contract with no sensitive echo; keep code
   secrets in deployment configuration and document rotation.
6. Add emulator/edge contract tests for valid, malformed, expired, replayed, reused-code,
   unauthorized, failed-auth backoff, oversized, duplicate, and per-participant-quota cases.

## Acceptance criteria

- **Given** a valid per-family enrollment code and a new device-generated participant token,
  **when** `/v1/cohort/enroll` runs, **then** it consumes the code exactly once and returns a
  bounded enrollment receipt without returning stored authentication material.
- **Given** a reused, invalid, or expired enrollment code, **when** enrollment runs, **then** it
  returns `enrollment_code_used` or `enrollment_code_invalid` and creates no participant.
- **Given** a valid enrolled participant token and approved aggregate batch, **when** the Function
  runs, **then** it writes one idempotent record and returns success without returning stored data.
- **Given** an invalid token, unknown field, oversized batch, replay, or unauthenticated request,
  **when** the Function runs, **then** it returns the bounded error envelope and writes nothing.
- **Given** repeated failed authentication from one source address, **when** the edge limiter
  evaluates the attempts, **then** it applies exponential backoff and strips the address before
  forwarding any request to the Function.
- **Given** one participant exhausts its accepted-request quota, **when** another participant
  submits a valid batch, **then** the second participant is not denied by the first participant's
  quota.
- **Given** a client attempts to read or enumerate the measurement collection, **when** rules are
  evaluated, **then** the request is denied.

## Validation and evidence

Run Functions build, emulator unit/security tests, edge backoff tests, replay tests, rules tests,
per-participant quota tests, and secret scanning. Attach the request/response contract, rule proof,
and redacted emulator output.

## Rollout, migration, and recovery

Deploy only after 034 and 036 approval. If writes fail, retain counters locally for the documented
retry window; never broaden permissions or create a fallback collection.

## Source evidence

- [ADR-000 D6](../../architecture/ADR-000-mvp-architecture-decisions.md#d6--the-only-free-tier-network-path-is-consented-cohort-measurement)
- [functions](../../../functions)
- [firestore rules](../../../firestore.rules)

## Definition of done

Code review is approved; new code has at least 80% coverage; inputs are validated; secrets are
configuration-managed; rules deny by default; and no client read path exists.
