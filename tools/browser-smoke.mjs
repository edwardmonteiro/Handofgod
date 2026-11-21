import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { chromium } from 'playwright';

const root = process.cwd();
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, '.' + pathname, pathname.endsWith('/') ? 'index.html' : '');
    if (file !== root && !file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream' }).end(bytes);
  } catch { res.writeHead(404).end(); }
});

await new Promise((resolveStart) => server.listen(0, '127.0.0.1', resolveStart));
const base = `http://127.0.0.1:${server.address().port}`;
let browser;
try {
  browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  for (const path of ['/', '/?slice=traverse']) {
    const page = await browser.newPage({ viewport: { width: 960, height: 540 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`));
    page.on('console', (message) => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    page.on('response', (response) => { if (response.status() >= 400) errors.push(`HTTP ${response.status()}: ${response.url()}`); });
    await page.goto(base + path, { waitUntil: 'load' });
    await page.waitForTimeout(5000);
    const canvas = await page.locator('#game').evaluate((element) => ({
      width: element.width, height: element.height,
    }));
    if (!canvas.width || !canvas.height) errors.push('canvas did not initialize');
    await page.close();
    if (errors.length) throw Error(`Smoke failed at ${path}:\n${errors.join('\n')}`);
    console.log(`Smoke passed: ${path}, 5 seconds, canvas ${canvas.width}x${canvas.height}`);
  }
} finally {
  await browser?.close();
  await new Promise((resolveClose) => server.close(resolveClose));
}
