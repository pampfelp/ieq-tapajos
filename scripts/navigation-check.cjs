const { chromium } = require('C:/Users/Camille Oliveira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const assert = require('node:assert/strict');

const base = 'http://localhost:8765/';
const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
const dockRect = page => page.locator('.site-dock').evaluate(el => { const r = el.getBoundingClientRect(); return { top: Math.round(r.top), left: Math.round(r.left) }; });
const peeksReady = page => page.waitForFunction(() => document.querySelectorAll('.page-peek').length > 0);

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe' });
  const desktop = await browser.newContext({ viewport: { width: 1487, height: 1058 }, serviceWorkers: 'block' });
  const page = await desktop.newPage();
  desktop.setDefaultTimeout(8000);

  await page.goto(base + 'index.html');
  await peeksReady(page);
  await page.keyboard.press('ArrowLeft');
  await wait(400);
  assert.match(page.url(), /index\.html$/);

  // A pílula não pode sair do lugar enquanto a página desliza.
  await page.evaluate(() => window.scrollTo(0, 600));
  // No computador a navegação é o menu do topo; a pílula fica só no celular e no tablet.
  assert.equal(await page.locator('.site-dock').isVisible(), false);
  assert.equal(await page.locator('body>.site-header .desktop-nav a').count(), 5);
  await page.keyboard.press('ArrowRight');
  await wait(180);
  assert.equal(await page.locator('html').evaluate(el => el.classList.contains('is-paging')), true);
  assert.equal(await page.locator('.page-peek.is-active .desktop-nav a[aria-current="page"]').getAttribute('href'), './horarios.html');
  assert.equal(await page.locator('.page-peek.is-active [data-main-page]').getAttribute('data-main-page'), 'horarios');
  await page.waitForURL('**/horarios.html');

  await page.keyboard.press('ArrowLeft');
  await page.waitForURL('**/index.html');

  await page.locator('body>.site-header .desktop-nav a[href="./ministerios.html"]').click({ noWaitAfter: true });
  await wait(250);
  assert.equal(await page.locator('.page-peek.is-active [data-main-page]').getAttribute('data-main-page'), 'ministerios');
  await page.waitForURL('**/ministerios.html');
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/localizacao.html');
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/contato.html');

  await page.locator('#name').focus();
  await page.keyboard.press('ArrowRight');
  await wait(400);
  assert.match(page.url(), /contato\.html$/);
  await page.locator('#name').blur();
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/visita.html');
  await page.keyboard.press('ArrowRight');
  await wait(400);
  assert.match(page.url(), /visita\.html$/);

  // Trocar de página não recarrega; voltar e avançar usam o histórico e devolvem a rolagem.
  await page.goto(base + 'index.html');
  await peeksReady(page);
  await page.evaluate(() => { window.__semRecarga = 1; window.scrollTo({ top: 700, behavior: 'instant' }); });
  await wait(300);
  await page.keyboard.press('ArrowRight');
  await page.waitForURL('**/horarios.html');
  await wait(100);
  assert.equal(await page.evaluate(() => window.scrollY), 0);
  assert.equal(await page.title(), 'Horários dos cultos — IEQ Tapajós');
  assert.equal(await page.locator('main#main').getAttribute('data-main-page'), 'horarios');
  assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), 'https://pampfelp.github.io/ieq-tapajos/horarios.html');
  assert.equal(await page.locator('body>.site-header .desktop-nav a[aria-current="page"]').getAttribute('href'), './horarios.html');
  await page.goBack();
  await page.waitForURL('**/index.html');
  await wait(500);
  assert.equal(await page.evaluate(() => window.scrollY), 700);
  assert.equal(await page.title(), 'IEQ Tapajós — Uma casa para viver a fé');
  await page.goForward();
  await page.waitForURL('**/horarios.html');
  await wait(500);
  assert.equal(await page.locator('main#main').getAttribute('data-main-page'), 'horarios');
  await page.goBack();
  await page.waitForURL('**/index.html');
  await wait(500);

  // Link com âncora abre já no cartão destacado; o pedido de participação preenche a mensagem.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.locator('main#main .tile-kids').click();
  await page.waitForURL('**/ministerios.html#kids');
  await wait(500);
  assert.equal(await page.locator('#kids').evaluate(el => el.classList.contains('is-target')), true);
  assert.ok(Math.abs(await page.locator('#kids').evaluate(el => el.getBoundingClientRect().top) - 28) <= 2, 'rolou até o cartão');
  await page.locator('main#main a[href*="assunto=Kids"]').click();
  await page.waitForURL('**/contato.html?assunto=Kids');
  await wait(500);
  assert.equal(await page.locator('#message').inputValue(), 'Olá! Gostaria de saber mais sobre Kids.');
  await page.locator('body>.site-header .desktop-nav a[href="./contato.html"]').click();
  await wait(300);
  assert.match(page.url(), /contato\.html\?assunto=Kids$/);
  assert.equal(await page.evaluate(() => window.__semRecarga), 1);
  await page.reload();
  assert.equal(await page.locator('main#main').getAttribute('data-main-page'), 'contato');
  assert.equal(await page.locator('#message').inputValue(), 'Olá! Gostaria de saber mais sobre Kids.');

  const mobile = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, serviceWorkers: 'block' });
  const phone = await mobile.newPage();
  mobile.setDefaultTimeout(8000);
  const touch = await mobile.newCDPSession(phone);
  const point = (x, y) => ({ touchPoints: [{ x, y }] });
  async function press(x, y) { await touch.send('Input.dispatchTouchEvent', { type: 'touchStart', ...point(x, y) }); }
  async function moveTo(fromX, fromY, toX, toY, steps = 8, pause = 0) {
    for (let i = 1; i <= steps; i++) {
      await touch.send('Input.dispatchTouchEvent', { type: 'touchMove', ...point(fromX + (toX - fromX) * i / steps, fromY + (toY - fromY) * i / steps) });
      if (pause) await wait(pause);
    }
  }
  async function release() { await touch.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); }
  async function swipe(fromX, fromY, toX, toY) { await press(fromX, fromY); await moveTo(fromX, fromY, toX, toY); await release(); }

  await phone.goto(base + 'index.html');
  await peeksReady(phone);
  const phoneDock = await dockRect(phone);

  // Arraste curto e lento: a prévia acompanha o dedo e volta ao soltar.
  await press(300, 300);
  await moveTo(300, 300, 210, 302, 6, 60);
  const peekLeft = await phone.locator('.page-peek.is-active').evaluate(el => Math.round(el.getBoundingClientRect().left));
  assert.ok(Math.abs(peekLeft - (390 - 90)) <= 2, `prévia colada à página atual (left ${peekLeft})`);
  assert.deepEqual(await dockRect(phone), phoneDock);
  await release();
  await wait(500);
  assert.match(phone.url(), /index\.html$/);
  assert.equal(await phone.locator('html').evaluate(el => el.classList.contains('is-paging')), false);
  assert.equal(await phone.locator('body>main').evaluate(el => el.style.transform), '');

  // Arraste longo: completa o deslize, mantendo a pílula fixa até abrir a próxima página.
  await press(300, 300);
  await moveTo(300, 300, 95, 305);
  await release();
  await wait(150);
  assert.deepEqual(await dockRect(phone), phoneDock);
  await phone.waitForURL('**/horarios.html');
  await wait(100);
  assert.deepEqual(await dockRect(phone), phoneDock);

  await swipe(190, 180, 175, 480);
  await wait(450);
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
  await wait(450);
  assert.match(phone.url(), /contato\.html$/);

  // No fim da página, a pílula fica abaixo do último texto do rodapé.
  await phone.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  await wait(200);
  const footerTextBottom = await phone.locator('body>.site-footer .footer-bottom').evaluate(el => el.getBoundingClientRect().bottom);
  assert.ok(footerTextBottom <= (await dockRect(phone)).top, 'rodapé termina acima da pílula');

  const reduced = await browser.newContext({ viewport: { width: 1487, height: 1058 }, reducedMotion: 'reduce', serviceWorkers: 'block' });
  const noMotion = await reduced.newPage();
  await noMotion.goto(base + 'index.html');
  await noMotion.keyboard.press('ArrowRight');
  await noMotion.waitForURL('**/horarios.html');

  await browser.close();
  console.log('Sem recarregar, voltar/avançar com rolagem, âncora, assunto, F5, setas, pílula fixa, prévia no arraste, limites, campo de texto, gestos horizontal/vertical, rodapé e movimento reduzido: OK.');
})().catch(error => { console.error(error); process.exitCode = 1; });
