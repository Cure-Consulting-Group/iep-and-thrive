import { test, expect } from '@playwright/test'
import { ACCOUNTS, login } from './fixtures'

/**
 * Tutoring epic e2e — H1 (marketing) + H10 (booking gate + portal).
 *
 * Runs against the deployed site (`E2E_BASE_URL`, default
 * `https://iep-and-thrive.web.app`). The `subscriber`-state cases require
 * scripts/seed-test-accounts.mjs to have run on the live Firestore — they
 * skip gracefully via `SKIP_SUBSCRIBER_TESTS=1` when no seeded subscriber
 * persona exists yet.
 *
 *   Run all:        npx playwright test tests/e2e/tutoring.spec.ts
 *   Skip subscriber-state cases:
 *     SKIP_SUBSCRIBER_TESTS=1 npx playwright test tests/e2e/tutoring.spec.ts
 */

const SKIP_SUBSCRIBER = process.env.SKIP_SUBSCRIBER_TESTS === '1'

// ───────────────────────────────────────────────────────────────────
// H1 — Marketing page (anonymous)
// ───────────────────────────────────────────────────────────────────

test.describe('/tutoring marketing page (Epic H1)', () => {
  test('renders the tutoring hero h1 copy', async ({ page }) => {
    await page.goto('/tutoring')
    const h1 = page.getByRole('heading', { level: 1 }).first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText(/SPED expertise/i)
    await expect(h1).toContainText(/every week/i)
  })

  test('renders all 3 PricingCard prices and the IEP review price', async ({ page }) => {
    await page.goto('/tutoring')
    await expect(page.getByTestId('pricing-price-tutoring-drop-in')).toContainText('$125')
    await expect(page.getByTestId('pricing-price-tutoring-weekly')).toContainText('$460')
    await expect(page.getByTestId('pricing-price-tutoring-twice-weekly')).toContainText('$880')
    await expect(page.getByTestId('pricing-price-iep-review')).toContainText('$250')
  })

  test('pricing CTAs link to the correct Stripe endpoints', async ({ page }) => {
    await page.goto('/tutoring')

    const dropInCta = page.getByRole('link', { name: /Book a single session/i }).first()
    await expect(dropInCta).toHaveAttribute('href', /product=drop-in/)

    const weeklyCta = page.getByRole('link', { name: /Start weekly subscription/i })
    await expect(weeklyCta).toHaveAttribute('href', /plan=weekly/)

    const twiceCta = page.getByRole('link', { name: /Start twice-weekly subscription/i })
    await expect(twiceCta).toHaveAttribute('href', /plan=twice-weekly/)

    const iepCta = page.getByRole('link', { name: /Book IEP review/i })
    await expect(iepCta).toHaveAttribute('href', /product=iep-review/)
  })

  test('Nav contains a /tutoring link', async ({ page }) => {
    await page.goto('/')
    const tutoringNavLink = page
      .getByRole('navigation', { name: /Main navigation/i })
      .getByRole('link', { name: /^Tutoring$/i })
      .first()
    await expect(tutoringNavLink).toBeVisible()
    await expect(tutoringNavLink).toHaveAttribute('href', '/tutoring')
  })

  test('Footer contains a /tutoring link', async ({ page }) => {
    await page.goto('/')
    const footerTutoring = page
      .getByRole('navigation', { name: /Tutoring links/i })
      .getByRole('link', { name: /Year-Round Tutoring/i })
    await expect(footerTutoring).toHaveAttribute('href', '/tutoring')
  })

  test('Tutoring FAQ accordion opens and closes', async ({ page }) => {
    await page.goto('/tutoring')
    const firstFaq = page.getByRole('button', { name: /Do you tutor in person/i })
    await expect(firstFaq).toHaveAttribute('aria-expanded', 'false')
    await firstFaq.click()
    await expect(firstFaq).toHaveAttribute('aria-expanded', 'true')
  })
})

// ───────────────────────────────────────────────────────────────────
// H10 — Booking gate states (/book?type=tutoring)
// ───────────────────────────────────────────────────────────────────

test.describe('Booking gate states (Epic H5/H10)', () => {
  test('Anonymous → BookingGate "Sign in to book"', async ({ page }) => {
    await page.goto('/book?type=tutoring')
    await expect(page.getByText(/sign in to book/i).first()).toBeVisible()
  })

  test('Enrolled (no subscription) → "No active tutoring subscription"', async ({ page }) => {
    await login(page, ACCOUNTS.enrolled)
    await page.goto('/book?type=tutoring')
    await expect(page.getByText(/no active tutoring subscription/i).first()).toBeVisible()
  })

  test('Subscriber → SessionsCounter chip is visible', async ({ page }) => {
    test.skip(SKIP_SUBSCRIBER, 'Set SKIP_SUBSCRIBER_TESTS=1 if subscriber persona is not seeded.')
    if (!ACCOUNTS.subscriber) test.skip()
    await login(page, ACCOUNTS.subscriber!)
    await page.goto('/book?type=tutoring')
    await expect(page.getByRole('status').first()).toBeVisible()
  })
})

// ───────────────────────────────────────────────────────────────────
// H10 — /portal/subscription page
// ───────────────────────────────────────────────────────────────────

test.describe('Portal subscription page (Epic H6/H10)', () => {
  test('Subscriber sees plan summary + sessions tracker', async ({ page }) => {
    test.skip(SKIP_SUBSCRIBER, 'Set SKIP_SUBSCRIBER_TESTS=1 if subscriber persona is not seeded.')
    if (!ACCOUNTS.subscriber) test.skip()
    await login(page, ACCOUNTS.subscriber!)
    await page.goto('/portal/subscription')
    await expect(page.getByText(/active subscription/i).first()).toBeVisible()
    await expect(page.getByText(/sessions remaining/i).first()).toBeVisible()
    await expect(
      page.getByRole('button', { name: /manage subscription/i }).first()
    ).toBeVisible()
  })
})
