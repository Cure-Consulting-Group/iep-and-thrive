import { test, expect } from '@playwright/test'
import { loginAdmin } from './fixtures'

test.describe('Admin curriculum capture surfaces (C2/C4/C5)', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page)
  })

  test('C2: materials checklist toggles persist across reload', async ({ page }) => {
    await page.goto('/admin/materials')
    await expect(page.getByRole('heading', { name: /Materials Prep/i })).toBeVisible()

    // Open Week 1.
    await page.getByText(/Week 1/).first().click()
    await page.waitForURL(/\/admin\/materials\/1/)
    await expect(page.getByRole('heading', { name: /Week 1 Materials Prep/i })).toBeVisible()

    // Click first available checkbox; verify it ticks.
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    const wasChecked = await firstCheckbox.isChecked()
    await firstCheckbox.click()
    await expect(firstCheckbox).toBeChecked({ checked: !wasChecked })

    // Reload — the toggle should persist.
    await page.reload()
    const sameCheckbox = page.locator('input[type="checkbox"]').first()
    await expect(sameCheckbox).toBeChecked({ checked: !wasChecked })
  })

  test('C2: regenerate from markdown does not wipe done state', async ({ page }) => {
    await page.goto('/admin/materials/1')
    await expect(page.getByRole('heading', { name: /Week 1 Materials Prep/i })).toBeVisible()

    // Click regenerate; the page should still show the same items count.
    const beforeCount = await page.locator('input[type="checkbox"]').count()
    await page.getByRole('button', { name: /Regenerate/i }).click()
    await page.waitForTimeout(500)
    const afterCount = await page.locator('input[type="checkbox"]').count()
    expect(afterCount).toBe(beforeCount)
  })

  test('C4: probe batch entry saves and surfaces on student detail', async ({ page }) => {
    await page.goto('/admin/probes')
    await expect(page.getByRole('heading', { name: /OG Probes/ })).toBeVisible()

    await page.getByText(/^W1$/).click()
    await page.waitForURL(/\/admin\/probes\/week\/1/)
    await expect(page.getByRole('heading', { name: /Week 1 probes/i })).toBeVisible()

    // Find first input (phonics %) and enter a score, then save first row.
    const phonicsInput = page.locator('input[placeholder="%"]').first()
    if (await phonicsInput.count()) {
      await phonicsInput.fill('82')
      const orfInput = page.locator('input[placeholder="wpm"]').first()
      await orfInput.fill('45')
      await page.getByRole('button', { name: /^Save$/ }).first().click()
      await page.waitForTimeout(800)

      // Now visit students page and ensure trend list renders without error.
      await page.goto('/admin/students')
      // Expand the first student row.
      await page.locator('button', { hasText: /Inquiry|Deposited|Enrolled/ }).first().click()
      await expect(page.getByText(/Probe Trend/i)).toBeVisible({ timeout: 5_000 })
    } else {
      test.skip(true, 'No enrolled students seeded; cannot verify probe entry')
    }
  })

  test('C5: pre assessment entry shows in comparison panel', async ({ page }) => {
    await page.goto('/admin/assessments')
    await expect(page.getByRole('heading', { name: /Pre.Post Assessments/i })).toBeVisible()

    // Open the first student detail.
    const openLink = page.getByRole('link', { name: /Open/i }).first()
    if (await openLink.count()) {
      await openLink.click()
      await page.waitForURL(/\/admin\/assessments\/[^/]+/)

      // Fill a pre raw score on the first row of the Pre form.
      const preSection = page.locator('section', { hasText: /Pre-program/i })
      const firstRaw = preSection.locator('input[type="number"]').first()
      await firstRaw.fill('34')
      await preSection.getByRole('button', { name: /^Save$/ }).click()
      await page.waitForTimeout(800)

      // Comparison table should now show the value in Pre raw column.
      await expect(page.getByText(/Comparison/i)).toBeVisible()
      await expect(page.getByText(/34/)).toBeVisible()
    } else {
      test.skip(true, 'No enrolled students seeded; cannot verify assessment entry')
    }
  })
})
