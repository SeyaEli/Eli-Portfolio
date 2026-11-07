import {expect} from '@playwright/test';
import assert from 'node:assert/strict';

export async function verifyPageExperiences(browser,base){
  const page=await browser.newPage({viewport:{width:1440,height:1000}});
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const seek=async(id,progress)=>{
    await page.evaluate(({id,progress})=>{const trigger=ScrollTrigger.getById(id);scrollTo({top:trigger.start+(trigger.end-trigger.start)*progress,behavior:'instant'})},{id,progress});
    await page.waitForTimeout(900);
  };
  await page.goto(base+'projects.html');
  await expect(page.locator('.projects-cinema')).toHaveClass(/is-project-pinned/);
  await seek('projects-cinema',0);
  await page.getByRole('button',{name:'Next project',exact:true}).click();
  await expect(page.locator('.project-current')).toHaveText('02');
  await expect(page.locator('.project[aria-hidden=false] h3')).toHaveText('eCitizen');
  for(const [progress,index] of [[1,'08'],[.43,'04'],[0,'01']]){
    await seek('projects-cinema',progress);
    await expect(page.locator('.project-current')).toHaveText(index);
    await expect(page.locator('.project[aria-hidden=false]')).toHaveCount(1);
  }
  await page.getByRole('button',{name:'Web3',exact:true}).click();
  await expect(page.locator('.project-total')).toHaveText('02');
  await expect(page.locator('.project:not([hidden])')).toHaveCount(2);
  await page.getByRole('button',{name:'Next project',exact:true}).click();
  await expect(page.locator('.project-current')).toHaveText('02');
  await page.waitForTimeout(750);
  await page.screenshot({path:'test-results/screenshots/projects-cinema.png'});
  const activeHref=await page.locator('.project[aria-hidden=false]').getAttribute('href');
  await page.locator('.project[aria-hidden=false]').focus();await page.keyboard.press('Enter');
  await expect(page).toHaveURL(new RegExp(activeHref.replace('.','\\.')+'$'));

  await page.goto(base+'services.html');
  await expect(page.locator('.services-section')).toHaveClass(/is-service-pinned/);
  for(const [progress,id] of [[.1,'web'],[.38,'systems'],[.63,'api'],[.9,'deployment'],[.1,'web']]){
    await seek('services-journey',progress);
    await expect(page.locator(`[data-service="${id}"]`)).toHaveAttribute('aria-selected','true');
  }
  await page.getByRole('tab',{name:'APIs & integrations'}).click();
  await expect(page.locator('.service-scroll-current')).toHaveText('03');
  await page.getByRole('button',{name:'Send sample request'}).click();
  await expect(page.locator('#service-api .demo-status')).toHaveText('Round trip complete. No data was sent.',{timeout:5000});
  await page.screenshot({path:'test-results/screenshots/services-journey.png'});
  await page.getByRole('link',{name:'Continue ↓',exact:true}).click();
  await expect(page.locator('#service-exit')).toBeInViewport();

  await page.goto(base+'about.html');
  await expect(page.locator('.about-journey')).toHaveClass(/is-about-pinned/);
  for(const [progress,text] of [[0,'A builder,always learning.'],[.5,'I connectthe pieces.'],[1,'Still curious.Still building.'],[0,'A builder,always learning.']]){
    await seek('about-journey',progress);
    await expect(page.locator('.about-chapter[aria-hidden=false] h2')).toHaveText(text);
    await expect(page.locator('.about-chapter[aria-hidden=false]')).toHaveCount(1);
  }
  await page.getByRole('link',{name:'Keep learning',exact:true}).click();
  await expect(page.locator('.about-chapter-count')).toHaveText('03 / 03');
  await page.waitForTimeout(850);await page.screenshot({path:'test-results/screenshots/about-journey.png'});
  await page.getByRole('link',{name:'Continue to experience'}).click();
  await expect(page.locator('#about-experience')).toBeInViewport();
  await page.locator('.skill-navigation a').nth(1).click();
  await expect(page.locator('#skill-group-1')).toBeInViewport();

  // Every pin must release on live motion-preference changes and mid-page resize.
  for(const route of ['projects','services','about']){
    await page.goto(base+route+'.html');
    await page.emulateMedia({reducedMotion:'reduce'});
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    if(route==='projects')await expect(page.locator('.project:visible')).toHaveCount(8);
    if(route==='about')await expect(page.locator('.about-chapter:visible')).toHaveCount(3);
    await page.emulateMedia({reducedMotion:'no-preference'});
    await page.setViewportSize({width:390,height:844});
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true,route+' mobile overflow');
    await page.screenshot({path:`test-results/screenshots/${route}-mobile-experience.png`,fullPage:true});
    await page.setViewportSize({width:320,height:740});
    assert.equal(await page.locator('body').evaluate(e=>e.scrollWidth<=innerWidth),true,route+' narrow overflow');
    await page.setViewportSize({width:1440,height:1000});
  }
  assert.deepEqual(errors,[]);await page.close();
  const fallback=await browser.newPage({javaScriptEnabled:false});
  for(const route of ['projects','services','about']){
    await fallback.goto(base+route+'.html');
    await expect(fallback.locator('.pin-spacer')).toHaveCount(0);
    if(route==='projects')await expect(fallback.locator('.project:visible')).toHaveCount(8);
    if(route==='services')await expect(fallback.locator('.service-panel:visible')).toHaveCount(4);
    if(route==='about')await expect(fallback.locator('.about-chapter:visible')).toHaveCount(3);
  }
  await fallback.close();
  console.log('PASS: projects scroll/filters/controls/case navigation, service scroll/demo/tab sync, about chapters/skills, reverse scrolling, mobile/320px, live reduced motion, and no-JS content.');
}
