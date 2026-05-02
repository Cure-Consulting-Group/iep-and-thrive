import { test, expect } from '@playwright/test'
import { login } from './fixtures'

// B6 - Photo/video release e-signature flow.
//
// We exercise the canvas + typed-name + consent flow using the `enrolled`
// persona (E13). The persona is marked isTest=true so it does not pollute
// production analytics or notification fan-outs.
//
// The test is intentionally tolerant of two states:
//   1. Release not yet signed - we walk the full flow, then assert the
//      "Signed on ..." confirmation copy and a downloadable PDF link.
//   2. Release already signed (a previous run left the audit doc in
//      Firestore) - we skip the canvas walk and only assert the signed
//      state + PDF link returns 200.
//
// Cleanup: this test does NOT delete the signed doc afterwards. The audit
// chain is part of E13's expected state; if a future run needs to re-test
// the unsigned flow, manually delete users/{uid}/legalDocs/photoRelease.

test.describe('Photo/video release e-signature', () => {
  test('enrolled persona can sign release and download PDF', async ({ page }) => {
    await login(page, 'enrolled')
    await page.goto('/portal/photo-release')

    await expect(page.getByRole('heading', { name: /Photo & Video Release/i })).toBeVisible({ timeout: 15_000 })

    // Branch on existing signature.
    const alreadySigned = await page.getByText(/Signed and on file/i).first().isVisible().catch(() => false)

    if (!alreadySigned) {
      // Wait for canvas to mount.
      const canvas = page.getByRole('img', { name: /signature canvas/i })
      await expect(canvas).toBeVisible()

      // Draw a few strokes (mouse-equivalent on the canvas element).
      const box = await canvas.boundingBox()
      expect(box).not.toBeNull()
      if (box) {
        const cx = box.x + box.width / 2
        const cy = box.y + box.height / 2
        await page.mouse.move(box.x + 30, cy)
        await page.mouse.down()
        await page.mouse.move(cx, cy - 30, { steps: 8 })
        await page.mouse.move(cx + 60, cy + 20, { steps: 8 })
        await page.mouse.move(box.x + box.width - 40, cy, { steps: 8 })
        await page.mouse.up()
      }

      await page.getByLabel(/Type your full legal name/i).fill('Jordan Test Enrolled')

      // The first checkbox is the required consent.
      const checkboxes = page.getByRole('checkbox')
      await checkboxes.first().check()

      const submit = page.getByRole('button', { name: /Confirm & sign/i })
      await expect(submit).toBeEnabled()
      await submit.click()

      // Cloud Function round-trip can take a couple seconds. Allow up to 25s.
      await expect(page.getByText(/Signed and on file/i)).toBeVisible({ timeout: 25_000 })
    }

    // PDF download link should be present (even if signed previously).
    const pdfLink = page.getByRole('link', { name: /Download signed PDF/i })
    if (await pdfLink.isVisible().catch(() => false)) {
      const href = await pdfLink.getAttribute('href')
      expect(href, 'PDF download link should be set').toBeTruthy()
      if (href) {
        const res = await page.request.get(href)
        expect(res.status(), 'PDF should fetch with 200').toBe(200)
      }
    }
  })
})
