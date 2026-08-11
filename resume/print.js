// Regenerates the PDF résumé from resume.html.
// Requires the "playwright" package with Chromium installed:
//   npm install playwright && npx playwright install chromium
// Usage (from the resume/ folder):
//   node print.js
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const src = path.join(__dirname, 'resume.html');
  const out = path.join(__dirname, '..', 'assets', 'pdf', 'Storm Schutte resume.pdf');

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file:///' + src.replace(/\\/g, '/'), { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  await page.pdf({
    path: out,
    format: 'Letter',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.55in', right: '0.55in' },
  });
  await browser.close();
  console.log('Wrote', out);
})();
