import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
const browser=await chromium.launch({headless:true,channel:'chrome'});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/ux-design/');await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('.product-tiger-slot,.photography-tiger-slot,.ux-mascot-slot').count(),0,'A title mascot remains on Product Design');
  assert.equal(await page.locator('.rope-monkey').isVisible(),false,'The mode-selector monkey remains visible off the homepage');
  assert.equal(await page.locator('.weather-rope').first().isVisible(),false,'The mode-selector rope remains visible off the homepage');
  const alignment=await page.evaluate(()=>{
    const header=document.querySelector('.collection-header').getBoundingClientRect(),grid=document.querySelector('.collection-grid').getBoundingClientRect(),weather=document.querySelector('.weather-control').getBoundingClientRect();
    return {headerLeft:header.left,gridLeft:grid.left,weatherRight:weather.right,gridRight:grid.right};
  });
  assert.ok(Math.abs(alignment.headerLeft-alignment.gridLeft)<1,'Product Design heading does not align with the card grid');
  assert.ok(Math.abs(alignment.weatherRight-alignment.gridRight)<1,'Product Design mode selector does not align with the card grid');
  assert.equal(await page.locator('.weather-control').evaluate(element=>getComputedStyle(element).position),'absolute','Inner-page mode selector remains docked');
  const weatherTop=await page.locator('.weather-control').evaluate(element=>element.getBoundingClientRect().top);
  await page.evaluate(()=>scrollTo({top:180,behavior:'instant'}));await page.waitForTimeout(50);
  const scrollState=await page.locator('.weather-control').evaluate(element=>({top:element.getBoundingClientRect().top,scrollY}));
  assert.ok(scrollState.scrollY>0&&Math.abs((weatherTop-scrollState.top)-scrollState.scrollY)<2,'Mode selector does not scroll with the page');
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.setViewportSize({width:1120,height:900});await page.waitForTimeout(100);
  const clearance=await page.evaluate(()=>document.querySelector('.weather-control').getBoundingClientRect().left-document.querySelector('.collection-header p').getBoundingClientRect().right);
  assert.ok(clearance>=12,`Product Design description overlaps the weather control by ${Math.abs(clearance)}px`);
  const uxCards=page.locator('.ux-card');assert.equal(await uxCards.count(),6,'Product Design should contain the six homepage cards');
  assert.equal(await uxCards.locator('.art-mountain-placeholder img').count(),6,'Product Design cards are missing their homepage artwork');
  assert.equal(await uxCards.locator('.print-label').count(),0,'UX card labels or arrows remain');
  const gridGap=await page.locator('.collection-grid').evaluate(grid=>({row:getComputedStyle(grid).rowGap,column:getComputedStyle(grid).columnGap}));
  assert.deepEqual(gridGap,{row:'32px',column:'32px'});
  await page.setViewportSize({width:390,height:844});await page.waitForTimeout(100);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Product Design layout overflows on mobile');
  await page.setViewportSize({width:1440,height:1000});await page.goto('http://127.0.0.1:4173/photography/');await page.evaluate(()=>document.fonts.ready);
  const photoAlignment=await page.evaluate(()=>{
    const header=document.querySelector('.collection-header').getBoundingClientRect(),grid=document.querySelector('.collection-grid').getBoundingClientRect(),weather=document.querySelector('.weather-control').getBoundingClientRect();
    return {headerLeft:header.left,gridLeft:grid.left,weatherRight:weather.right,gridRight:grid.right};
  });
  assert.ok(Math.abs(photoAlignment.headerLeft-photoAlignment.gridLeft)<1,'Photography heading does not align with the card grid');
  assert.ok(Math.abs(photoAlignment.weatherRight-photoAlignment.gridRight)<1,'Photography mode selector does not align with the card grid');
  assert.equal(await page.locator('.photography-tiger-slot,.product-tiger-slot,.ux-mascot-slot').count(),0,'A title mascot remains on Photography');
  await page.getByRole('link',{name:'Product Design',exact:true}).click();
  await page.waitForURL('**/ux-design/');
  assert.equal(await page.locator('.rope-monkey').isVisible(),false,'The mode-selector monkey returned after tab navigation');
  for(const [width,height] of [[1440,1000],[768,1024],[390,844]]){
    await page.setViewportSize({width,height});
    for(const route of ['/ux-design/','/spatial-design/','/photography/','/ai-projects/']){
      await page.goto(`http://127.0.0.1:4173${route}`);await page.waitForTimeout(100);
      const state=await page.evaluate(()=>{
        const header=document.querySelector('.collection-header').getBoundingClientRect(),grid=document.querySelector('.collection-grid').getBoundingClientRect(),weather=document.querySelector('.weather-control').getBoundingClientRect();
        return {headerLeft:header.left,gridLeft:grid.left,weatherRight:weather.right,gridRight:grid.right,mascots:document.querySelectorAll('.product-tiger-slot,.photography-tiger-slot,.ux-mascot-slot').length,ropeVisible:[...document.querySelectorAll('.weather-rope,.rope-knot,.rope-monkey')].some(element=>getComputedStyle(element).display!=='none')};
      });
      assert.ok(Math.abs(state.headerLeft-state.gridLeft)<1,`${route} heading is misaligned at ${width}px`);
      assert.ok(Math.abs(state.weatherRight-state.gridRight)<1,`${route} mode selector is misaligned at ${width}px`);
      assert.equal(state.mascots,0,`${route} retains a title mascot at ${width}px`);
      assert.equal(state.ropeVisible,false,`${route} retains rope or monkey decoration at ${width}px`);
    }
  }
  assert.deepEqual(errors,[]);
  console.log('Passed mascot removal, clean inner-page mode selector, aligned headers and controls, card grid, weather clearance, and mobile layout.');
}finally{await browser.close();}
