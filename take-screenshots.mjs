import {chromium} from '@playwright/test';
import {createServer} from 'node:http';
import {readFile, stat} from 'node:fs/promises';
import {resolve, extname} from 'node:path';

const server = createServer(async (req, res) => {
  try {
    let p = resolve('.', '.' + decodeURIComponent(new URL(req.url, 'http://localhost').pathname));
    if ((await stat(p)).isDirectory()) p = resolve(p, 'index.html');
    res.setHeader('Content-Type', ({'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png'})[extname(p)] || 'application/octet-stream');
    res.end(await readFile(p));
  } catch { res.statusCode = 404; res.end('Not found'); }
});
await new Promise(r => server.listen(5188, '127.0.0.1', r));
const browser = await chromium.launch({channel:'msedge', headless:true});
const page = await browser.newPage({viewport:{width:1200, height:800}});
await page.goto('http://127.0.0.1:5188/');
await page.locator('.entry-intro').waitFor({state:'hidden', timeout:8500});

for (const val of [0, 20, 40, 60, 80, 100]) {
  const slider = page.getByRole('slider', {name: 'Laptop exploded view'});
  await slider.fill(String(val));
  await page.waitForTimeout(200);
  await page.locator('.laptop-photo-stage').screenshot({path: `test-results/screenshots/anim-stage-${val}.png`});
}
await browser.close();
await new Promise(r => server.close(r));
console.log('Screenshots saved!');
