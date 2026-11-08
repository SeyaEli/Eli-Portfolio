import {expect} from '@playwright/test';
import assert from 'node:assert/strict';

export async function verifyAboutFixes(browser, base) {
  const page = await browser.newPage();
  try {
    for (const [width,height] of [[1876,950],[1440,1000],[1024,768],[390,844]]) {
      await page.setViewportSize({width,height});
      await page.goto(`${base}about.html`);
      await page.evaluate(() => document.fonts.ready);
      for (const index of [0,1,2,0]) {
        const link = page.locator('.skill-navigation a').nth(index);
        await link.click();
        await page.waitForTimeout(850);
        await expect(link).toHaveAttribute('aria-current','true');
        await expect(page.locator('.skill-row.is-skill-active')).toHaveAttribute('id',`skill-group-${index}`);
        await expect(page.locator('.skill-navigation a[aria-current=true]')).toHaveCount(1);
        if(index===0&&width===1876)await page.screenshot({path:'test-results/screenshots/tools-frontend-selected.png'});
      }
      await page.goto(`${base}about.html#skill-group-1`);
      await expect(page.locator('.skill-navigation a').nth(1)).toHaveAttribute('aria-current','true');
      await page.goto(`${base}about.html`);
      for (const progress of [0,.5,1]) {
        await page.evaluate(progress => {
          const trigger = window.ScrollTrigger.getById('about-journey');
          const caption=document.querySelector('.journey-portrait figcaption');
          const captionTop=scrollY+caption.getBoundingClientRect().top-innerHeight*.7;
          scrollTo({top:trigger ? trigger.start+(trigger.end-trigger.start)*progress : captionTop,behavior:'instant'});
        },progress);
        await page.waitForTimeout(1000);
        const clear = await page.locator('.journey-portrait figcaption').evaluate(caption => {
          const rect=caption.getBoundingClientRect();
          const hit=document.elementFromPoint(rect.left+8,rect.top+rect.height/2);
          return hit===caption || caption.contains(hit);
        });
        assert.ok(clear,`Portrait caption must stay uncovered at ${width}×${height}, progress ${progress}`);
        if(progress===0)await page.screenshot({path:`test-results/screenshots/about-caption-${width}.png`});
      }
    }
    await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto(`${base}about.html#skill-group-0`);
    await expect(page.locator('.skill-navigation a').nth(0)).toHaveAttribute('aria-current','true');
    await page.locator('.skill-navigation a').nth(2).click();
    await expect(page.locator('#skill-group-2')).toHaveClass(/is-skill-active/);
    await page.mouse.wheel(0,-400);
    await page.waitForTimeout(300);
    const expected=await page.locator('.skill-row').evaluateAll(rows=>{
      const visible=rows.filter(row=>{const r=row.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;});
      return visible.reduce((closest,row)=>Math.abs(row.getBoundingClientRect().top-innerHeight*.25)<Math.abs(closest.getBoundingClientRect().top-innerHeight*.25)?row:closest).id;
    });
    await expect(page.locator('.skill-row.is-skill-active')).toHaveAttribute('id',expected);
    await expect(page.locator('.skill-navigation a[aria-current=true]')).toHaveCount(1);
    console.log('PASS: Tools selections, direct hashes, portrait caption clearance through animation, mobile/tablet/desktop, and reduced motion.');
  } finally {
    await page.close();
  }
}
