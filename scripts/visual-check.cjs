const { chromium } = require('C:/Users/Camille Oliveira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const out = path.join(__dirname, '..', 'qa');
  fs.mkdirSync(out, { recursive: true });
  const pages = ['index', 'horarios', 'ministerios', 'localizacao', 'contato', 'visita', 'admin'];
  const errors = [];
  for (const name of pages) {
    for (const [view, width, height] of [['desktop', 1487, 1058], ['tablet', 768, 900], ['mobile', 390, 844]]) {
      const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
      page.on('pageerror', error => errors.push(`${name}/${view}: ${error.message}`));
      await page.goto(`http://localhost:8765/${name}.html`, { waitUntil: 'domcontentloaded' });
      await page.screenshot({ path: path.join(out, `${name}-${view}.png`), fullPage: true });
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 2);
      if (overflow) errors.push(`${name}/${view}: horizontal overflow`);
      const missingImages = await page.evaluate(() => [...document.querySelectorAll('body>main [data-image]')]
        .filter(slot => !slot.matches('.carousel-track>[data-has-image="false"]') && !slot.querySelector('img')?.naturalWidth)
        .map(slot => slot.dataset.image));
      if (missingImages.length) errors.push(`${name}/${view}: images not loaded: ${missingImages.join(', ')}`);
      await page.close();
    }
  }
  await browser.close();
  console.log(errors.length ? errors.join('\n') : 'Screenshots criadas; sem erros JS ou overflow horizontal.');
  if (errors.length) process.exitCode = 1;
})();
