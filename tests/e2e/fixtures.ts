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
  // Epic H — used by tests/e2e/tutoring.spec.ts. Requires
  // scripts/seed-test-accounts.mjs to run with the subscriber persona.
  subscriber: {
    email: 'parent-test-subscriber@iepandthrive.com',
    password: process.env.E2E_SUBSCRIBER_PASSWORD || 'TestPass123!subscriber',
    stage: 'Subscriber',
  },
} as const

// Admin (instructor) account. Seeded via scripts/seed-test-accounts.mjs;
// has the admin:true custom claim required by ProtectedRoute requireAdmin.
export const ADMIN_ACCOUNT = {
  email: 'admin-test@iepandthrive.com',
  password: process.env.E2E_ADMIN_PASSWORD || 'TestPass123!admin',
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

export async function loginAdmin(page: Page) {
  await page.goto('/login')
  await page.getByPlaceholder('parent@email.com').fill(ADMIN_ACCOUNT.email)
  await page.getByPlaceholder('••••••••').fill(ADMIN_ACCOUNT.password)
  await page.getByRole('button', { name: /sign in/i }).click()
  // Admin lands on /admin (or /portal if claim not yet propagated; reload once).
  await page.waitForURL(/\/(admin|portal)($|\/)/, { timeout: 15_000 })
  if (!/\/admin/.test(page.url())) {
    await page.goto('/admin')
  }
  await expect(page.getByText(/Admin/).first()).toBeVisible({ timeout: 10_000 })
}

export async function logout(page: Page) {
  const signOut = page.getByRole('button', { name: /sign out/i }).first()
  await signOut.click()
  await page.waitForURL(/\/(login|$)/, { timeout: 10_000 })
}
