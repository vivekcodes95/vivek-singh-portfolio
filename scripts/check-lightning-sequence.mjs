import {chromium} from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';

const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  await page.addInitScript(()=>{
    if(!sessionStorage.getItem('rain-sequence-test')){localStorage.clear();sessionStorage.setItem('rain-sequence-test','ready');}
    globalThis.__RAIN_LIGHTNING_TIMING__={firstStorm:.45,cycle:.35,doubleGap:.08};
  });
  await page.goto('http://127.0.0.1:4173/');
  await page.getByRole('button',{name:'Rain mode',exact:true}).waitFor();
  await page.evaluate(()=>{
    const scene=document.querySelector('.night-scene');
    globalThis.__lightningEvents=[];
    new MutationObserver(records=>{
      if(records.some(record=>record.attributeName==='data-lightning-count')){
        globalThis.__lightningEvents.push({
          count:Number(scene.dataset.lightningCount),
          sequence:scene.dataset.lightningSequence,
          x:Number(scene.dataset.lightningX),
          time:performance.now()
        });
      }
    }).observe(scene,{attributes:true});
  });
  await page.getByRole('button',{name:'Rain mode',exact:true}).click();
  await page.waitForFunction(()=>Number(document.querySelector('.night-scene').dataset.lightningCount)>=6,undefined,{timeout:3000});
  const result=await page.evaluate(()=>({
    events:globalThis.__lightningEvents,
    next:Number(document.querySelector('.night-scene').dataset.nextLightning)
  }));
  const flashes=result.events.filter(event=>event.count>0).slice(0,6);
  assert.deepEqual(flashes.map(event=>event.count),[1,2,3,4,5,6]);
  assert.deepEqual(flashes.map(event=>event.sequence),['entry','double','double','single','double','double']);
  assert.ok(flashes[2].time-flashes[1].time<180,'The paired flashes should be back to back');
  assert.ok(flashes[3].time-flashes[2].time>180,'The single flash should follow after the configured cycle');
  assert.ok(new Set(flashes.map(event=>event.x)).size>=3,'Lightning should move across randomized positions');
  for(const route of ['/ux-design/','/spatial-design/','/photography/','/ai-projects/','/history/']){
    await page.goto(`http://127.0.0.1:4173${route}`);
    await page.waitForFunction(()=>document.documentElement.dataset.theme==='rain'&&Number(document.querySelector('.night-scene')?.dataset.lightningCount)>=1,undefined,{timeout:2500});
  }
  console.log('Passed: immediate entry flash, two-second delayed alternating double/single bursts, back-to-back timing, randomized positions, and rain lightning across every collection.');
}finally{await browser.close();}
