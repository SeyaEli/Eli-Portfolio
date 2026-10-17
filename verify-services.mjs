import assert from 'node:assert/strict';
import {expect} from '@playwright/test';

export async function verifyServices(browser,base){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));
  for(const route of ['','services.html']){
    await page.goto(base+route);
    await expect(page.locator('.entry-intro')).toBeHidden({timeout:8500});
    const explorer=page.locator('.service-explorer');
    await expect(explorer).toHaveClass(/is-enhanced/);
    await expect(explorer.getByRole('tab')).toHaveCount(4);
    await expect(explorer.getByRole('tabpanel')).toHaveCount(1);
    assert.equal(await explorer.locator('details').count(),0);
    const browserFrame=explorer.locator('.demo-browser');const width=(await browserFrame.boundingBox()).width;
    await explorer.getByRole('button',{name:'Try mobile view'}).click();
    await expect(explorer.getByRole('button',{name:'Try desktop view'})).toHaveAttribute('aria-pressed','true');
    await expect.poll(async()=>(await browserFrame.boundingBox()).width).toBeLessThan(width-50);
    await explorer.getByRole('button',{name:'Try desktop view'}).click();
    await explorer.getByRole('tab',{name:'Information systems'}).click();
    for(const name of ['Route a request','Assign for review','Resolve request'])await explorer.getByRole('button',{name,exact:true}).click();
    await expect(explorer.locator('#service-systems .demo-status')).toHaveText('Resolved, with a clear record.');
    await explorer.getByRole('button',{name:'Start another request'}).click();
    await expect(explorer.locator('#service-systems .is-active')).toHaveCount(0);
    await explorer.getByRole('tab',{name:'APIs & integrations'}).click();
    await explorer.getByRole('button',{name:'Send sample request'}).click();
    await expect(explorer.getByRole('button',{name:'Sending…'})).toHaveAttribute('aria-disabled','true');
    // Switching services mid-request cancels its pending transition.
    await explorer.getByRole('tab',{name:'Deployment & support'}).click();
    for(const name of ['Start a release','Build release','Deploy release'])await explorer.getByRole('button',{name,exact:true}).click();
    await expect(explorer.locator('.release-art')).toHaveAttribute('data-release','3');
    await expect(explorer.locator('.release-steps .is-complete')).toHaveCount(3);
    await explorer.getByRole('button',{name:'Reset illustration'}).click();
    await explorer.getByRole('tab',{name:'APIs & integrations'}).click();
    await expect(explorer.locator('.demo-response code')).toHaveText('Ready to connect');
    await explorer.getByRole('button',{name:'Send sample request'}).click();
    await expect(explorer.locator('.demo-response code')).toHaveText('200 OK · Sample response');
    await expect(explorer.getByRole('button',{name:'Send again'})).not.toHaveAttribute('aria-disabled','true');
    assert.equal(await explorer.locator('#service-api .service-related').getAttribute('href'),'project-realestate.html');
    await explorer.getByRole('tab',{name:'APIs & integrations'}).focus();await page.keyboard.press('Home');
    await expect(explorer.getByRole('tab',{name:'Web applications'})).toBeFocused();
    await page.keyboard.press('ArrowDown');await expect(explorer.getByRole('tab',{name:'Information systems'})).toHaveAttribute('aria-selected','true');
    await page.keyboard.press('Tab');await expect(explorer.getByRole('tabpanel')).toBeFocused();
    await page.emulateMedia({reducedMotion:'reduce'});
    await explorer.getByRole('tab',{name:'APIs & integrations'}).click();
    await explorer.getByRole('button',{name:/Send (sample request|again)/}).click();
    await expect(explorer.locator('.demo-response code')).toHaveText('200 OK · Sample response');
    assert.equal(await explorer.evaluate(e=>e.getAnimations({subtree:true}).filter(a=>a.playState==='running').length),0);
    for(const size of [{width:390,height:844},{width:320,height:740}]){
      await page.setViewportSize(size);
      for(const tab of await explorer.getByRole('tab').all()){
        await tab.click();
        assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true,`Services overflow at ${size.width}px`);
        const stage=await explorer.getByRole('tabpanel').locator('.service-stage').boundingBox();
        const controls=await explorer.getByRole('tabpanel').locator('.demo-controls').boundingBox();
        assert.ok(controls.y+controls.height<=stage.y+stage.height,'Demo controls must stay inside the scene');
      }
    }
    await page.setViewportSize({width:1440,height:1000});await page.emulateMedia({reducedMotion:'no-preference'});
  }
  assert.deepEqual(errors,[]);await page.close();
  const fallback=await browser.newPage({javaScriptEnabled:false});await fallback.goto(base+'services.html');
  await expect(fallback.locator('.service-panel:visible')).toHaveCount(4);
  await expect(fallback.locator('.demo-action:visible')).toHaveCount(0);await fallback.close();
  console.log('PASS: services tabs, keyboard/focus, responsive app demo, request routing, API round trip/cancellation, deployment steps, project links, reduced motion, 320px/mobile layout, and no-JS content.');
}
