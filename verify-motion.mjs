import assert from 'node:assert/strict';
import {expect} from '@playwright/test';

export async function verifyMotion(browser, base) {
  const page = await browser.newPage({viewport:{width:1440,height:1000}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.goto(base);
    await expect(page.locator('.entry-intro')).toBeHidden({timeout:8500});
  await page.waitForFunction(() => document.documentElement.dataset.motionReady === 'true');
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(() => window.ScrollTrigger.refresh());
  const bounds = await page.evaluate(() => Object.fromEntries(['hero-story','project-gallery'].map(id=>{
    const t=window.ScrollTrigger.getById(id); return [id,{start:t.start,end:t.end}];
  })));
  const seek = async top => {await page.evaluate(y=>window.scrollTo({top:y,behavior:'instant'}),top);await page.waitForTimeout(1100)};
  await page.screenshot({path:'test-results/screenshots/motion-home.png'});
  // Actual wheel input must drive the sequence, without a button or hover.
  const before=Number(await page.locator('.photo-art').getAttribute('data-explosion'));
  await page.mouse.wheel(0,800);
  await page.waitForTimeout(1100);
  assert.ok(Number(await page.locator('.photo-art').getAttribute('data-explosion'))>before+.5,'Wheel input must reveal the actual exploded photograph');
  await seek(bounds['hero-story'].start + (bounds['hero-story'].end-bounds['hero-story'].start)*.9);
  assert.ok(Number(await page.locator('.hero-story').evaluate(e=>getComputedStyle(e).opacity))>.9);
  assert.ok(Math.abs((await page.locator('.hero').boundingBox()).y)<3,'Hero should remain pinned');
  await page.screenshot({path:'test-results/screenshots/motion-hero.png'});
  const gallery=bounds['project-gallery'];
  const checkGalleryLayout = async () => {
    const result=await page.locator('.work-panel').evaluateAll(panels=>{
      const items=panels.map(panel=>{
        const outer=panel.getBoundingClientRect();
        const visual=panel.querySelector('.work-visual').getBoundingClientRect();
        const info=panel.querySelector('.work-info').getBoundingClientRect();
        const frame=panel.querySelector('.work-frame').getBoundingClientRect();
        const caption=panel.querySelector('.visual-caption').getBoundingClientRect();
        const image=panel.querySelector('img');const style=getComputedStyle(image);
        return {left:outer.left,right:outer.right,ownGap:visual.left-info.right,
          frameContained:frame.left>=visual.left+10&&frame.right<=visual.right-10&&frame.top>=visual.top+10&&frame.bottom<=caption.top-10,
          ratio:parseFloat(style.width)/parseFloat(style.height),naturalRatio:image.naturalWidth/image.naturalHeight};
      });
      return {items,separation:items[1].left-items[0].right};
    });
    assert.ok(result.separation>result.items[0].ownGap*2,'Adjacent projects must have more separation than each text/image pair');
    for(const item of result.items){
      assert.ok(item.frameContained,'Preview must fit inside its surface and clear its caption');
      assert.ok(Math.abs(item.ratio-item.naturalRatio)<.02,'Screenshot must retain its natural aspect ratio');
    }
  };
  for (const index of [0,1,2,3,2,1,0]) {
    await seek(gallery.start+(gallery.end-gallery.start)*index/3);
    await expect(page.locator('.gallery-current')).toHaveText(String(index+1).padStart(2,'0'));
    const panel=await page.locator('.work-panel').nth(index).boundingBox();
    assert.ok(panel.x>=0&&panel.x<100,'Selected project should be in viewport');
    assert.ok(Math.abs((await page.locator('.work-gallery').boundingBox()).y)<3,'Gallery should remain pinned');
    await checkGalleryLayout();
    if(index===1) await page.screenshot({path:'test-results/screenshots/motion-gallery.png'});
  }
  await page.getByRole('button',{name:'Show RealEstate Chain'}).click();
  await expect(page.locator('.gallery-current')).toHaveText('03',{timeout:8000});
  await page.locator('.work-link').nth(3).focus();
  await expect(page.locator('.gallery-current')).toHaveText('04');
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/project-lms\.html$/);
  await page.goBack();
  await page.waitForFunction(()=>document.documentElement.dataset.motionReady==='true');
  await page.getByRole('link',{name:'Continue to about'}).click();
  await expect(page.locator('#after-work')).toBeInViewport();
  await seek(0);
  assert.ok(Number(await page.locator('.hero-copy').evaluate(e=>getComputedStyle(e).opacity))>.99);
  await page.getByRole('link',{name:'Skip to selected work'}).click();
  await expect(page.locator('.gallery-current')).toHaveText('01');
  // Resizing in the middle of a pin must release its added space and transforms.
  await page.setViewportSize({width:390,height:844});
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await seek(0);
  assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);
  await page.screenshot({path:'test-results/screenshots/motion-mobile.png'});
  await page.locator('.work-visual').first().scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.screenshot({path:'test-results/screenshots/motion-mobile-project.png'});
  await page.setViewportSize({width:1440,height:1000});
  await page.emulateMedia({reducedMotion:'reduce'});
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  await expect.poll(()=>page.evaluate(()=>window.ScrollTrigger.getAll().length)).toBe(0);
  await seek(0);
  for(const link of await page.locator('.work-link').all()) await expect(link).toBeVisible();
  assert.ok(['none','matrix(1, 0, 0, 1, 0, 0)'].includes(await page.locator('.gallery-track').evaluate(e=>getComputedStyle(e).transform)));
  await page.screenshot({path:'test-results/screenshots/motion-reduced.png',fullPage:true});
  await page.emulateMedia({reducedMotion:'no-preference'});
  await expect(page.locator('.pin-spacer')).toHaveCount(2);
  await page.setViewportSize({width:1024,height:768});
  await page.waitForTimeout(400);
  await page.evaluate(()=>window.ScrollTrigger.refresh());
  await seek(await page.evaluate(()=>{const s=window.ScrollTrigger.getById('project-gallery');return s.start+(s.end-s.start)/3}));
  const info=await page.locator('.work-info').nth(1).boundingBox();
  const controls=await page.locator('.gallery-controls').boundingBox();
  assert.ok(info.y+info.height<=controls.y,'Laptop project text must fit above controls');
  await page.screenshot({path:'test-results/screenshots/motion-laptop.png'});
  await checkGalleryLayout();
  await page.setViewportSize({width:1876,height:950});
  await page.waitForTimeout(400);
  await page.evaluate(()=>window.ScrollTrigger.refresh());
  await seek(await page.evaluate(()=>window.ScrollTrigger.getById('project-gallery').start));
  await checkGalleryLayout();
  await page.screenshot({path:'test-results/screenshots/gallery-polished-first.png'});
  await seek(await page.evaluate(()=>{const s=window.ScrollTrigger.getById('project-gallery');return s.start+(s.end-s.start)/6}));
  await checkGalleryLayout();
  await page.screenshot({path:'test-results/screenshots/gallery-polished-between.png'});
  await page.setViewportSize({width:1280,height:600});
  await expect(page.locator('.pin-spacer')).toHaveCount(0);
  assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);
  assert.deepEqual(errors,[]);
  await page.close();
  const noJs=await browser.newPage({javaScriptEnabled:false,viewport:{width:1440,height:1000}});
  await noJs.goto(base);
  for(const link of await noJs.locator('.work-link').all()) await expect(link).toBeVisible();
  await noJs.close();
  console.log('PASS: wheel-driven hero, forward/reverse pinned gallery, direct project navigation, keyboard case-study access, skip links, mid-pin resize, mobile, short viewport, live reduced-motion changes, and no-JS fallback.');
}
