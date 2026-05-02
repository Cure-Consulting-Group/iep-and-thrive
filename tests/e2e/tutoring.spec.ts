import { test, expect } from '@playwright/test'
import { ACCOUNTS, login } from './fixtures'

/**
 * H10 — Tutoring booking gate + portal subscription e2e
 *
 * These specs run against the deployed site (`E2E_BASE_URL`, default
 * `https://iep-and-thrive.web.app`). The `subscriber` cases require
 * scripts/seed-test-accounts.mjs to have run on the live Firestore — they
 * skip gracefully via the `SKIP_SUBSCRIBER_TESTS=1` env var when no seeded
 * subscriber persona exists yet.
 *
 *   Run all:                npx playwright test tests/e2e/tutoring.spec.ts
 *   Run only public marketing flow:
 *     SKIP_SUBSCRIBER_TESTS=1 npx playwright test tests/e2e/tutoring.spec.ts
 *
 * Coverage map (per backlog H10):
 *   1. /tutoring renders correct prices ($125, $460, $880, $250)
 *   2. Drop-in CTA points at ?product=drop-in
 *   3. Weekly subscription CTA contains ?plan=weekly
 *   4. Twice-Weekly CTA contains ?plan=twice-weekly
 *   5. IEP Review CTA contains ?product=iep-review
 *   6. Anonymous /book?type=tutoring → "Sign in to book"
 *   7. Enrolled (no sub) /book?type=tutoring → "No active tutoring subscription"
 *   8. Subscriber /book?type=tutoring → SessionsCounter chip
 *   9. Subscriber /portal/subscription → plan summary + tracker
 */

const SKIP_SUBSCRIBER = process.env.SKIP_SUBSCRIBER_TESTS === '1'
const SKIP_TUTORING_PAGE = process.env.SKIP_TUTORING_PAGE === '1'

test.describe('Tutoring marketing page', () => {
  test.skip(
    SKIP_TUTORING_PAGE,
    'Run after Agent T-1 lands /tutoring (Epic H1/H2). Set SKIP_TUTORING_PAGE=1 to bypass.'
  )

  test('/tutoring renders correct prices', async ({ page }) => {
    await page.goto('/tutoring')
    const body = page.locator('body')
    await expect(body).toContainText('$125') // drop-in
    await expect(body).toContainText('$460') // weekly
    await expect(body).toContainText('$880') // twice-weekly
    await expect(body).toContainText('$250') // iep-review
  })

  test('drop-in CTA href contains ?product=drop-in', async ({ page }) => {
    await page.goto('/tutoring')
    const dropIn = page
      .getByRole('link', { name: /book drop-in|drop[- ]in|book.*drop.*session/i })
      .first()
    await expect(dropIn).toBeVisible()
    const href = await dropIn.getAttribute('href')
    expect(href).toMatch(/[?&]product=drop-in/)
  })

  test('weekly subscription CTA href contains ?plan=weekly', async ({ page }) => {
    await page.goto('/tutoring')
    const weekly = page
      .getByRole('link', { name: /start weekly|subscribe weekly|weekly plan/i })
      .first()
    await expect(weekly).toBeVisible()
    const href = await weekly.getAttribute('href')
    expect(href).toMatch(/[?&]plan=weekly/)
  })

  test('twice-weekly CTA href contains ?plan=twice-weekly', async ({ page }) => {
    await page.goto('/tutoring')
    const tw = page
      .getByRole('link', { name: /twice[- ]weekly/i })
      .first()
    await expect(tw).toBeVisible()
    const href = await tw.getAttribute('href')
    expect(href).toMatch(/[?&]plan=twice-weekly/)
  })

  test('IEP Review CTA href contains ?product=iep-review', async ({ page }) => {
    await page.goto('/tutoring')
    const iep = page
      .getByRole('link', { name: /iep review|book.*iep/i })
      .first()
    await expect(iep).toBeVisible()
    const href = await iep.getAttribute('href')
    expect(href).toMatch(/[?&]product=iep-review/)
  })
})

test.describe('Booking gate states', () => {
  test('Anonymous on /book?type=tutoring → BookingGate state A', async ({
    page,
    context,
  }) => {
    await context.clearCookies()
    await page.goto('/book?type=tutoring')
    // Card uses test-id booking-gate-anonymous OR shows the headline copy.
    const gate = page
      .getByTestId('booking-gate-anonymous')
      .or(page.getByRole('heading', { name: /sign in to book a tutoring session/i }))
    await expect(gate.first()).toBeVisible({ timeout: 15_000 })
  })

  test('Enrolled persona (no sub) on /book?type=tutoring → BookingGate state B', async ({
    page,
  }) => {
    await login(page, 'enrolled')
    await page.goto('/book?type=tutoring')
    const gate = page
      .getByTestId('booking-gate-no-subscription')
      .or(page.getByRole('heading', { name: /no active tutoring subscription/i }))
    await expect(gate.first()).toBeVisible({ timeout: 15_000 })
  })

  test('Subscriber on /book?type=tutoring → SessionsCounter chip', async ({
    page,
  }) => {
    test.skip(
      SKIP_SUBSCRIBER,
      'Subscriber persona not seeded. Run `npm run seed:test-accounts` and re-run.'
    )
    await login(page, 'subscriber' as keyof typeof ACCOUNTS)
    await page.goto('/book?type=tutoring')
    const counter = page.getByTestId('sessions-counter').first()
    await expect(counter).toBeVisible({ timeout: 15_000 })
    await expect(counter).toContainText(/sessions remaining/i)
  })
})

test.describe('Portal subscription page', () => {
  test('Subscriber on /portal/subscription sees plan summary + tracker', async ({
    page,
  }) => {
    test.skip(
      SKIP_SUBSCRIBER,
      'Subscriber persona not seeded. Run `npm run seed:test-accounts` and re-run.'
    )
    await login(page, 'subscriber' as keyof typeof ACCOUNTS)
    await page.goto('/portal/subscription')
    await expect(
      page.getByRole('heading', { name: /^subscription$/i }).first()
    ).toBeVisible()
    // Plan summary card — shows "Weekly · $460" per the seeded persona.
    await expect(page.locator('body')).toContainText(/Weekly/i)
    await expect(page.locator('body')).toContainText(/\$460/)
    // Sessions tracker — shows X / Y remaining
    await expect(page.locator('body')).toContainText(/of 4/i)
    // Customer portal CTA
    await expect(
      page.getByRole('button', { name: /manage subscription/i }).first()
    ).toBeVisible()
  })
})
