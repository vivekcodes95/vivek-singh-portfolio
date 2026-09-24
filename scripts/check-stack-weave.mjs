import {chromium} from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import {mkdir} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});await mkdir('qa/stack-weave',{recursive:true});
 await page.goto('http://127.0.0.1:4173/');await page.waitForFunction(()=>document.querySelector('.home-grid')?.dataset.entering==='false');
 await page.mouse.move(50,40);
 await page.evaluate(()=>{
   const grid=document.querySelector('.home-grid');window.originalCards=[...grid.children];window.weaveSamples=[];window.startRects=window.originalCards.map(c=>c.getBoundingClientRect().toJSON());
   function sample(t){window.weaveSamples.push({t,entering:grid.dataset.entering,progress:Number(grid.dataset.progress),same:window.originalCards.every(c=>c.isConnected),cards:window.originalCards.map(c=>{const r=c.getBoundingClientRect(),s=getComputedStyle(c);return {href:c.getAttribute('href'),loaded:c.querySelector('img').complete&&c.querySelector('img').naturalWidth>0,x:r.x,y:r.y,opacity:Number(s.opacity),z:s.zIndex,height:c.offsetHeight};})});if(grid.dataset.shuffling==='true')requestAnimationFrame(sample);}
   document.querySelector('[data-shuffle]').click();requestAnimationFrame(sample);
 });
 await page.waitForTimeout(740);await page.screenshot({path:'qa/stack-weave/side-pass.png'});
 await page.waitForTimeout(530);await page.screenshot({path:'qa/stack-weave/front-back.png'});
 await page.waitForFunction(()=>document.querySelector('.home-grid').dataset.shuffling==='false');await page.waitForTimeout(700);
 const result=await page.evaluate(()=>({samples:window.weaveSamples,start:window.startRects,end:window.originalCards.map(c=>c.getBoundingClientRect().toJSON())}));
 assert.ok(result.samples.length>30);
 assert.ok(result.samples.every(s=>s.same&&s.entering==='false'&&s.cards.every(c=>c.opacity===1&&c.loaded)),'Deck disappears or is replaced mid-shuffle');
 const original=result.samples[0].cards.map(c=>c.href);
 const changes=[0,1,2].map(i=>({index:i,time:result.samples.find(s=>s.cards[i].href!==original[i])?.t})).sort((a,b)=>a.time-b.time);
 assert.deepEqual(changes.map(c=>c.index),[2,0,1],'Next card must change one at a time as it advances');
 assert.ok(changes[1].time-changes[0].time>400&&changes[2].time-changes[1].time>400,'Content changed in a batch');
 assert.ok(await page.locator('.shuffle-fog').evaluate(el=>Number(getComputedStyle(el).opacity)<=.16),'Fog obscures cards');
 const frontXs=result.samples.map(s=>s.cards[1].x);assert.ok(Math.max(...frontXs)-Math.min(...frontXs)>200,'No side shuffle');
 for(let i=1;i<result.samples.length;i++){const a=result.samples[i-1],b=result.samples[i];if(b.t-a.t>45)continue;for(let j=0;j<3;j++)assert.ok(Math.hypot(b.cards[j].x-a.cards[j].x,b.cards[j].y-a.cards[j].y)<95,'Discontinuous card motion');}
 assert.equal(await page.locator('.home-grid').getAttribute('data-open'),'true','Shuffle must expand automatically');
 assert.equal(await page.locator('.home-grid [inert]').count(),0);
 await page.mouse.move(10,10);await page.waitForTimeout(500);assert.equal(await page.locator('.home-grid').getAttribute('data-open'),'true');
 await page.screenshot({path:'qa/stack-weave/settled.png'});console.log('Passed: stable card elements, continuous visible motion, side-to-back movement, automatic expansion that stays open.');
}finally{await browser.close();}
