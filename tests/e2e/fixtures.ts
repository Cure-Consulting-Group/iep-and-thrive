import { Page, expect } from '@playwright/test'

const PASSWORD_ENV_VARS = {
  inquiry: 'E2E_INQUIRY_PASSWORD',
  deposited: 'E2E_DEPOSITED_PASSWORD',
  enrolled: 'E2E_ENROLLED_PASSWORD',
  subscriber: 'E2E_SUBSCRIBER_PASSWORD',
  admin: 'E2E_ADMIN_PASSWORD',
} as const

function resolvePassword(persona: keyof typeof PASSWORD_ENV_VARS): string {
  const envVar = PASSWORD_ENV_VARS[persona]
  const password = process.env[envVar]
  if (!password) {
    throw new Error(
      `Missing required E2E credential ${envVar}. Set ${envVar} before running this persona.`,
    )
  }
  return password
}

export const ACCOUNTS = {
  inquiry: {
    email: 'parent-test-inquiry@iepandthrive.com',
    get password() {
      return resolvePassword('inquiry')
    },
    stage: 'Inquiry',
  },
  deposited: {
    email: 'parent-test-deposited@iepandthrive.com',
    get password() {
      return resolvePassword('deposited')
    },
    stage: 'Deposited',
  },
  enrolled: {
    email: 'parent-test-enrolled@iepandthrive.com',
    get password() {
      return resolvePassword('enrolled')
    },
    stage: 'Enrolled',
  },
  // Epic H — used by tests/e2e/tutoring.spec.ts. Requires
  // scripts/seed-test-accounts.mjs to run with the subscriber persona.
  subscriber: {
    email: 'parent-test-subscriber@iepandthrive.com',
    get password() {
      return resolvePassword('subscriber')
    },
    stage: 'Subscriber',
  },
} as const

// Admin (instructor) account. Seeded via scripts/seed-test-accounts.mjs;
// has the admin:true custom claim required by ProtectedRoute requireAdmin.
export const ADMIN_ACCOUNT = {
  email: 'admin-test@iepandthrive.com',
  get password() {
    return resolvePassword('admin')
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
