import {expect} from '@playwright/test';
import assert from 'node:assert/strict';

export async function verifySculpture(browser,base){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  await page.goto(base);
  await expect(page.locator('.entry-intro')).toBeHidden({timeout:8500});
  const art=page.locator('.photo-art');
  const value=async()=>Number(await art.getAttribute('data-explosion'));
  await expect(art).toHaveAttribute('data-sculpture-state','ready');
  await expect(page.locator('.laptop-assembled')).toHaveJSProperty('naturalWidth',1254);
  await expect(page.locator('.assembly-layer')).toHaveCount(10);
  const initialTransform=await page.locator('[data-layer="chassis"]').getAttribute('transform');
  assert.equal(await page.locator('.laptop-photo-stage').evaluate(e=>getComputedStyle(e).backgroundColor),'rgba(0, 0, 0, 0)');
  const alpha=await page.evaluate(async()=>{
    const result=[];
    for(const src of ['assets/images/laptop/rog-assembled-cutout.png','assets/images/laptop/rog-assembly-cutout.png']){
      const image=new Image();image.src=src;await image.decode();
      const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;
      const context=canvas.getContext('2d');context.drawImage(image,0,0);
      result.push({corner:context.getImageData(0,0,1,1).data[3],center:context.getImageData(Math.floor(image.width/2),Math.floor(image.height/2),1,1).data[3]});
    }
    return result;
  });
  assert.ok(alpha.every(image=>image.corner===0 && image.center>200),'Both assets must have real alpha transparency and visible hardware');
  await expect(page.locator('.sculpture-canvas')).toHaveCount(0);
  await expect(page.getByRole('button',{name:'Explore display layer'})).toBeHidden();
  await page.screenshot({path:'test-results/screenshots/photo-assembled.png'});
  await page.getByRole('button',{name:'Separate layers'}).click();
  await expect.poll(value).toBeGreaterThan(.98);
  assert.notEqual(await page.locator('[data-layer="chassis"]').getAttribute('transform'),initialTransform,'Components must physically move, not just fade');
  await expect(page.getByRole('button',{name:'Explore display layer'})).toBeVisible();
  await page.screenshot({path:'test-results/screenshots/photo-exploded.png'});
  for(const [name,title] of [['Display','Display'],['Keyboard','Keyboard'],['Cooling','Cooling'],['Motherboard','Motherboard'],['Battery','Battery'],['Chassis','Chassis']]){
    await page.getByRole('button',{name,exact:true}).click();
    await expect(page.locator('.part-title')).toHaveText(title);
    await expect(page.getByRole('button',{name,exact:true})).toHaveAttribute('aria-pressed','true');
  }
  await page.getByRole('button',{name:'Explore motherboard layer'}).click();
  await expect(page.locator('.part-title')).toHaveText('Motherboard');
  await expect.poll(()=>page.locator('[data-layer="keyboard"]').evaluate(e=>Number(getComputedStyle(e).opacity))).toBeLessThan(.4);
  await page.screenshot({path:'test-results/screenshots/photo-layer-selected.png'});
  await page.getByRole('button',{name:'Join layers'}).click();
  await expect.poll(value).toBeLessThan(.02);
  await expect.poll(()=>page.locator('.laptop-assembled').evaluate(e=>Number(getComputedStyle(e).opacity))).toBeGreaterThan(.99);
  const slider=page.getByRole('slider',{name:'Laptop exploded view'});
  await slider.fill('50');await expect.poll(value).toBe(.5);
  await slider.focus();await page.keyboard.press('ArrowRight');await expect.poll(value).toBe(.51);
  await slider.fill('0');
  await page.waitForTimeout(1250); // Let the explicit-control scroll guard expire.
  await page.evaluate(()=>{const t=ScrollTrigger.getById('hero-story');scrollTo({top:t.start+(t.end-t.start)*.5,behavior:'instant'})});
  await expect.poll(value).toBeGreaterThan(.97);
  await page.evaluate(()=>{const t=ScrollTrigger.getById('hero-story');scrollTo({top:t.end,behavior:'instant'})});
  await expect.poll(value).toBeLessThan(.03);
  await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
  await page.setViewportSize({width:390,height:844});
  await page.getByRole('button',{name:'Motherboard',exact:true}).click();
  await expect.poll(value).toBeGreaterThan(.98);
  await page.locator('.laptop-photo-stage').scrollIntoViewIfNeeded();
  await page.screenshot({path:'test-results/screenshots/photo-mobile.png'});
  assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);
  await page.setViewportSize({width:320,height:740});
  assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true);
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.getByRole('button',{name:'Reset laptop view'}).click();
  await expect.poll(value).toBe(0);
  await page.getByRole('button',{name:'Separate layers'}).click();
  await expect.poll(value).toBe(1);
  assert.deepEqual(errors,[]);await page.close();
  const fallback=await browser.newPage({javaScriptEnabled:false});
  await fallback.goto(base);
  await expect(fallback.locator('.laptop-assembled')).toBeVisible();
  await expect(fallback.getByRole('link',{name:'View the exploded laptop photograph'})).toBeVisible();
  await expect(fallback.getByRole('button',{name:'Separate layers'})).toBeHidden();
  await fallback.close();
  console.log('PASS: transparent photo assets, moving assembly paths, scroll reassembly, join/separate, six selectable layers and hotspots, keyboard slider, 320px/mobile, reduced motion, no-JS access, and no runtime errors.');
}
