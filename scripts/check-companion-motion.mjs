import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('.tiger-pupil').first().waitFor({state:'attached'});
  await page.evaluate(()=>document.fonts.ready);
  for(const route of ['/','/ux-design/','/photography/']){
    if(route!=='/'){
      await page.locator(`nav a[href="${route}"]`).click();
      await page.waitForURL(`**${route}`);
    }
    const placement=await page.evaluate(()=>{
      const tiger=document.querySelector('.logo-tiger').getBoundingClientRect();
      const label=document.querySelector('nav a span').getBoundingClientRect();
      return {faceLeft:tiger.left+tiger.height*210/1213,navLeft:label.left,bottomGap:innerHeight-tiger.bottom};
    });
    assert.ok(Math.abs(placement.faceLeft-placement.navLeft)<1,'Tiger face must align with navigation text');
    assert.ok(Math.abs(placement.bottomGap)<1,'Tiger must meet the viewport bottom edge');
    await page.evaluate(()=>scrollTo({top:200,behavior:'instant'}));
    assert.ok(await page.locator('.logo-tiger').evaluate(el=>Math.abs(innerHeight-el.getBoundingClientRect().bottom)<1),'Tiger must stay docked while scrolling');
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  }
  await page.locator('nav a[href="/"]').click();await page.waitForURL('http://127.0.0.1:4173/');
  await page.waitForTimeout(4000);
  const samplePromise=page.evaluate(()=>new Promise(resolve=>{
    const samples=[],start=performance.now();
    function sample(now){
      const control=document.querySelector('.weather-control'),monkey=document.querySelector('.rope-monkey');
      samples.push({time:now-start,x:control.getBoundingClientRect().left,angle:parseFloat(monkey.style.transform.slice(7))});
      if(now-start<5000)requestAnimationFrame(sample);else resolve(samples);
    }
    requestAnimationFrame(sample);
  }));
  await page.locator('nav a[href="/ux-design/"]').click();
  const samples=await samplePromise;
  const first=samples[0],last=samples.at(-1);
  assert.ok(Math.abs(first.x-last.x)>10,'Control must move between home and grid positions');
  assert.ok(samples.some(s=>Math.abs(s.x-first.x)>2&&Math.abs(s.x-last.x)>2),'Control must interpolate rather than jump');
  const peak=Math.max(...samples.map(s=>Math.abs(s.angle)));
  assert.ok(peak>3,`Moving the control must swing the monkey: peak ${peak}`);
  assert.ok(Math.abs(last.angle)<peak*.5,'Swing must lose energy and settle');
  const aligned=await page.evaluate(()=>Math.abs(document.querySelector('.weather-control').getBoundingClientRect().right-document.querySelector('.collection-grid').getBoundingClientRect().right)<1);
  assert.ok(aligned,'Control must finish at grid edge');
  await page.mouse.move(10,10);await page.waitForTimeout(300);
  const before=await page.locator('.tiger-pupil').first().getAttribute('transform');
  await page.mouse.move(1400,990);await page.waitForTimeout(300);
  const after=await page.locator('.tiger-pupil').first().getAttribute('transform');
  const values=value=>value.match(/-?\d+\.?\d*/g).map(Number);
  assert.ok(values(before)[0]<0&&values(before)[1]<0&&values(after)[0]>0&&values(after)[1]>0,'Both pupil axes must follow the cursor');
  assert.equal(await page.locator('.tiger-mouth,.tiger-wide-eyes').count(),0,'Tiger expression must remain closed and unchanged');
  assert.equal(await page.locator('.tiger-pupil ellipse').first().getAttribute('rx'),'9','Tiger pupils must use their original size');
  assert.equal(await page.locator('.site-footer>span').first().textContent(),'Connect at');
  await mkdir('qa/companions',{recursive:true});
  await page.screenshot({path:'qa/companions/desktop.png'});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(900);
  assert.ok(await page.locator('.logo-tiger').isVisible());
  const overflow=await page.evaluate(()=>({width:innerWidth,scrollWidth:document.documentElement.scrollWidth,elements:[...document.querySelectorAll('body *')].filter(el=>el.getBoundingClientRect().right>innerWidth+1).map(el=>({tag:el.tagName,class:el.className?.baseVal??el.className,right:el.getBoundingClientRect().right})).slice(0,20)}));
  assert.ok(overflow.scrollWidth<=overflow.width,`Mobile must not overflow: ${JSON.stringify(overflow)}`);
  assert.ok(await page.locator('.logo-tiger').evaluate(el=>Math.abs(innerHeight-el.getBoundingClientRect().bottom)<1));
  await page.screenshot({path:'qa/companions/mobile.png'});
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.setViewportSize({width:1440,height:1000});await page.waitForTimeout(100);
  assert.equal(await page.locator('.weather-control').evaluate(el=>getComputedStyle(el).transitionDuration),'0s');
  assert.deepEqual(errors,[]);
  console.log(`Passed docked tiger, navigation alignment, two-axis gaze, responsive placement, reduced motion and rope inertia (peak ${peak.toFixed(1)}°, settled ${last.angle.toFixed(1)}°).`);
}finally{await browser.close();}
