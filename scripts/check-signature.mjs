import {chromium} from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const b=await chromium.launch({headless:true,channel:'chrome'});await mkdir('qa/signature',{recursive:true});
try{
const p=await b.newPage({viewport:{width:1440,height:1000}});const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.goto('http://127.0.0.1:4173/');await p.waitForTimeout(100);
const name=p.locator('.personal-name');
assert.ok(await name.evaluate(e=>e.classList.contains('signature-intro')),'Initial Me landing should write the signature');
assert.ok(await name.evaluate(e=>e.getAnimations({subtree:true}).length)>0,'Initial signature animation missing');
for(const t of [0,450,1400,2400,3700,4200]){
await name.evaluate((e,t)=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=t}),t);
await name.screenshot({path:`qa/signature/full-${t}.png`});
}
await p.reload();await p.waitForTimeout(100);
assert.ok(await name.evaluate(e=>e.classList.contains('signature-intro')),'A fresh Me page load should write the signature');
assert.ok(await name.evaluate(e=>e.getAnimations({subtree:true}).length)>0,'Reloaded signature animation missing');
await p.getByRole('navigation').getByRole('link',{name:'UX Design',exact:true}).click();await p.waitForURL('**/ux-design/');
assert.ok(await p.locator('.sidebar').evaluate(e=>e.classList.contains('profile-arriving')));
const small=p.locator('.sidebar-profile-name');
assert.equal(await small.locator('.signature-writing').count(),0,'Sidebar must use its previous transition');
for(const t of [0,600,1100,1740,2000]){
await small.evaluate((e,t)=>e.getAnimations({subtree:true}).forEach(a=>{a.pause();a.currentTime=t}),t);
await small.screenshot({path:`qa/signature/short-${t}.png`});
}
await p.getByRole('navigation').getByRole('link',{name:'Spatial Design',exact:true}).click();await p.waitForURL('**/spatial-design/');
assert.equal(await small.evaluate(e=>e.getAnimations({subtree:true}).length),0,'Sidebar signature should remain static between sections');
await p.getByRole('navigation').getByRole('link',{name:'Me',exact:true}).click();await p.waitForURL('http://127.0.0.1:4173/');await p.waitForTimeout(600);
assert.equal(await p.locator('.sidebar').evaluate(e=>e.classList.contains('has-profile')),false);
assert.equal(await name.evaluate(e=>e.classList.contains('signature-intro')),false,'Returning to Me must not replay handwriting');
assert.equal(await name.evaluate(e=>e.getAnimations({subtree:true}).length),0,'Returning signature should be static');
assert.equal(await name.locator('.signature-finished').evaluate(e=>getComputedStyle(e).visibility),'visible');
for(const mode of ['day','night','rain']){await p.locator(`[data-weather=${mode}]`).click();assert.equal(await name.locator('svg').evaluate(e=>getComputedStyle(e).color),await name.evaluate(e=>getComputedStyle(e).color));}
await p.emulateMedia({reducedMotion:'reduce'});assert.equal(await name.locator('.signature-finished').evaluate(e=>getComputedStyle(e).visibility),'visible');
await p.setViewportSize({width:390,height:844});await p.goto('http://127.0.0.1:4173/');assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
assert.deepEqual(errors,[]);console.log('Passed full-page handwriting, previous sidebar transition, static SPA return to Me, theme colours, reduced motion, and mobile layout.');
}finally{await b.close()}
