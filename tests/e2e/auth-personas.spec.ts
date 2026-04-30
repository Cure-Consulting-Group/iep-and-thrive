import { test, expect } from '@playwright/test'
import { ACCOUNTS, login, logout, PersonaKey } from './fixtures'

const PERSONAS: PersonaKey[] = ['inquiry', 'deposited', 'enrolled']

test.describe('Test persona auth flows', () => {
  for (const persona of PERSONAS) {
    test(`${persona} persona: login → portal → logout`, async ({ page }) => {
      await login(page, persona)

      await expect(page.locator('body')).toContainText(/\[TEST\]/)

      await logout(page)

      await page.goto('/portal')
      await page.waitForURL(/\/login/, { timeout: 10_000 })
    })
  }

  test('invalid credentials show error and stay on /login', async ({ page }) => {
    await page.goto('/login')
    await page.getByPlaceholder('parent@email.com').fill('parent-test-inquiry@iepandthrive.com')
    await page.getByPlaceholder('••••••••').fill('WrongPassword!')
    await page.getByRole('button', { name: /sign in/i }).click()
    await page.waitForTimeout(2_500)
    expect(page.url()).toMatch(/\/login/)
  })

  test('parent cannot reach /admin', async ({ page }) => {
    await login(page, 'enrolled')
    await page.goto('/admin')
    await page.waitForTimeout(2_000)
    expect(page.url()).not.toMatch(/\/admin\/?$/)
  })
})
