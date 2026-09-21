const {chromium} = require('/opt/node22/lib/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const SCALE = 2;              // 1240 * 2 = 2480 px wide  (~400 dpi at 6.2 in)
  const browser = await chromium.launch({executablePath: '/opt/pw-browsers/chromium'});
  const page = await browser.newPage({viewport:{width:1240, height:880}, deviceScaleFactor: SCALE});
  for (const name of ['figure1','figure2']) {
    const svg = fs.readFileSync(path.join(__dirname,'assets',name+'.svg'),'utf8');
    await page.setContent(`<!doctype html><html><body style="margin:0;background:#fff">${svg}</body></html>`);
    await page.waitForTimeout(150);
    await page.screenshot({path: path.join(__dirname,'assets',name+'.png'), clip:{x:0,y:0,width:1240,height:880}});
    console.log('rendered', name);
  }
  await browser.close();
})();
