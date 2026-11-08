import assert from 'node:assert/strict';
import {expect} from '@playwright/test';

export async function verifyResponsive(browser, base) {
  const page = await browser.newPage();
  await page.addInitScript(() => sessionStorage.setItem('eli:intro-seen', '1'));
  const routes = ['index', 'projects', 'services', 'about', 'contact', 'project-ats', 'project-ecitizen'];
  for (const [width, height] of [[320,740], [390,844], [768,1024], [1024,768], [1440,900], [1440,1000]]) {
    await page.setViewportSize({width, height});
    for (const route of routes) {
      await page.goto(`${base}${route}.html`);
      await page.evaluate(() => document.fonts.ready);
      const issues = await page.evaluate(() => {
        const problems = [];
        if (document.body.scrollWidth > innerWidth) problems.push('horizontal overflow');
        document.querySelectorAll('.service-panel:not([hidden]) .service-stage').forEach(stage => {
          const art = stage.querySelector('.service-art').getBoundingClientRect();
          const controls = stage.querySelector('.demo-controls').getBoundingClientRect();
          if (art.bottom > controls.top) problems.push('demo controls overlap illustration');
          if (controls.bottom > stage.getBoundingClientRect().bottom) problems.push('demo feedback clipped');
        });
        if (innerHeight < 900 || innerWidth < 1101) {
          if (document.querySelector('.pin-spacer')) problems.push('pinning in constrained viewport');
        }
        return problems;
      });
      assert.deepEqual(issues, [], `${route} at ${width}×${height}`);
    }
  }
  await page.setViewportSize({width:390, height:844});
  await page.goto(`${base}index.html`);
  const menu = page.locator('.menu');
  await menu.click();
  await expect(menu).toHaveAttribute('aria-label', 'Close navigation');
  await page.locator('.hero-intro p').click();
  await expect(menu).toHaveAttribute('aria-expanded', 'false');
  await menu.click();
  await page.keyboard.press('Escape');
  await expect(menu).toBeFocused();
  await expect(menu).toHaveAttribute('aria-label', 'Open navigation');
  await page.close();
  console.log('PASS: 42 responsive route/viewport combinations, demo control separation, short-screen fallback, and mobile menu dismissal/labels.');
}
