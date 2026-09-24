import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir } from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1000}});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('qa/deck-interactions',{recursive:true});
await page.goto('http://127.0.0.1:4173/');
await page.waitForFunction(()=>document.querySelector('.home-grid')?.dataset.entering==='false');
const grid=page.locator('.home-grid');
const urls=()=>page.locator('.home-grid > a').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
const initial=await urls();
async function checkPaintings(){
  const images=await page.locator('.home-grid .art img').evaluateAll(nodes=>nodes.map(img=>({src:img.getAttribute('src'),loaded:img.complete&&img.naturalWidth>0})));
  if(images.length!==3||new Set(images.map(img=>img.src)).size!==3||images.some(img=>!img.loaded))throw Error('Expected three different loaded mountain paintings');
  return images.map(img=>img.src);
}
const initialImages=await checkPaintings();
await page.screenshot({path:'qa/deck-interactions/stack.png',fullPage:true});
const bounds=await grid.boundingBox();const x=bounds.x+bounds.width/2,y=bounds.y+100;
await page.mouse.move(x,y);await page.waitForFunction(()=>Number(document.querySelector('.home-grid').dataset.progress)>.99);
await page.screenshot({path:'qa/deck-interactions/hover.png',fullPage:true});
// Normal pointer navigation and slow back-and-forth movement must not redeal.
for(const dx of [20,-20,20,-20,20]){await page.mouse.move(x+dx,y);await page.waitForTimeout(240);}
if(await grid.getAttribute('data-deal'))throw Error('Ordinary motion triggered a shuffle');
if(await page.locator('.shuffle-fog').getAttribute('data-active')==='true')throw Error('Ordinary motion emitted fog');
// A short rapid shake, similar to the Mac cursor-locator gesture.
for(let i=0;i<8;i++){await page.mouse.move(x+(i%2?32:-32),y+2*(i%2));await page.waitForTimeout(38);}
await page.waitForFunction(()=>document.querySelector('.shuffle-fog')?.dataset.active==='true');
await page.waitForTimeout(250);
if(await grid.getAttribute('data-deal'))throw Error('Cards changed before the fog had time to linger');
await page.screenshot({path:'qa/deck-interactions/fog.png',fullPage:true});
await page.waitForFunction(()=>Number(document.querySelector('.home-grid').dataset.deal)===1);
await page.waitForFunction(()=>document.querySelector('.home-grid').dataset.shuffling==='false');
await page.waitForTimeout(600);
if(await page.locator('.shuffle-fog').getAttribute('data-active')==='true')throw Error('Fog did not dissipate after revealing the new cards');
const next=await urls();if(new Set(next).size!==3||next.some(u=>initial.includes(u)))throw Error('Shuffle did not produce three new articles');
const nextImages=await checkPaintings();
if(nextImages.some(src=>initialImages.includes(src)))throw Error('Shuffle reused artwork from the previous three cards');
await page.screenshot({path:'qa/deck-interactions/reshuffled.png',fullPage:true});
await page.getByRole('button',{name:'Shuffle articles'}).click();
await page.waitForFunction(()=>Number(document.querySelector('.home-grid').dataset.deal)===2&&document.querySelector('.home-grid').dataset.shuffling==='false');
if((await urls()).some(u=>next.includes(u)))throw Error('Button repeated current articles');
const buttonImages=await checkPaintings();
if(buttonImages.some(src=>nextImages.includes(src)))throw Error('Button shuffle reused artwork from the previous three cards');
await page.setViewportSize({width:390,height:844});await page.waitForTimeout(500);
const mobileBounds=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,items:[...document.querySelectorAll('body *')].map(el=>({tag:el.tagName,cls:el.className.toString(),right:el.getBoundingClientRect().right,sw:el.scrollWidth,cw:el.clientWidth,transform:getComputedStyle(el).transform})).filter(el=>el.right>innerWidth||el.sw>el.cw+2)}));
if(mobileBounds.scrollWidth>mobileBounds.width)throw Error('Mobile overflow '+JSON.stringify(mobileBounds));
await page.emulateMedia({reducedMotion:'reduce'});await page.getByRole('button',{name:'Shuffle articles'}).click();
await page.waitForFunction(()=>Number(document.querySelector('.home-grid').dataset.deal)===3);
if(await page.locator('.home-grid [inert]').count())throw Error('Reduced-motion cards inaccessible');
await browser.close();if(errors.length)throw Error(errors.join('\n'));
console.log('Passed: hover spread, ordinary motion ignored, rapid shake redeals three new links, mountain images, button, mobile, reduced motion.');
