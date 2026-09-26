import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser=await chromium.launch({headless:true,channel:'chrome'});
await mkdir('qa/photography-cards',{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/photography/');
  await page.evaluate(()=>document.fonts.ready);
  await page.locator('.photo-card img').first().waitFor({state:'visible'});
  const cards=page.locator('.photo-card');
  assert.ok(await cards.count()>=4);
  const details=await cards.evaluateAll(nodes=>nodes.map(card=>{
    const print=card.querySelector('.print'),copy=card.querySelector('.card-copy'),title=card.querySelector('h2'),location=card.querySelector('.photo-location'),meta=card.querySelector('.meta');
    const tr=title.getBoundingClientRect(),lr=location.getBoundingClientRect(),mr=meta.getBoundingClientRect(),titleLineHeight=parseFloat(getComputedStyle(title).lineHeight);
    return {inside:print.contains(copy)&&print.contains(title)&&print.contains(location)&&print.contains(meta),titleHeight:tr.height,titleLineHeight,ordered:tr.bottom<=lr.top&&lr.bottom<=mr.top,descriptionInCard:Boolean(card.querySelector('.card-copy p')),modalDescription:Boolean(card.dataset.photoDescription),modalTitle:Boolean(card.dataset.photoTitle),usesCardTitle:title.textContent.trim()===card.dataset.photoCardTitle,endsWithPeriod:title.textContent.trim().endsWith('.'),containsLocation:title.textContent.includes(location.textContent.trim())};
  }));
  assert.ok(details.every(item=>item.inside),'Photography details are outside the card surface');
  assert.ok(details.every(item=>item.titleHeight<=item.titleLineHeight+.5),'Title exceeds one line');
  assert.ok(details.every(item=>item.ordered),'Title, location, and camera/date rows are out of order');
  assert.ok(details.every(item=>!item.descriptionInCard&&item.modalDescription&&item.modalTitle),'Photo modal data is incomplete');
  assert.ok(details.every(item=>item.usesCardTitle&&!item.endsWithPeriod&&!item.containsLocation),'Card title copy does not meet the one-line title rules');
  assert.equal(await cards.locator('.photo-location svg').count(),0,'Location icon is still present on a photography card');
  const titleMarkAlignment=await page.locator('.collection-header h1').evaluate(heading=>{
    const mark=heading.querySelector('.name-dot'),style=getComputedStyle(heading),context=document.createElement('canvas').getContext('2d');
    context.font=`${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    const metrics=context.measureText(heading.firstChild.textContent),rect=heading.getBoundingClientRect(),lineHeight=parseFloat(style.lineHeight);
    const ascent=metrics.fontBoundingBoxAscent??parseFloat(style.fontSize)*.8,descent=metrics.fontBoundingBoxDescent??parseFloat(style.fontSize)*.2;
    const baseline=rect.top+(lineHeight-ascent-descent)/2+ascent;
    return Math.abs(mark.getBoundingClientRect().bottom-baseline);
  });
  assert.ok(titleMarkAlignment<2,`Title mark is ${titleMarkAlignment}px away from the letter baseline`);
  await page.screenshot({path:'qa/photography-cards/desktop.png',fullPage:true});

  for(const [width,height] of [[2560,1440],[1440,1000],[1101,900],[1100,900],[768,1024],[620,900],[390,844],[320,740]]){
    await page.setViewportSize({width,height});
    const gap=await page.locator('.photography-grid').evaluate(grid=>({row:getComputedStyle(grid).rowGap,column:getComputedStyle(grid).columnGap}));
    assert.equal(gap.row,gap.column,`Photography row and column gaps differ at ${width}px`);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`Photography layout overflows at ${width}px`);
  }
  await page.setViewportSize({width:1440,height:1000});

  const nav=page.getByRole('navigation');
  const weights=await nav.locator('a').evaluateAll(links=>links.map(link=>getComputedStyle(link).fontWeight));
  assert.equal(new Set(weights).size,1,'Active tab changes font weight');
  const indicator=nav.locator('.nav-indicator');
  const shape=await indicator.evaluate(element=>({width:element.offsetWidth,height:element.offsetHeight,radius:getComputedStyle(element).borderRadius}));
  assert.deepEqual({width:shape.width,height:shape.height,radius:shape.radius},{width:6,height:6,radius:'1px'});
  const before=await indicator.evaluate(element=>getComputedStyle(element).transform);
  await nav.getByRole('link',{name:'Spatial Design',exact:true}).click();
  await page.waitForTimeout(100);
  const during=await indicator.evaluate(element=>getComputedStyle(element).transform);
  assert.ok(await indicator.evaluate(element=>element.getAnimations().length)>0,'Square indicator has no physics animation');
  await page.waitForURL('**/spatial-design/');await page.waitForTimeout(500);
  const after=await indicator.evaluate(element=>getComputedStyle(element).transform);
  assert.notEqual(before,after,'Square indicator did not move to the next tab');
  assert.notEqual(before,during,'Square indicator did not begin moving');

  await page.setViewportSize({width:390,height:844});
  await page.goto('http://127.0.0.1:4173/photography/');await page.waitForTimeout(150);
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,'Photography layout overflows on mobile');
  await page.screenshot({path:'qa/photography-cards/mobile.png',fullPage:true});
  assert.deepEqual(errors,[]);
  console.log('Passed photography card containment, one-line titles, location and metadata order, modal descriptions, stable tab weight, moving square, and mobile layout.');
}finally{await browser.close();}
