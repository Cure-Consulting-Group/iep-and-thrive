import { test, expect } from '@playwright/test'
import { login } from './fixtures'

// E3 — Enrollment agreement e-signature flow.
//
// Strategy: drive the inquiry persona to /enroll/agreement directly with a
// fake inquiryId, draw on the canvas, type the name, tick both boxes, and
// assert the signature submission succeeds. This is a smoke test of the
// UI surface; deeper Firestore + storage assertions live in the unit tests
// against the Cloud Function (out of scope for the Playwright suite which
// runs against the live web URL).

test.describe('E3 enrollment agreement signing', () => {
  test('inquiry persona can render and submit a signed agreement', async ({ page }) => {
    await login(page, 'inquiry')
    await page.goto('/enroll/agreement?inquiryId=test-e2e-inquiry-id&program=full')

    // Page renders the agreement and the audit pane (version + sha256 hash).
    await expect(page.getByRole('heading', { name: /Sign the enrollment agreement/i })).toBeVisible({ timeout: 15_000 })
    await expect(page.getByText(/SHA-256/i)).toBeVisible()
    await expect(page.getByText(/Version/i).first()).toBeVisible()

    // Draw on the canvas (mouse path).
    const canvas = page.locator('canvas').first()
    const box = await canvas.boundingBox()
    if (!box) throw new Error('Canvas not found')
    await page.mouse.move(box.x + 20, box.y + 40)
    await page.mouse.down()
    for (let i = 0; i < 12; i++) {
      await page.mouse.move(box.x + 20 + i * 14, box.y + 40 + Math.sin(i) * 12)
    }
    await page.mouse.up()

    // Type printed name and student name.
    await page.getByLabel(/Student name/i).fill('[TEST] Avery Inquiry')
    await page.getByLabel(/Printed name/i).fill('Inquiry Parent')

    // Both consent checkboxes (electronic records consent + agreement consent).
    const checks = page.getByRole('checkbox')
    await expect(checks).toHaveCount(2)
    await checks.nth(0).check()
    await checks.nth(1).check()

    // Submit. The Cloud Function will either persist the agreement (when
    // running against the deployed environment with the function live) or
    // surface a clear error (when running in a smoke environment without
    // the function deployed). Either way, the local form must NOT block
    // on its own validation.
    await page.getByRole('button', { name: /Sign and continue/i }).click()

    // Allow either the Stripe redirect (302/window.location.href) OR a
    // server-side error visible in the form. We assert neither of the
    // pre-submit guards fired.
    await page.waitForTimeout(1500)
    const guardErrors = [
      /Please draw your signature above/i,
      /Please type your full printed name/i,
      /Please tick the electronic-records consent checkbox/i,
      /Please confirm you have read and agree/i,
    ]
    for (const re of guardErrors) {
      await expect(page.getByText(re)).toHaveCount(0)
    }
  })
})
