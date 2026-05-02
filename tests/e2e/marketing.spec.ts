import { test, expect } from '@playwright/test'

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

  test('countdown is visible adjacent to hero CTA cluster (ticket A3)', async ({ page }) => {
    await page.goto('/')
    const heroCountdown = page.getByTestId('enrollment-countdown').first()
    await expect(heroCountdown).toBeVisible()
    // Wait for hydration so we get the live "open"/"closed" state, not the
    // SSR placeholder.
    await expect(heroCountdown).toHaveAttribute('data-status', /open|closed/)
    const text = (await heroCountdown.textContent())?.trim() ?? ''
    expect(text).toContain('Enrollment closes')
    expect(text).toContain('May 30, 2026')
    // Day count must parse as a positive integer.
    const match = text.match(/Enrollment closes in (\d+) days?/)
    expect(match, `expected day count in: ${text}`).not.toBeNull()
    if (match) {
      expect(Number(match[1])).toBeGreaterThan(0)
    }
  })

  test('countdown is visible inside the standalone /enroll form header', async ({ page }) => {
    await page.goto('/enroll')
    const formCountdown = page.getByTestId('enrollment-countdown').first()
    await expect(formCountdown).toBeVisible()
    await expect(formCountdown).toHaveAttribute('data-status', /open|closed/)
    const text = (await formCountdown.textContent())?.trim() ?? ''
    expect(text).toContain('Enrollment closes')
    expect(text).toContain('May 30, 2026')
  })

  test('countdown falls back to waitlist copy after the deadline', async ({ browser }) => {
    // Inject a fake "now" well past May 30 2026 before any page script runs.
    // Both Date() with no args and Date.now() honor the override; tagged
    // template literals downstream consume Date through these surfaces.
    const context = await browser.newContext()
    await context.addInitScript(() => {
      const fakeNow = new Date('2026-07-15T12:00:00Z').getTime()
      const RealDate = Date
      // @ts-ignore - intentional override for test
      class FakeDate extends RealDate {
        constructor(...args: unknown[]) {
          if (args.length === 0) {
            super(fakeNow)
          } else {
            // @ts-ignore - forward args verbatim
            super(...(args as []))
          }
        }
        static now() {
          return fakeNow
        }
      }
      // @ts-ignore - replace global Date
      globalThis.Date = FakeDate
    })
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
