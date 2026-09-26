import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';

const browser=await chromium.launch({headless:true,channel:'chrome'});
await mkdir('qa/deck-interactions',{recursive:true});
try{
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/');
  await page.waitForFunction(()=>document.querySelector('.home-grid')?.dataset.entering==='false');
  const grid=page.locator('.home-grid');
  assert.equal(await grid.locator(':scope > .home-card:not([hidden])').count(),6);
  assert.equal(await grid.locator(':scope > .home-card[hidden]').count(),3);
  assert.equal(await page.locator('[data-shuffle],.shuffle-fog').count(),0,'Shuffle UI or fog remains');
  assert.ok(Number(await grid.getAttribute('data-progress'))<.02,'Cards must begin stacked after refresh');
  assert.equal(await grid.locator(':scope > .home-card[inert]').count(),5,'Only the top stacked card should be interactive');
  const fan=await grid.evaluate(element=>{const center=element.getBoundingClientRect().left+element.getBoundingClientRect().width/2;return [...element.querySelectorAll(':scope > .home-card:not([hidden])')].map(card=>{const rect=card.getBoundingClientRect();return {offset:rect.left+rect.width/2-center,rotation:card.style.getPropertyValue('--stack-r')};});});
  assert.ok(Math.abs(fan[0].offset)<2&&fan[0].rotation==='0deg','The leading card is not straight and centred');
  assert.ok(fan[1].offset<0&&fan[2].offset>0&&fan[3].offset<fan[1].offset&&fan[4].offset>fan[2].offset,'The stacked cards do not fan out from both sides');
  await page.screenshot({path:'qa/deck-interactions/stack.png',fullPage:true});

  const bounds=await grid.boundingBox();
  await page.mouse.move(bounds.x+bounds.width/2,bounds.y+80);
  await page.waitForFunction(()=>Number(document.querySelector('.home-grid').dataset.progress)>.99);
  assert.ok(Number(await grid.getAttribute('data-progress'))>.99,'Hover must open the cards');
  assert.equal(await grid.locator(':scope > .home-card[inert]').count(),0);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));await page.waitForTimeout(100);
  assert.ok(Number(await grid.getAttribute('data-progress'))>.99,'Opened cards restacked after scrolling upward');
  await page.screenshot({path:'qa/deck-interactions/open-desktop.png',fullPage:true});

  const cardStructure=await grid.locator(':scope > .home-card:not([hidden])').evaluateAll(cards=>cards.map(card=>({
    title:card.querySelector('h2')?.textContent.trim(),
    section:card.querySelector('.home-card-meta span')?.textContent.trim(),
    arrow:card.querySelector('.home-card-meta span:last-child')?.textContent.trim(),
    oldMeta:Boolean(card.querySelector('.meta,.print-label'))
  })));
  assert.ok(cardStructure.every(card=>card.title&&card.section&&card.arrow==='↗'&&!card.oldMeta),'Home card labels are incomplete');
  const gap=await grid.evaluate(element=>({row:getComputedStyle(element).rowGap,column:getComputedStyle(element).columnGap}));
  assert.deepEqual(gap,{row:'24px',column:'24px'});

  const surfAll=page.getByRole('link',{name:'See all',exact:true});
  assert.equal(await surfAll.getAttribute('href'),'/ux-design/');
  assert.equal(await surfAll.locator('svg').count(),1,'See all is missing its leading wave icon');
  assert.equal(await page.getByRole('navigation').getByRole('link',{name:'UX Design',exact:true}).count(),1,'Landing-page navigation was not renamed to UX Design');
  assert.equal(await page.locator('.home-card-meta').filter({hasText:'Product Design'}).count(),0,'Product Design remains in landing-page cards');
  assert.equal(await page.locator('.site-footer .social-icon').count(),3,'Footer social icons are incomplete');
  assert.deepEqual(await page.locator('.site-footer .social-icon').evaluateAll(elements=>elements.map(element=>element.getAttribute('aria-label'))),['LinkedIn','Twitter','WhatsApp']);
  assert.deepEqual(await page.locator('.site-footer .social-icon').evaluateAll(elements=>elements.map(element=>element.getAttribute('href'))),['https://www.linkedin.com/in/vivekdesigns/','https://x.com/vivek_designs','https://wa.me/91639941802']);
  assert.equal(await page.locator('.location a[href^="tel:"]').count(),0,'Contact number remains in the bio');
  assert.equal(await page.locator('.location-part').last().locator('svg').getAttribute('fill'),'none','Mountain icon should use line art');
  assert.equal(await page.locator('.current-location').innerText(),'Now in Bengaluru');
  assert.equal(await page.locator('.contact-strip').count(),0,'Contact strip remains on the page');
  const ctaMargins=await page.locator('.about-deck-controls').evaluate(element=>({top:getComputedStyle(element).marginTop,bottom:getComputedStyle(element).marginBottom}));
  assert.equal(ctaMargins.top,ctaMargins.bottom,'See all margins are not balanced');

  assert.equal(await page.locator('.bio-role').textContent(),'Heading Creator Experience at Pocket FM 🌱 Stoked about wildlife, and here you are on a digital safari with me.');
  const signatureDuration=await page.locator('.personal-name').evaluate(element=>Math.max(...element.getAnimations({subtree:true}).map(animation=>animation.effect.getComputedTiming().endTime)));
  assert.ok(signatureDuration<=2550,`Signature is still too slow: ${signatureDuration}ms`);

  for(const [width,height,columns] of [[820,1000,2],[390,844,1]]){
    await page.setViewportSize({width,height});await page.waitForTimeout(150);
    assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`${width}px layout overflows`);
    const layout=await grid.evaluate(element=>({columns:getComputedStyle(element).gridTemplateColumns.split(' ').length,row:getComputedStyle(element).rowGap,column:getComputedStyle(element).columnGap}));
    assert.deepEqual(layout,{columns,row:'24px',column:'24px'});
  }
  await page.screenshot({path:'qa/deck-interactions/open-mobile.png',fullPage:true});
  await surfAll.click();
  await page.waitForURL('http://127.0.0.1:4173/ux-design/');
  assert.equal(await page.locator('nav a[href="/ux-design/"]').getAttribute('aria-current'),'page');
  assert.deepEqual(errors,[]);
  console.log('Passed: hover unstacking, persistent open state, six-card grid, See all navigation and wave icon, fixed gaps, updated bio and contact, balanced CTA spacing, signature speed, and responsive layouts.');
}finally{await browser.close();}
