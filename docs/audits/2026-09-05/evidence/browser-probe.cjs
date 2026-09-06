// Read-only browser probe against the local Hosting emulator.
// Run with NODE_PATH=$PWD/node_modules from the repository root.
const { chromium } = require('@playwright/test');
const fs = require('node:fs');
const path = require('node:path');

(async () => {
  const out = path.join(process.cwd(), 'docs/audits/2026-09-05/evidence');
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const results = [];
  try {
    for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
      const context = await browser.newContext({ viewport });
      // Do not contact production Firebase, analytics, or external services.
      await context.route('**/*', route => new URL(route.request().url()).hostname === '127.0.0.1' ? route.continue() : route.abort());
      const page = await context.newPage();
      for (const route of ['/', '/tutoring', '/program', '/enroll', '/login', '/privacy', '/terms', '/portal/students/synthetic-child/sessions', '/definitely-missing-audit-page']) {
        const errors = [];
        const onError = e => errors.push(e.message);
        page.on('pageerror', onError);
        const response = await page.goto('http://127.0.0.1:39189' + route, { waitUntil: 'networkidle' });
        results.push({ viewport: viewport.width, route, status: response.status(), finalUrl: page.url(), ...await page.evaluate(() => ({
          title: document.title,
          headings: [...document.querySelectorAll('h1')].map(e => e.textContent),
          overflow: document.documentElement.scrollWidth > innerWidth,
          text: document.body.innerText.slice(0, 1700),
        })), errors });
        if (route === '/' || route === '/tutoring') {
          await page.screenshot({ path: path.join(out, (route === '/' ? 'home' : 'tutoring') + '-' + viewport.width + '.png'), fullPage: true });
        }
        page.off('pageerror', onError);
      }
      await context.close();
    }
    fs.writeFileSync(path.join(out, 'browser-results.json'), JSON.stringify(results, null, 2));
    console.log(JSON.stringify(results.map(({ text, ...r }) => r), null, 2));
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
