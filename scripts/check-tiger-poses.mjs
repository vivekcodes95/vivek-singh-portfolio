import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:600,height:440}});
page.on('console',m=>console.log(m.type(),m.text()));
await page.goto('http://127.0.0.1:4173/');
await page.emulateMedia({reducedMotion:'reduce'});
await page.evaluate(async()=>{
 document.body.innerHTML='<div id="test"></div>';document.body.style.margin='0';
 const {createTiger}=await import('/tiger.js');const host=document.querySelector('#test');
 window.tigerTest=await createTiger(host);const canvas=host.querySelector('canvas');canvas.style.width='600px';canvas.style.height='437px';
});
for(const time of [0,.4,.8,1.2,1.6,2,2.4,2.8]){await page.evaluate(t=>tigerTest.draw(t),time);await page.screenshot({path:`qa/tiger-rig/walk-${time}.png`});}
await browser.close();
