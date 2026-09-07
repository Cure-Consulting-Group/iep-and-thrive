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

The measurement exception needs one narrow server endpoint, not a general backend. It must accept a
code-authenticated batch of approved aggregate counters, write it once, and expose no client read
path.

## Implementation scope

1. Implement one Function with bounded request size, schema validation, issued-code verification,
   random-token validation, replay protection, and aggregate-field allowlisting.
2. Write to one dedicated collection with deny-by-default rules; do not add reads, learner lookup,
   names, device identifiers, or arbitrary event ingestion.
3. Return a minimal success/error envelope with no sensitive echo; keep code secrets in deployment
   configuration and document rotation.
4. Add emulator tests for valid, malformed, expired, replayed, unauthorized, oversized, and
   duplicate batches.

## Acceptance criteria

- **Given** a valid enrolled token, code, and approved aggregate batch, **when** the Function runs,
  **then** it writes one idempotent record and returns success without returning stored data.
- **Given** an invalid code, unknown field, oversized batch, replay, or unauthenticated request,
  **when** the Function runs, **then** it returns a bounded error and writes nothing.
- **Given** a client attempts to read or enumerate the measurement collection, **when** rules are
  evaluated, **then** the request is denied.

## Validation and evidence

Run Functions build, emulator unit/security tests, replay tests, rules tests, and secret scanning.
Attach the request/response contract, rule proof, and redacted emulator output.

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
