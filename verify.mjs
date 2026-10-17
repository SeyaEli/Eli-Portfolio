import {chromium,expect} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile,stat,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve,extname,sep} from 'node:path';
import assert from 'node:assert/strict';
import {verifyMotion} from './verify-motion.mjs';
import {verifySculpture} from './verify-sculpture.mjs';
import {verifyServices} from './verify-services.mjs';
import {verifyIntro} from './verify-intro.mjs';
const projectRoot=resolve(fileURLToPath(new URL('.',import.meta.url)));
const root=process.argv.includes('--dist')?resolve(projectRoot,'dist'):projectRoot;
process.chdir(projectRoot);
await mkdir('test-results/screenshots',{recursive:true});
const server=createServer(async(req,res)=>{try{let path=resolve(root,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));if(!path.startsWith(root+sep)&&path!==root)throw Error();if((await stat(path)).isDirectory())path=resolve(path,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.pdf':'application/pdf'})[extname(path)]||'application/octet-stream');res.end(await readFile(path))}catch{res.statusCode=404;res.end('Not found')}});
await new Promise(r=>server.listen(5176,'127.0.0.1',r));
const browser=await chromium.launch({channel:'msedge',headless:true});
try{
 if(process.argv.includes('--laptop-only')){
   await verifyIntro(browser,'http://127.0.0.1:5176/');
   await verifySculpture(browser,'http://127.0.0.1:5176/');
 }else if(process.argv.includes('--intro-only')){
   await verifyIntro(browser,'http://127.0.0.1:5176/');
 }else if(process.argv.includes('--services-only')){
   await verifyServices(browser,'http://127.0.0.1:5176/');
 }else{
 await verifyIntro(browser,'http://127.0.0.1:5176/');
 const page=await browser.newPage({viewport:{width:1440,height:1000}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const base='http://127.0.0.1:5176/';await page.goto(base);await expect(page.locator('.entry-intro')).toBeHidden({timeout:8500});await page.screenshot({path:'test-results/screenshots/desktop-preview.png',fullPage:true});
 await expect(page.locator('.hero-art')).toHaveAttribute('data-sculpture-state',/ready|fallback/);
 const urls=new Set(['index.html','projects.html','services.html','about.html','contact.html']);
 await page.goto(base+'projects.html');for(const href of await page.locator('.project').evaluateAll(a=>a.map(x=>x.getAttribute('href'))))urls.add(href);
 for(const [name,count] of [['Web3',2],['Government systems',2],['Web applications',4],['All projects',8]]){await page.getByRole('button',{name,exact:false}).click();assert.equal(await page.locator('.project:visible').count(),count)}
 for(const url of urls){await page.goto(base+url);assert.equal(await page.locator('h1').count(),1);assert.equal(await page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),true,url+' desktop overflow');await page.locator('img').evaluateAll(imgs=>imgs.forEach(i=>i.loading='eager'));await expect.poll(()=>page.locator('img').evaluateAll(imgs=>imgs.every(i=>i.complete&&i.naturalWidth>0)),{message:url+' images'}).toBe(true);for(const link of await page.locator('a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')).filter(x=>!x.includes(':')&&!x.startsWith('#')))){const response=await page.request.get(base+link);assert.equal(response.status(),200,link)}
 await page.setViewportSize({width:390,height:844});await expect.poll(()=>page.locator('body').evaluate(el=>el.scrollWidth<=innerWidth),{message:url+' mobile overflow'}).toBe(true);await page.setViewportSize({width:1440,height:1000})}
 await page.goto(base+'services.html');await page.getByRole('tab',{name:'Information systems'}).click();await expect(page.locator('#service-systems')).toBeVisible();
 await page.goto(base+'contact.html');await page.getByRole('button',{name:'Compose email'}).click();assert.equal(await page.locator('#name').evaluate(e=>e.validity.valueMissing),true);
 await page.context().grantPermissions(['clipboard-read','clipboard-write']);await page.getByRole('button',{name:'Copy email address'}).click();await expect(page.locator('.copy-status')).toHaveText('Email address copied.');
 await page.goto(base);await page.setViewportSize({width:390,height:844});await page.getByRole('button',{name:'Open navigation'}).click();assert.equal(await page.locator('#navigation').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#navigation').isVisible(),false);await page.screenshot({path:'test-results/screenshots/mobile-preview.png',fullPage:true});
 const tiny=await page.evaluate(()=>{const w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT);const a=[];while(w.nextNode()){const e=w.currentNode.parentElement;if(w.currentNode.textContent.trim()&&e.getClientRects().length&&parseFloat(getComputedStyle(e).fontSize)<14)a.push(e.textContent)}return a});assert.deepEqual(tiny,[]);assert.deepEqual(errors,[]);
 await page.emulateMedia({reducedMotion:'reduce'});assert.equal(await page.locator('html').evaluate(e=>getComputedStyle(e).scrollBehavior),'auto');
 console.log('PASS: 13 pages, local links and images, filters, service disclosure, email validation and copy, sculpture control, mobile menu/Escape, desktop/mobile overflow, text size, reduced motion, and runtime errors.');
 await verifyMotion(browser, base);
 await verifySculpture(browser, base);
 await verifyServices(browser, base);
 }
}finally{await browser.close();await new Promise(r=>server.close(r))}


