// Pure-function tests for the enrollment-deadline countdown logic.
//
// Run with: `node tests/unit/dates.test.mjs`
//
// Strategy: TypeScript runners (vitest/jest/tsx) are not part of this repo
// — adding them just for two pure helpers would be heavier than the helpers
// themselves. Instead we compile lib/dates.ts on the fly via the locally
// installed `tsc` binary, then dynamically import the emitted JS. This keeps
// `lib/dates.ts` as the single source of truth and lets the tests live in
// plain Node with zero new devDependencies.
import { test } from "node:test"
import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { mkdtempSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"

// 1) Compile lib/dates.ts to a temp directory using the project tsc.
const repoRoot = path.resolve(import.meta.dirname, "..", "..")
// Worktrees do not always have their own node_modules; walk upward until we
// find a tsc binary. This lets the test run from the main checkout, a git
// worktree, or CI without extra setup.
import { existsSync } from "node:fs"
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
const outDir = mkdtempSync(path.join(tmpdir(), "iep-dates-test-"))
execFileSync(
  tsc,
  [
    "--target", "es2022",
    "--module", "esnext",
    "--moduleResolution", "bundler",
    "--outDir", outDir,
    path.join(repoRoot, "lib", "dates.ts"),
  ],
  { stdio: "inherit" }
)
// Node refuses to load the .js as ESM unless the directory advertises it.
writeFileSync(path.join(outDir, "package.json"), JSON.stringify({ type: "module" }))

const dates = await import(pathToFileURL(path.join(outDir, "dates.js")).href)
const {
  daysUntilDeadline,
  getEnrollmentCountdown,
  ENROLLMENT_DEADLINE,
  ENROLLMENT_DEADLINE_LABEL,
} = dates

test("ENROLLMENT_DEADLINE is May 30, 2026 (label aligned)", () => {
  assert.equal(ENROLLMENT_DEADLINE.getFullYear(), 2026)
  assert.equal(ENROLLMENT_DEADLINE.getMonth(), 4) // May (0-indexed)
  assert.equal(ENROLLMENT_DEADLINE.getDate(), 30)
  assert.equal(ENROLLMENT_DEADLINE_LABEL, "May 30, 2026")
})

test("daysUntilDeadline returns positive integer well before the deadline", () => {
  // 60 calendar days before May 30, 2026 == March 31, 2026.
  const days = daysUntilDeadline(new Date(2026, 2, 31, 9, 0, 0))
  assert.equal(days, 60)
})

test("daysUntilDeadline returns 1 the day before the deadline", () => {
  const days = daysUntilDeadline(new Date(2026, 4, 29, 23, 0, 0))
  assert.equal(days, 1)
})

test("daysUntilDeadline returns 0 on the deadline date itself", () => {
  const days = daysUntilDeadline(new Date(2026, 4, 30, 8, 0, 0))
  assert.equal(days, 0)
})

test("daysUntilDeadline goes negative after the deadline", () => {
  const days = daysUntilDeadline(new Date(2026, 5, 1, 0, 0, 0)) // June 1
  assert.equal(days, -2)
})

test("getEnrollmentCountdown reports open + N days \u00B7 May 30, 2026 (plural)", () => {
  const state = getEnrollmentCountdown(new Date(2026, 4, 1, 9, 0, 0)) // May 1
  assert.equal(state.status, "open")
  assert.equal(state.days, 29)
  assert.equal(state.label, "Enrollment closes in 29 days \u00B7 May 30, 2026")
})

test("getEnrollmentCountdown uses singular day when one day remains", () => {
  const state = getEnrollmentCountdown(new Date(2026, 4, 29, 9, 0, 0))
  assert.equal(state.status, "open")
  assert.equal(state.days, 1)
  assert.equal(state.label, "Enrollment closes in 1 day \u00B7 May 30, 2026")
})

test("getEnrollmentCountdown swaps to waitlist copy on the deadline (N <= 0)", () => {
  const state = getEnrollmentCountdown(new Date(2026, 4, 30, 12, 0, 0))
  assert.equal(state.status, "closed")
  assert.equal(state.days, 0)
  assert.equal(state.label, "Waitlist only \u00B7 enrollment closed May 30, 2026")
})

test("getEnrollmentCountdown stays in waitlist mode after the deadline", () => {
  const state = getEnrollmentCountdown(new Date(2026, 6, 15, 9, 0, 0)) // July 15
  assert.equal(state.status, "closed")
  assert.ok(state.days < 0)
  assert.equal(state.label, "Waitlist only \u00B7 enrollment closed May 30, 2026")
})
