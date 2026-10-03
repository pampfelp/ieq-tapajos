const { chromium } = require('C:/Users/Camille Oliveira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

const base = 'http://localhost:8765/';

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const desktop = await browser.newContext({ viewport: { width: 1487, height: 1058 }, serviceWorkers: 'block' });
  const page = await desktop.newPage();

  await page.goto(base + 'index.html');
  await page.keyboard.press('ArrowLeft');
  await page.waitForTimeout(350);
  assert.match(page.url(), /index\.html$/);

  await page.keyboard.press('ArrowRight');
  assert.equal(await page.locator('body').evaluate(el => el.classList.contains('page-leave-forward')), true);
  await page.waitForURL('**/horarios.html');
  assert.equal(await page.locator('body').evaluate(el => el.classList.contains('page-enter-forward')), true);
  await page.waitForTimeout(450);
  assert.equal(await page.locator('html').evaluate(el => el.classList.contains('page-transitioning')), false);

  await page.keyboard.press('ArrowLeft');
  await page.waitForURL('**/index.html');
  assert.equal(await page.locator('body').evaluate(el => el.classList.contains('page-enter-backward')), true);

  await page.locator('.site-dock a[href="./ministerios.html"]').click({ noWaitAfter: true });
  assert.equal(await page.locator('body').evaluate(el => el.classList.contains('page-leave-forward')), true);
  await page.waitForURL('**/ministerios.html');
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/localizacao.html');
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/contato.html');

  await page.locator('#name').focus();
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(350);
  assert.match(page.url(), /contato\.html$/);
  await page.locator('#name').blur();
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/visita.html');
  await page.keyboard.press('ArrowRight');
  await page.waitForTimeout(350);
  assert.match(page.url(), /visita\.html$/);

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const phone = await mobile.newPage();
  const touch = await mobile.newCDPSession(phone);
  async function swipe(fromX, fromY, toX, toY) {
    await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fromX, y: fromY }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: toX, y: toY }] });
    await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  }
  await phone.goto(base + 'index.html');
  await swipe(300, 190, 95, 205);
  await phone.waitForURL('**/horarios.html');
  assert.equal(await phone.locator('body').evaluate(el => el.classList.contains('page-enter-forward')), true);

  await swipe(190, 180, 175, 480);
  await phone.waitForTimeout(400);
  assert.match(phone.url(), /horarios\.html$/);

  const startY = await phone.evaluate(() => [180, 260, 360, 460, 560, 660].find(y => {
    const el = document.elementFromPoint(95, y);
    return el?.closest('main') && !el.closest('a,button,input,textarea,select,label,iframe');
  }));
  assert.ok(startY, 'there is a non-interactive place to swipe back');
  await swipe(95, startY, 300, startY + 15);
  await phone.waitForURL('**/index.html');

  await phone.locator('.ministry-tile').first().scrollIntoViewIfNeeded();
  const tileBox = await phone.locator('.ministry-tile').first().boundingBox();
  await swipe(300, tileBox.y + 70, 95, tileBox.y + 82);
  await phone.waitForURL('**/horarios.html');

  await phone.goto(base + 'contato.html');
  await phone.locator('#message').scrollIntoViewIfNeeded();
  const messageBox = await phone.locator('#message').boundingBox();
  await swipe(messageBox.x + messageBox.width * .75, messageBox.y + messageBox.height * .5,
    messageBox.x + messageBox.width * .25, messageBox.y + messageBox.height * .5);
  await phone.waitForTimeout(350);
  assert.match(phone.url(), /contato\.html$/);

  const reduced = await browser.newContext({ viewport: { width: 1487, height: 1058 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const noMotion = await reduced.newPage();
  await noMotion.goto(base + 'index.html');
  await noMotion.keyboard.press('ArrowRight');
  await noMotion.waitForURL('**/horarios.html');
  assert.equal(await noMotion.locator('body').evaluate(el => el.classList.contains('page-enter-forward')), false);

  await browser.close();
  console.log('Setas, limites, campo de texto, gestos horizontal/vertical e movimento reduzido: OK.');
})().catch(error => { console.error(error); process.exitCode = 1; });
