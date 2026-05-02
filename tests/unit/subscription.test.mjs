// Pure-function tests for the booking-gate state machine in lib/subscription.ts.
//
// Run with: `node tests/unit/subscription.test.mjs`
//
// Strategy mirrors tests/unit/dates.test.mjs: compile lib/subscription.ts to a
// tmpdir on the fly with the project's tsc binary, then dynamically import
// the emitted JS. Keeps lib/subscription.ts as the single source of truth.
import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, writeFileSync, existsSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"

const repoRoot = path.resolve(import.meta.dirname, "..", "..")

function findTsc(start) {
  let dir = start
  while (true) {
    const candidate = path.join(dir, "node_modules", ".bin", "tsc")
    if (existsSync(candidate)) return candidate
    const parent = path.dirname(dir)
    if (parent === dir) {
      throw new Error(
        "Could not find tsc — run `npm install` in the repo root before " +
        "executing this test."
      )
    }
    dir = parent
  }
}
const tsc = findTsc(repoRoot)
const outDir = mkdtempSync(path.join(tmpdir(), "iep-sub-test-"))

// firebase/firestore is imported only for its `Timestamp` type. We strip the
// import (`import type` becomes a no-op after compilation, but the runtime
// `import` for the value side is unused; tsc still leaves the import line
// out because it's `import type`-only. Confirm by writing a stub that
// re-exports the file with the type import elided via --skipLibCheck.
execFileSync(
  tsc,
  [
    "--target", "es2022",
    "--module", "esnext",
    "--moduleResolution", "bundler",
    "--skipLibCheck",
    "--outDir", outDir,
    path.join(repoRoot, "lib", "subscription.ts"),
  ],
  { stdio: "inherit" }
)
writeFileSync(
  path.join(outDir, "package.json"),
  JSON.stringify({ type: "module" })
)

const sub = await import(pathToFileURL(path.join(outDir, "subscription.js")).href)
const { bookingGateState, canBookSession, sessionsRemaining, TUTORING_PRICING } = sub

const baseSub = (overrides = {}) => ({
  tier: "weekly",
  status: "active",
  stripeCustomerId: "cus_test",
  stripeSubscriptionId: "sub_test",
  currentPeriodStart: "2026-05-01T00:00:00.000Z",
  currentPeriodEnd: "2026-05-31T00:00:00.000Z",
  sessionsAllowedPerCycle: 4,
  sessionsUsedThisCycle: 0,
  cancelAtPeriodEnd: false,
  createdAt: "2026-04-01T00:00:00.000Z",
  updatedAt: "2026-05-01T00:00:00.000Z",
  ...overrides,
})

test("anonymous when no authUid", () => {
  const s = bookingGateState({ authUid: null, subscription: null })
  assert.equal(s.kind, "anonymous")
})

test("no-subscription when authed but no sub doc", () => {
  const s = bookingGateState({ authUid: "uid_a", subscription: null })
  assert.equal(s.kind, "no-subscription")
})

test("no-subscription when status is incomplete", () => {
  const s = bookingGateState({
    authUid: "uid_a",
    subscription: baseSub({ status: "incomplete" }),
  })
  assert.equal(s.kind, "no-subscription")
})

test("paused when status=paused regardless of session count", () => {
  const s = bookingGateState({
    authUid: "uid_a",
    subscription: baseSub({ status: "paused", sessionsUsedThisCycle: 0 }),
  })
  assert.equal(s.kind, "paused")
})

test("past-due when status=past_due", () => {
  const s = bookingGateState({
    authUid: "uid_a",
    subscription: baseSub({ status: "past_due" }),
  })
  assert.equal(s.kind, "past-due")
})

test("canceled when status=canceled even with sessions remaining", () => {
  const s = bookingGateState({
    authUid: "uid_a",
    subscription: baseSub({ status: "canceled", sessionsUsedThisCycle: 0 }),
  })
  assert.equal(s.kind, "canceled")
})

test("active-bookable when active + sessions remaining", () => {
  const s = bookingGateState({
    authUid: "uid_a",
    subscription: baseSub({ sessionsUsedThisCycle: 1 }),
  })
  assert.equal(s.kind, "active-bookable")
  if (s.kind === "active-bookable") {
    assert.equal(s.remaining, 3)
  }
})

test("active-exhausted when used >= allowed", () => {
  const s = bookingGateState({
    authUid: "uid_a",
    subscription: baseSub({ sessionsUsedThisCycle: 4 }),
  })
  assert.equal(s.kind, "active-exhausted")
})

test("active-exhausted clamps when usage exceeds allowed (defensive)", () => {
  const s = bookingGateState({
    authUid: "uid_a",
    subscription: baseSub({ sessionsUsedThisCycle: 99 }),
  })
  assert.equal(s.kind, "active-exhausted")
})

test("canBookSession is true only for active+remaining", () => {
  assert.equal(canBookSession(null), false)
  assert.equal(canBookSession(baseSub({ status: "paused" })), false)
  assert.equal(canBookSession(baseSub({ sessionsUsedThisCycle: 4 })), false)
  assert.equal(canBookSession(baseSub({ sessionsUsedThisCycle: 1 })), true)
})

test("sessionsRemaining clamps to 0 and reflects allowance", () => {
  assert.equal(sessionsRemaining(null), 0)
  assert.equal(sessionsRemaining(baseSub({ sessionsUsedThisCycle: 0 })), 4)
  assert.equal(sessionsRemaining(baseSub({ sessionsUsedThisCycle: 99 })), 0)
})

test("TUTORING_PRICING shape matches design spec", () => {
  assert.equal(TUTORING_PRICING.dropIn.amount, 125)
  assert.equal(TUTORING_PRICING.iepReview.amount, 250)
  assert.equal(TUTORING_PRICING.weekly.monthly, 460)
  assert.equal(TUTORING_PRICING.weekly.sessionsPerCycle, 4)
  assert.equal(TUTORING_PRICING.twiceWeekly.monthly, 880)
  assert.equal(TUTORING_PRICING.twiceWeekly.sessionsPerCycle, 8)
})
