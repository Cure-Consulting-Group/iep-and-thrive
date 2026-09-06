import { test, expect, type Browser } from '@playwright/test'

/**
 * Opens a context whose clock is pinned to `iso` before any page script runs.
 * The countdown derives its copy from `new Date()` at render time, so without
 * a pinned clock these assertions silently change meaning as real time passes
 * and become time bombs — which is exactly how the two "open state" tests
 * below started failing once May 30 2026 went by.
 *
 * Both `new Date()` and `Date.now()` honor the override.
 */
async function contextAtTime(browser: Browser, iso: string) {
  const context = await browser.newContext()
  await context.addInitScript(`(() => {
    const fakeNow = new Date(${JSON.stringify(iso)}).getTime()
    const RealDate = Date
    class FakeDate extends RealDate {
      constructor(...args) {
        if (args.length === 0) { super(fakeNow) } else { super(...args) }
      }
      static now() { return fakeNow }
    }
    globalThis.Date = FakeDate
  })()`)
  return context
}

// Fixed points either side of the May 30 2026 enrollment deadline.
const BEFORE_DEADLINE = '2026-05-01T12:00:00Z'
const AFTER_DEADLINE = '2026-07-15T12:00:00Z'

test.describe('Marketing site', () => {
  test('landing page renders hero + countdown + login link', async ({ page }) => {
    await page.goto('/')
    const h1 = page.getByRole('heading', { level: 1 }).first()
    await expect(h1).toBeVisible()
    await expect(h1).toContainText(/IEP team/i)
    await expect(page.getByText(/May 30/i).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Parent Login/i }).first()).toBeVisible()
    await expect(page.getByRole('link', { name: /Reserve a Spot/i }).first()).toBeVisible()
  })

  test('hero advertises cohort cap of 6 and excludes stale numbers', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Students per cohort')).toBeVisible()
    const body = await page.locator('body').textContent()
    expect(body).not.toMatch(/4-6 students|4–6 students/)
    expect(body).not.toMatch(/8-10 students|8–10 students/)
    expect(body).not.toMatch(/Mon-Thu|Mon–Thu/)
  })

  test('countdown is visible adjacent to hero CTA cluster (ticket A3)', async ({ browser }) => {
    const context = await contextAtTime(browser, BEFORE_DEADLINE)
    const page = await context.newPage()
    await page.goto('/')
    const heroCountdown = page.getByTestId('enrollment-countdown').first()
    await expect(heroCountdown).toBeVisible()
    // Wait for hydration so we get the live "open"/"closed" state, not the
    // SSR placeholder.
    await expect(heroCountdown).toHaveAttribute('data-status', 'open')
    const text = (await heroCountdown.textContent())?.trim() ?? ''
    expect(text).toContain('Enrollment closes')
    expect(text).toContain('May 30, 2026')
    // Day count must parse as a positive integer.
    const match = text.match(/Enrollment closes in (\d+) days?/)
    expect(match, `expected day count in: ${text}`).not.toBeNull()
    if (match) {
      expect(Number(match[1])).toBeGreaterThan(0)
    }
    await context.close()
  })

  test('countdown is visible inside the standalone /enroll form header', async ({ browser }) => {
    const context = await contextAtTime(browser, BEFORE_DEADLINE)
    const page = await context.newPage()
    await page.goto('/enroll')
    const formCountdown = page.getByTestId('enrollment-countdown').first()
    await expect(formCountdown).toBeVisible()
    await expect(formCountdown).toHaveAttribute('data-status', 'open')
    const text = (await formCountdown.textContent())?.trim() ?? ''
    expect(text).toContain('Enrollment closes')
    expect(text).toContain('May 30, 2026')
    await context.close()
  })

  test('countdown falls back to waitlist copy after the deadline', async ({ browser }) => {
    const context = await contextAtTime(browser, AFTER_DEADLINE)
    const page = await context.newPage()
    await page.goto('/')
    const heroCountdown = page.getByTestId('enrollment-countdown').first()
    await expect(heroCountdown).toBeVisible()
    await expect(heroCountdown).toHaveAttribute('data-status', 'closed')
    const text = (await heroCountdown.textContent())?.trim() ?? ''
    expect(text).toContain('Waitlist only')
    expect(text).toContain('May 30, 2026')
    await context.close()
  })

  test('FAQ page loads', async ({ page }) => {
    const response = await page.goto('/faq')
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  })

  test('program page loads', async ({ page }) => {
    const response = await page.goto('/program')
    expect(response?.status()).toBe(200)
  })

  test('legal pages return 200', async ({ page }) => {
    for (const path of ['/privacy', '/terms']) {
      const response = await page.goto(path)
      expect(response?.status(), `${path} should return 200`).toBe(200)
    }
  })

  test('login page renders form', async ({ page }) => {
    await page.goto('/login')
    await expect(page.getByPlaceholder('parent@email.com')).toBeVisible()
    await expect(page.getByPlaceholder('••••••••')).toBeVisible()
  })
})
