import { Page, expect } from '@playwright/test'

// Passwords default to the documented formula (TestPass123!{persona}).
// CI overrides via E2E_*_PASSWORD env vars sourced from GitHub Actions
// secrets so credentials don't appear in CI logs even if the formula changes.
export const ACCOUNTS = {
  inquiry: {
    email: 'parent-test-inquiry@iepandthrive.com',
    password: process.env.E2E_INQUIRY_PASSWORD || 'TestPass123!inquiry',
    stage: 'Inquiry',
  },
  deposited: {
    email: 'parent-test-deposited@iepandthrive.com',
    password: process.env.E2E_DEPOSITED_PASSWORD || 'TestPass123!deposited',
    stage: 'Deposited',
  },
  enrolled: {
    email: 'parent-test-enrolled@iepandthrive.com',
    password: process.env.E2E_ENROLLED_PASSWORD || 'TestPass123!enrolled',
    stage: 'Enrolled',
  },
} as const

export type PersonaKey = keyof typeof ACCOUNTS

export async function login(page: Page, persona: PersonaKey) {
  const a = ACCOUNTS[persona]
  await page.goto('/login')
  await page.getByPlaceholder('parent@email.com').fill(a.email)
  await page.getByPlaceholder('••••••••').fill(a.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  await page.waitForURL(/\/portal($|\/)/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: /Welcome/ })).toBeVisible()
}

export async function logout(page: Page) {
  const signOut = page.getByRole('button', { name: /sign out/i }).first()
  await signOut.click()
  await page.waitForURL(/\/(login|$)/, { timeout: 10_000 })
}
