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
