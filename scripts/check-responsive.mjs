import { chromium } from '/Users/viveksingh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const routes = ['/', '/ux-design/', '/spatial-design/', '/photography/', '/ai-projects/', '/ux-design/room-to-think/'];
const sizes = [[320,740],[390,844],[620,900],[768,1024],[844,390],[1024,768],[1100,900],[1101,900],[1440,1000],[2560,1440]];
const errors = [], results = [];
await mkdir('qa/responsive', { recursive: true });
try {
  const page = await browser.newPage();
  page.on('pageerror', error => errors.push(error.message));
  async function checkLayout(label) {
    const dimensions = await page.evaluate(() => ({ width: innerWidth, documentWidth: document.documentElement.scrollWidth }));
    assert.ok(dimensions.documentWidth <= dimensions.width + 1, `${label}: horizontal overflow`);
  }
  async function fits(locator, label) {
    const bounds = await locator.boundingBox();
    const viewport = page.viewportSize();
    assert.ok(bounds && bounds.x >= 0 && bounds.y >= 0 && bounds.x + bounds.width <= viewport.width + 1 && bounds.y + bounds.height <= viewport.height + 1, `${label}: outside viewport`);
    assert.ok(await locator.evaluate(element => element.scrollWidth <= element.clientWidth + 1), `${label}: internal overflow`);
  }
  for (const [width, height] of sizes) {
    await page.setViewportSize({ width, height });
    for (const route of routes) {
      const response = await page.goto('http://127.0.0.1:4173' + route);
      assert.equal(response.status(), 200);
      await page.waitForTimeout(150);
      await checkLayout(`${route} at ${width}`);
      // Compare actual text fragments with the main clipping edge, not only document overflow.
      const clipped = await page.locator('.intro-lines p').evaluateAll(elements => elements.some(element => {
        const range = document.createRange(); range.selectNodeContents(element);
        const main = element.closest('main').getBoundingClientRect();
        return [...range.getClientRects()].some(rect => rect.left < Math.max(main.left, 0) - 1 || rect.right > Math.min(main.right, innerWidth) + 1);
      }));
      assert.equal(clipped, false, `Bio clipped at ${width}`);
      if (route === '/photography/') {
        const spacing = await page.locator('main').evaluate(element => {
          const style = getComputedStyle(element);
          return [parseFloat(style.paddingRight), parseFloat(style.paddingBottom)];
        });
        assert.ok(Math.abs(spacing[0] - spacing[1]) < 1, `Bottom/right gutters differ at ${width}`);
      }
      if ([390,768,1440].includes(width) && ['/', '/photography/'].includes(route)) {
        await page.waitForTimeout(800);
        await page.screenshot({ path: `qa/responsive/final-${width}-${route.replaceAll('/', '') || 'home'}.png`, fullPage: true });
      }
      results.push({ width, height, route });
    }
  }
  for (const [width, height] of [[320,740],[390,844],[768,1024],[844,390],[1024,768],[1440,1000]]) {
    await page.setViewportSize({ width, height });
    await page.goto('http://127.0.0.1:4173/photography/');
    if (width <= 1100) {
      await page.getByRole('button', { name: 'Menu', exact: false }).click();
      await page.getByRole('navigation').getByRole('link', { name: 'UX Design', exact: true }).click();
      await page.waitForURL('**/ux-design/');
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
      await page.locator('.menu-toggle').click();
      await page.getByRole('navigation').getByRole('link', { name: 'Photography', exact: true }).click();
      await page.waitForURL('**/photography/');
      await page.locator('.menu-toggle').click();
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    }
    const cards = page.locator('.photo-card');
    await cards.first().click();
    const dialog = page.locator('.photo-modal');
    await fits(dialog, `Photo modal ${width}`);
    assert.equal(await dialog.locator('img').getAttribute('src'), await cards.first().getAttribute('data-photo-src'));
    await page.keyboard.press('ArrowRight');
    assert.equal(await dialog.locator('img').getAttribute('src'), await cards.nth(1).getAttribute('data-photo-src'));
    await page.keyboard.press('ArrowLeft');
    assert.equal(await dialog.locator('img').getAttribute('src'), await cards.first().getAttribute('data-photo-src'));
    await page.keyboard.press('Escape');
    assert.equal(await dialog.isVisible(), false);
    await cards.first().click(); await dialog.locator('.photo-modal-close').click();
    await cards.first().click(); await page.mouse.click(2, height / 2);
    assert.equal(await dialog.isVisible(), false, 'Backdrop should close viewer');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    for (const mode of ['day', 'night', 'rain']) {
      await page.locator(`[data-weather="${mode}"]`).click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), mode);
      await page.locator('.rope-monkey').focus(); await page.waitForTimeout(500);
      await fits(page.locator('#monkey-tooltip'), `Monkey tooltip ${width} ${mode}`);
      await page.keyboard.press('Escape'); await page.locator('.rope-monkey').blur();
    }
    await page.locator('.tiger-info').focus(); await page.waitForTimeout(500);
    await fits(page.locator('#tiger-tooltip'), `Tiger tooltip ${width}`);
    await page.keyboard.press('Escape');
  }
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const width of [320,390,768,1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto('http://127.0.0.1:4173' + route);
      await page.evaluate(() => document.documentElement.style.fontSize = '200%');
      await page.waitForTimeout(200);
      await checkLayout(`Enlarged text ${route} at ${width}`);
    }
  }
  // A real touch context verifies tapping cards and navigation without hover.
  const touch = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const mobile = await touch.newPage();
  await mobile.goto('http://127.0.0.1:4173/');
  await mobile.locator('.menu-toggle').tap();
  await mobile.getByRole('navigation').getByRole('link', { name: 'Photography', exact: true }).tap();
  await mobile.waitForURL('**/photography/');
  await mobile.locator('.photo-card').first().tap();
  assert.ok(await mobile.locator('.photo-modal').isVisible());
  await mobile.locator('.photo-modal-close').tap();
  assert.equal(await mobile.locator('.photo-modal').isVisible(), false);
  await touch.close();
  assert.deepEqual(errors, []);
  await writeFile('qa/responsive/results.json', JSON.stringify({ layouts: results, errors, interactions: 'passed', enlargedText: 'passed', touch: 'passed' }, null, 2));
  console.log(`Passed ${results.length} layouts (320–2560px), matching gutters, unclipped bio, menus, modal controls, three themes, tooltips, 200% text, and touch navigation.`);
} finally { await browser.close(); }
