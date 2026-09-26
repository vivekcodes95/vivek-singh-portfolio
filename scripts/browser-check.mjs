import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import { mkdir, writeFile } from 'node:fs/promises';
import { sections, posts } from './content.mjs';
await mkdir('qa',{recursive:true});
const browser=await chromium.launch({headless:true, channel:'chrome'});
const page=await browser.newPage({viewport:{width:1440,height:1050},deviceScaleFactor:1});
const errors=[];page.on('pageerror',e=>errors.push(e.message));
const results=[];
for(const route of ['/',...sections.map(s=>`/${s.slug}/`),...posts.map(p=>`/${p.section}/${p.slug}/`)]){
 const response=await page.goto('http://127.0.0.1:4173'+route);await page.waitForTimeout(100);
 if(response.status()!==200)throw Error(route+' not 200');
 const info=await page.evaluate(()=>({title:document.title,h1:document.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth,brokenImages:[...document.images].filter(i=>!i.complete||i.naturalWidth===0).length}));
 if(info.overflow||info.brokenImages)throw Error(JSON.stringify({route,...info}));
 results.push({route,...info});
}
await page.goto('http://127.0.0.1:4173/');await page.waitForTimeout(1200);await page.screenshot({path:'qa/home-desktop.png',fullPage:true,animations:'disabled'});
// The walking logo stays independent of the active navigation dot.
async function checkMarker(){await page.waitForSelector('.logo-tiger.ready canvas');if(await page.locator('nav [aria-current]').evaluate(n=>getComputedStyle(n,'::before').opacity)!=='1')throw Error('Active dot missing');}
await checkMarker();
await page.getByRole('navigation').getByRole('link',{name:'Spatial Design'}).click();await page.waitForURL('**/spatial-design/');await checkMarker();
await page.getByRole('navigation').getByRole('link',{name:'Myself',exact:true}).click();await page.waitForURL('http://127.0.0.1:4173/');await checkMarker();
// Rapid navigation keeps the correct page selected.
await page.getByRole('navigation').getByRole('link',{name:'Photography'}).click();
await page.getByRole('navigation').getByRole('link',{name:'UX Design'}).click();await page.waitForURL('**/ux-design/');await checkMarker();
await page.goto('http://127.0.0.1:4173/');
await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));await page.waitForTimeout(100);
await page.locator('[data-card]').first().hover();if(!await page.locator('.cursor-cue').isVisible())throw Error('Cursor cue missing');
await page.locator('[data-card]').first().click();await page.waitForURL('**/ux-design/room-to-think/');
if(await page.locator('nav [aria-current]').innerText()!=='Product Design')throw Error('Active nav lost');
await page.screenshot({path:'qa/reading-desktop.png',fullPage:true});
await page.setViewportSize({width:390,height:844});
for(const route of ['/','/ux-design/','/history/','/photography/','/spatial-design/','/ux-design/room-to-think/']){
 await page.goto('http://127.0.0.1:4173'+route);await page.waitForTimeout(100);
 if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Mobile overflow '+route);
}
await page.goto('http://127.0.0.1:4173/');await page.screenshot({path:'qa/home-mobile.png',fullPage:true});
await page.getByRole('button',{name:'Menu'}).click();await page.getByRole('navigation').getByRole('link',{name:'Photography'}).click();await page.waitForURL('**/photography/');
await page.screenshot({path:'qa/photography-mobile.png',fullPage:true});
await page.getByRole('button',{name:'Menu'}).click();await page.keyboard.press('Escape');if(await page.getByRole('button',{name:'Menu'}).getAttribute('aria-expanded')!=='false')throw Error('Escape menu failed');
await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('http://127.0.0.1:4173/');await page.locator('[data-card]').first().hover();if(await page.locator('.cursor-cue').isVisible())throw Error('Reduced motion cursor active');
await checkMarker();
if(await page.locator('.logo-tiger').getAttribute('data-pose')!=='standing')throw Error('Reduced motion tiger still moving');
await page.getByRole('navigation').getByRole('link',{name:'History',exact:true}).click();await page.waitForURL('**/history/');await checkMarker();
await page.evaluate(()=>document.documentElement.style.fontSize='200%');
if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth))throw Error('Text enlargement overflow');
await writeFile('qa/results.json',JSON.stringify({pages:results,errors,mobile:'passed',navigation:'passed',reducedMotion:'passed'},null,2));
await browser.close();if(errors.length)throw Error(errors.join('\n'));console.log(`Browser checks passed: ${results.length} pages, mobile, navigation, cursor, and reduced motion.`);
