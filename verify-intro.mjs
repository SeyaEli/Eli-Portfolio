import {expect} from '@playwright/test';

export async function verifyIntro(browser, base) {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(base);
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('button',{name:'Skip intro'})).toBeFocused();
  await expect(page.locator('main')).toHaveAttribute('inert','');
  await page.waitForTimeout(3000);
  await page.screenshot({path:'test-results/screenshots/intro-desktop.png'});
  await expect(page.locator('.entry-intro')).toHaveClass(/is-leaving/,{timeout:4500});
  // The page must start revealing while the intro still exists; no hard cut.
  await expect.poll(() => page.locator('.hero-layout').evaluate(element => Number(getComputedStyle(element).opacity))).toBeGreaterThan(0);
  await expect(page.locator('.entry-intro')).toBeVisible();
  await page.screenshot({path:'test-results/screenshots/intro-home-transition.png'});
  await expect(page.locator('.entry-intro')).toBeHidden({timeout:8500});
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
  await expect(page.locator('.hero-copy .button')).toBeFocused();
  await page.reload();
  await expect(page.locator('.entry-intro')).toBeHidden();
  await page.getByRole('button',{name:'Replay intro'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(page.getByRole('button',{name:'Skip intro'})).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(page.locator('.entry-intro')).toBeHidden();
  await expect(page.getByRole('button',{name:'Replay intro'})).toBeFocused();
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Replay intro'}).click();
  await page.waitForTimeout(3000);
  await page.screenshot({path:'test-results/screenshots/intro-mobile.png'});
  await expect.poll(() => page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth)).toBe(true);
  await page.getByRole('button',{name:'Skip intro'}).click();
  await expect(page.locator('.entry-intro')).toBeHidden();
  await page.getByRole('button',{name:'Replay intro'}).click();
  await expect(page.locator('.entry-intro')).toHaveClass(/is-leaving/,{timeout:6500});
  await page.getByRole('button',{name:'Skip intro'}).click();
  await expect(page.locator('.entry-intro')).toBeHidden();
  await page.getByRole('button',{name:'Replay intro'}).click();
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('main')).not.toHaveAttribute('inert','');
  await expect(page.getByRole('button',{name:'Replay intro'})).toBeHidden();
  expect(errors).toEqual([]);
  await page.close();

  for (const options of [{reducedMotion:'reduce'}, {javaScriptEnabled:false}]) {
    const fallback = await browser.newPage(options);
    await fallback.goto(base);
    await expect(fallback.locator('.entry-intro')).toBeHidden();
    await expect(fallback.locator('main')).not.toHaveAttribute('inert','');
    await expect(fallback.locator('h1')).toBeVisible();
    await fallback.close();
  }
  const deep = await browser.newPage();
  await deep.goto(base+'#selected');
  await expect(deep.locator('.entry-intro')).toBeHidden();
  await deep.close();

  const failed = await browser.newPage();
  await failed.route('**/js/intro.js',route=>route.abort());
  await failed.goto(base);
  await expect(failed.locator('.entry-intro')).toBeHidden({timeout:6500});
  await expect(failed.locator('main')).not.toHaveAttribute('inert','');
  await failed.close();
  console.log('PASS: intro entry/reveal, replay, skip, Escape, focus trap/restore, mobile, session persistence, reduced motion, deep links, no JS, and script failure recovery.');
}
