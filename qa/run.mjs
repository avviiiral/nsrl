// Browser QA: serves the production build, loads every page at every target
// width, records console errors and horizontal overflow, and saves screenshots.
//   node qa/run.mjs            (after `npm run build`)
// Needs Playwright (`npm i -D playwright`) and Chrome; set CHROME_PATH if it is not on the default path.
import http from 'node:http';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
// Playwright is loaded from the project if installed, otherwise from a shared tools folder.
function loadChromium() {
  for (const load of [() => require('playwright'), () => createRequire(process.env.PLAYWRIGHT_DIR ?? '/opt/npm-tools/node_modules/')('playwright')]) {
    try {
      return load().chromium;
    } catch {
      /* not available from this location; try the next one */
    }
  }
  console.error('Playwright is not installed. Run `npm i -D playwright` in the project, then try again.');
  process.exit(1);
}
const chromium = loadChromium();

const ROOT = new URL('../dist/nsrl-web/browser/', import.meta.url).pathname;
const OUT = new URL('./screenshots/', import.meta.url).pathname;
const PAGES = ['', 'about', 'services', 'network', 'clients', 'enquiry', 'contact'];
const WIDTHS = [320, 360, 375, 390, 412, 430, 768, 1024, 1366, 1440, 1920];
const SHOOT = new Set((process.env.SHOOT ?? '390,1440').split(',').map(Number));
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.xml': 'application/xml', '.txt': 'text/plain' };

if (!existsSync(ROOT)) {
  console.error(`Build folder not found: ${ROOT}\nRun \`npm run build\` first.`);
  process.exit(1);
}
const server = http.createServer(async (req, res) => {
  try {
    const path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const file = [join(ROOT, path), join(ROOT, path, 'index.html'), join(ROOT, '404.html')].find((f) => existsSync(f) && extname(f));
    if (!file) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not found. Run `npm run build` first.');
      return;
    }
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] ?? 'application/octet-stream' });
    res.end(body);
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end(`Static server error: ${err.message}`);
  }
});
const PORT = Number(process.env.QA_PORT ?? 4311);
try {
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(PORT, resolve);
  });
} catch (err) {
  console.error(
    err.code === 'EADDRINUSE'
      ? `Port ${PORT} is already in use. Stop the other process or set QA_PORT to a free port.`
      : `Could not start the local QA server: ${err.message}`,
  );
  process.exit(1);
}
try {
  await mkdir(OUT, { recursive: true });
} catch (err) {
  console.error(`Could not create the screenshot folder ${OUT}: ${err.message}`);
  server.close();
  process.exit(1);
}

const results = [];
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome' });
  for (const width of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width, height: width < 768 ? 800 : 900 }, deviceScaleFactor: 1, isMobile: width < 768, hasTouch: width < 768 });
    // Third-party map tiles are not part of what is being tested.
    await ctx.route(/google\.com|gstatic\.com|googleapis\.com/, (r) => r.abort());
    for (const p of PAGES) {
      const page = await ctx.newPage();
      const errors = [];
      page.on('console', (m) => m.type() === 'error' && !/ERR_FAILED|ERR_BLOCKED/.test(m.text()) && errors.push(m.text()));
      page.on('pageerror', (e) => errors.push(String(e)));
      await page.goto(`http://localhost:${PORT}/${p}`, { waitUntil: 'load' });
      await page.waitForTimeout(700);
      const m = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const wide = [...document.querySelectorAll('body *')]
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && (r.right > vw + 1 || r.left < -1) && getComputedStyle(el).position !== 'fixed' && !el.closest('.hero__media, .plate, .trap, .visually-hidden, .skip, svg'); })
          .slice(0, 5).map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 40)}`);
        const small = [...document.querySelectorAll('a.btn, button, .quick a')]
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height < 44 && getComputedStyle(el).visibility !== 'hidden'; })
          .map((el) => `${el.textContent.trim().slice(0, 24)} (${Math.round(el.getBoundingClientRect().height)}px)`);
        return { scrollW: document.documentElement.scrollWidth, vw, wide, small, h1: document.querySelectorAll('h1').length, title: document.title };
      });
      if (SHOOT.has(width)) {
        // Scroll through once so lazy content and reveals settle before capture.
        await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 300) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 120)); } scrollTo(0, 0); });
        await page.waitForTimeout(900);
        // Sticky and fixed chrome repeats oddly in full-page captures; pin it for the picture only.
        await page.addStyleTag({ content: 'app-header{position:static!important}.quick,.top{display:none!important}' });
        await page.screenshot({ path: `${OUT}${p || 'home'}-${width}.png`, fullPage: true });
      }
      results.push({ page: p || 'home', width, overflow: m.scrollW > m.vw || m.wide.length > 0, wide: m.wide, small: m.small, h1: m.h1, errors, title: m.title });
      await page.close();
    }
    await ctx.close();
  }
} catch (err) {
  // Browser launch, page load or a screenshot write failed: report it and stop cleanly.
  console.error(`QA run stopped: ${err.message}`);
  process.exitCode = 1;
} finally {
  await browser?.close().catch(() => {});
  server.close();
}

const bad = results.filter((r) => r.overflow || r.errors.length || r.h1 !== 1 || r.small.length);
try {
  await writeFile(new URL('./results.json', import.meta.url), JSON.stringify(results, null, 1));
} catch (err) {
  // The findings below are still printed, so a read-only folder does not hide the result.
  console.error(`Could not save qa/results.json: ${err.message}`);
  process.exitCode = 1;
}
console.log(`${results.length} page/viewport checks, ${bad.length} with findings`);
for (const r of bad) console.log(JSON.stringify(r));
