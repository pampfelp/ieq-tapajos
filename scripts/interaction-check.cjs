const { chromium } = require('C:/Users/Camille Oliveira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();
  await page.goto('http://localhost:8765/index.html');
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'true');
  assert.equal(await page.locator('.mobile-nav').isVisible(), true);
  await page.locator('.menu-toggle').click();
  assert.equal(await page.locator('.mobile-nav').isVisible(), false);
  assert.equal(await page.locator('[data-route]').first().getAttribute('href').then(url => url.includes('R.%20Anhembi')), true);
  assert.equal(await page.locator('.cookie-banner').count(), 0);
  await page.evaluate(() => window.IEQ_APPLY_VALUES({home_photo:'https://example.com/foto.jpg'}));
  assert.equal(await page.locator('[data-image=home_photo]').getAttribute('data-has-image'), 'false');

  await page.goto('http://localhost:8765/contato.html');
  await page.locator('#name').fill('Pessoa de teste');
  await page.locator('#contact').fill('abcde');
  await page.locator('#message').fill('Gostaria de conhecer a igreja.');
  await page.locator('input[name=consent]').check();
  await page.locator('button[type=submit]').click();
  assert.match(await page.locator('.form-status').textContent(), /telefone ou e-mail válido/i);
  await page.locator('#contact').fill('91999999999');
  await page.locator('button[type=submit]').click();
  assert.match(await page.locator('.form-status').textContent(), /ainda está sendo configurado/i);

  await page.goto('http://localhost:8765/admin.html');
  await page.locator('#edit-value').fill('Uma casa de teste');
  await page.locator('#save-draft').click();
  await page.locator('#site-preview').contentFrame().locator('[data-content=home_title_before]').waitFor();
  assert.equal(await page.locator('#site-preview').contentFrame().locator('[data-content=home_title_before]').textContent(), 'Uma casa de teste');
  await page.waitForTimeout(250);
  assert.equal(await page.locator('#site-preview').contentFrame().locator('[data-content=home_title_before]').evaluate(el => el.classList.contains('admin-highlight')), true);
  await page.locator('#field-select').selectOption('home_photo');
  await page.locator('#photo-file').setInputFiles('C:/Users/Camille Oliveira/Desktop/Site IEQ Tapajós/assets/icon-192.png');
  assert.equal(await page.locator('#site-preview').contentFrame().locator('[data-image=home_photo]').getAttribute('data-has-image'), 'true');
  await page.locator('#reset-field').click();
  await page.waitForFunction(() => document.querySelector('#site-preview').contentDocument.querySelector('[data-image=home_photo] img')?.getAttribute('src') === './assets/ilustracao-home-worship.jpg');
  assert.equal(await page.locator('#site-preview').contentFrame().locator('[data-image=home_photo]').getAttribute('data-has-image'), 'true');
  await browser.close();
  console.log('Menu, rota, consentimento, formulário e painel local: OK.');
})().catch(error => { console.error(error); process.exitCode = 1; });
