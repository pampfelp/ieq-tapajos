const { chromium } = require('C:/Users/Camille Oliveira/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');

(async()=>{
  const context=await chromium.launchPersistentContext('C:/Users/Camille Oliveira/Desktop/Site IEQ Tapajós/qa/pwa-profile',{headless:true,executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',viewport:{width:393,height:851},deviceScaleFactor:2,isMobile:true,hasTouch:true});
  const page=await context.newPage();
  const cdp=await context.newCDPSession(page);
  await cdp.send('Page.enable');
  await page.goto('http://localhost:8765/index.html',{waitUntil:'domcontentloaded'});
  await page.evaluate(()=>navigator.serviceWorker.ready);
  const manifest=await cdp.send('Page.getAppManifest');
  const install=await cdp.send('Page.getInstallabilityErrors');
  const registered=await page.evaluate(async()=>Boolean((await navigator.serviceWorker.getRegistration())?.active));
  console.log(JSON.stringify({registered,manifestErrors:manifest.errors,installabilityErrors:install.installabilityErrors},null,2));
  await context.close();
  if(!registered||manifest.errors.length||install.installabilityErrors.length)process.exitCode=1;
})().catch(error=>{console.error(error);process.exitCode=1;});
