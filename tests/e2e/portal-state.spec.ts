import { test, expect } from '@playwright/test'
import { login } from './fixtures'

test.describe('Portal state per lifecycle stage', () => {
  test('inquiry persona: portal loads + student row visible', async ({ page }) => {
    await login(page, 'inquiry')
    await expect(page.getByText(/\[TEST\] Avery Inquiry/).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Inquiry/i).first()).toBeVisible()
  })

  test('deposited persona: portal shows deposited stage', async ({ page }) => {
    await login(page, 'deposited')
    await expect(page.getByText(/\[TEST\] Riley Deposited/).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Deposited/i).first()).toBeVisible()
  })

  test('enrolled persona: portal shows enrolled stage', async ({ page }) => {
    await login(page, 'enrolled')
    await expect(page.getByText(/\[TEST\] Jordan Enrolled/).first()).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/Enrolled/i).first()).toBeVisible()
  })

  test('portal navigation links resolve without 4xx', async ({ page }) => {
    await login(page, 'enrolled')
    for (const path of ['/portal/bookings', '/portal/intake', '/portal/profile', '/portal/reports', '/portal/resources', '/portal/notifications']) {
      const response = await page.goto(path)
      expect(response?.status(), `${path} should not 4xx`).toBeLessThan(400)
    }
  })
})
