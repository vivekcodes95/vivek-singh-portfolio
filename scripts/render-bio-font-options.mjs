import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { resolve } from 'node:path';

const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
  const page=await browser.newPage({viewport:{width:1400,height:1050},deviceScaleFactor:1});
  await page.goto(`file://${resolve('qa/bio-font-options.html')}`);
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:'qa/bio-font-options.png',fullPage:true});
}finally{await browser.close();}
