// Schema-validation tests for the iOS session DTOs that the parent
// portal reads (Phase 3.1). The Firestore I/O layer in ios-progress.ts
// can't be unit-tested without a full SDK mock — instead we exercise
// equivalent Zod schemas inlined here.
//
// The schemas MUST stay in sync with lib/ios-progress.ts. Drift is
// caught by the Playwright e2e tests that hit a real Firestore. A
// future cleanup can extract these into lib/ios-progress-schemas.ts
// (no Firestore imports) and share with the runtime path.
//
// Run with: `node tests/unit/ios-progress.test.mjs`

import { test } from "node:test"
import assert from "node:assert/strict"
import { z } from "zod"

// ─── Mirrors lib/ios-progress.ts schemas (Date + ISO-string branches) ───

const FirestoreDate = z
  .union([
    z.instanceof(Date),
    z.string().transform((s) => new Date(s)),
  ])
  .refine((d) => !isNaN(d.getTime()), { message: "invalid date" })

const LessonProgressSchema = z.object({
  id: z.string(),
  levelIndex: z.number().int().nonnegative(),
  category: z.enum(["literacy", "math"]),
  isCompleted: z.boolean(),
  lastAttemptAt: FirestoreDate,
  score: z.number().int(),
})

const SparksRecordSchema = z.object({
  id: z.string(),
  amount: z.number().int(),
  reason: z.string(),
  earnedAt: FirestoreDate,
})

// ─── LessonProgress schema ───

test("LessonProgressSchema accepts a well-formed lesson doc (Date)", () => {
  const parsed = LessonProgressSchema.safeParse({
    id: "uuid-1",
    levelIndex: 0,
    category: "literacy",
    isCompleted: true,
    lastAttemptAt: new Date("2026-05-28T14:00:00Z"),
    score: 10,
  })
  assert.ok(parsed.success, JSON.stringify(parsed.error))
  assert.equal(parsed.data.category, "literacy")
})

test("LessonProgressSchema accepts ISO-string dates (Firestore JSON fallback)", () => {
  const parsed = LessonProgressSchema.safeParse({
    id: "uuid-1",
    levelIndex: 3,
    category: "math",
    isCompleted: true,
    lastAttemptAt: "2026-05-28T14:00:00.000Z",
    score: 8,
  })
  assert.ok(parsed.success)
  assert.ok(parsed.data.lastAttemptAt instanceof Date)
})

test("LessonProgressSchema rejects unknown category", () => {
  const parsed = LessonProgressSchema.safeParse({
    id: "uuid-1",
    levelIndex: 0,
    category: "social-emotional",
    isCompleted: true,
    lastAttemptAt: new Date(),
    score: 10,
  })
  assert.ok(!parsed.success)
})

test("LessonProgressSchema rejects negative levelIndex", () => {
  const parsed = LessonProgressSchema.safeParse({
    id: "uuid-1",
    levelIndex: -1,
    category: "literacy",
    isCompleted: true,
    lastAttemptAt: new Date(),
    score: 10,
  })
  assert.ok(!parsed.success)
})

test("LessonProgressSchema rejects malformed date string", () => {
  const parsed = LessonProgressSchema.safeParse({
    id: "uuid-1",
    levelIndex: 0,
    category: "literacy",
    isCompleted: true,
    lastAttemptAt: "not-a-date",
    score: 10,
  })
  assert.ok(!parsed.success)
})

// ─── SparksRecord schema ───

test("SparksRecordSchema accepts a well-formed sparks doc", () => {
  const parsed = SparksRecordSchema.safeParse({
    id: "uuid-2",
    amount: 10,
    reason: "mission_complete",
    earnedAt: new Date("2026-05-28T14:00:00Z"),
  })
  assert.ok(parsed.success)
  assert.equal(parsed.data.amount, 10)
})

test("SparksRecordSchema rejects non-integer amount", () => {
  const parsed = SparksRecordSchema.safeParse({
    id: "uuid-2",
    amount: 10.5,
    reason: "mission_complete",
    earnedAt: new Date(),
  })
  assert.ok(!parsed.success)
})

test("SparksRecordSchema accepts negative amounts (corrections/refunds)", () => {
  // Phase 4 telemetry may include negative adjustments. Don't lock
  // that out at the schema layer.
  const parsed = SparksRecordSchema.safeParse({
    id: "uuid-2",
    amount: -5,
    reason: "correction",
    earnedAt: new Date(),
  })
  assert.ok(parsed.success)
})
