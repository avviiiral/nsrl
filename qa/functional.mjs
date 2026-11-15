// Functional checks against a build made with a dummy Formspree ID
// (see README, "Running QA"). The Formspree endpoint is mocked, so nothing is sent.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
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

const ROOT = new URL(`../${process.env.DIST ?? 'dist/nsrl-web'}/browser/`, import.meta.url).pathname;
const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' };
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
const PORT = Number(process.env.QA_PORT ?? 4312);
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
const B = `http://localhost:${PORT}`;
const out = [];
const check = (name, ok, note = '') => { out.push({ name, ok }); console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${note ? '  ' + note : ''}`); };
let browser;
try {
  browser = await chromium.launch({ executablePath: process.env.CHROME_PATH ?? '/usr/bin/google-chrome' });

  // --- Desktop: navigation and routes
  let ctx = await browser.newContext({ viewport: { width: 1366, height: 800 } });
  await ctx.route(/google\.com|gstatic\.com/, (r) => r.abort());
  let page = await ctx.newPage();
  await page.goto(B);
  for (const [label, path, h1] of [['About', '/about', 'A road logistics'], ['Services', '/services', 'Transport, supply'], ['Network', '/network', 'Indore at the centre'], ['Clients', '/clients', 'The companies'], ['Contact', '/contact', 'Contact the head office']]) {
    await page.locator('app-header .bar__nav').getByRole('link', { name: label, exact: true }).click();
    await page.waitForURL(B + path);
    const t = await page.locator('h1').innerText();
    check(`nav → ${path}`, t.startsWith(h1), await page.title());
  }
  await page.goto(B);
  await page.getByRole('link', { name: 'Explore our services' }).click(); await page.waitForURL(B + '/services');
  check('hero primary CTA → /services', true);
  await page.goto(B);
  await page.locator('app-hero').getByRole('link', { name: 'Request an enquiry' }).click(); await page.waitForURL(B + '/enquiry');
  check('hero secondary CTA → /enquiry', true);
  await page.goto(B + '/services');
  await page.getByRole('link', { name: 'Enquire about 3PL' }).click(); await page.waitForURL(/enquiry\?service=3pl/);
  check('service CTA preselects service', (await page.locator('#f-service').inputValue()).includes('3PL'));
  await page.goto(B + '/contact');
  check('click-to-call links', (await page.locator('app-contact-information a[href^="tel:+91"]').count()) === 3);
  check('click-to-email link', (await page.locator('app-contact-information a[href="mailto:northsouthrl@gmail.com"]').count()) === 1);
  check('map iframe present', (await page.locator('iframe[src*="google.com/maps"]').count()) === 1);
  await page.goto(B + '/no-such-page');
  check('unknown route shows not-found page', (await page.locator('h1').innerText()).includes('does not go anywhere'));

  // --- Network map interaction
  await page.goto(B + '/network', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: /Raipur/ }).click();
  await page.waitForTimeout(250);
  check('selecting a city updates detail', (await page.locator('.detail').innerText()).includes('NSRL has a branch in Raipur'));
  await page.getByRole('button', { name: 'Cities served' }).click();
  await page.waitForTimeout(250);
  const stones = await page.locator('.stones .stone__cap').allInnerTexts();
  check('filter: cities served', stones.length === 7 && !stones.includes('Raipur') && stones.includes('Delhi'), stones.join(','));
  await page.getByRole('button', { name: 'Offices' }).click();
  await page.waitForTimeout(250);
  check('filter: offices', (await page.locator('.stones .stone').count()) === 8, String(await page.locator('.stones .stone').count()));

  // --- SEO metadata per route
  for (const p of ['', 'about', 'services', 'network', 'clients', 'enquiry', 'contact']) {
    const html = await (await fetch(`${B}/${p}`)).text();
    const ok = /<title>[^<]+\| North South Roadlines/.test(html) && html.includes('name="description"') && html.includes(`rel="canonical" href="https://nsrl.in/${p}"`) && html.includes('og:title') && html.includes('application/ld+json') && /<h1/.test(html);
    check(`prerendered SEO: /${p}`, ok);
  }

  // --- Enquiry form
  const form = async (routeHandler) => {
    const pg = await ctx.newPage();
    if (routeHandler) await pg.route('https://formspree.io/**', routeHandler);
    await pg.goto(B + '/enquiry', { waitUntil: 'networkidle' });
    return pg;
  };
  const fill = async (pg) => {
    await pg.fill('#f-name', 'Test Person'); await pg.fill('#f-company', 'Test Co'); await pg.fill('#f-email', 'test@example.com');
    await pg.fill('#f-phone', '+91 98765 43210'); await pg.selectOption('#f-service', { index: 1 });
    await pg.fill('#f-pickup', 'Indore'); await pg.fill('#f-delivery', 'Mumbai'); await pg.fill('#f-message', 'Twenty pallets, next week.');
    await pg.check('input[type=checkbox]');
  };
  let hits = 0;
  page = await form((r) => { hits++; r.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' }); });
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await page.waitForTimeout(250);
  check('empty submit shows required errors and sends nothing', (await page.locator('.err:not(:empty)').count()) === 9 && hits === 0, `errors=${await page.locator('.err:not(:empty)').count()}`);
  await fill(page);
  await page.fill('#f-email', 'not-an-email'); await page.fill('#f-phone', '12345'); await page.locator('#f-message').focus(); await page.waitForTimeout(150);
  check('email validation', (await page.locator('#e-email').innerText()).includes('email address'));
  check('Indian mobile validation rejects 12345', (await page.locator('#e-phone').innerText()).includes('10-digit'));
  for (const good of ['9876543210', '+919876543210', '09876543210', '98765-43210']) {
    await page.fill('#f-phone', good); await page.locator('#f-message').focus(); await page.waitForTimeout(150);
    check(`mobile accepted: ${good}`, (await page.locator('#e-phone').innerText()).trim() === '');
  }
  await page.fill('#f-phone', '5876543210'); await page.locator('#f-message').focus(); await page.waitForTimeout(150);
  check('mobile rejected: starts with 5', (await page.locator('#e-phone').innerText()).includes('10-digit'));
  await page.fill('#f-email', 'test@example.com'); await page.fill('#f-phone', '9876543210');
  let body;
  page.on('request', (r) => { if (r.url().includes('formspree')) body = r.postDataJSON(); });
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await page.getByText('Enquiry sent.').waitFor();
  check('success state after 200', hits === 1 && body?.pickup === 'Indore' && body?._gotcha === '' && !('consent' in body), JSON.stringify(Object.keys(body ?? {})));

  page = await form(async (r) => { await new Promise((s) => setTimeout(s, 800)); r.fulfill({ status: 422, contentType: 'application/json', body: '{"errors":[{"message":"bad"}]}' }); });
  await fill(page);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await page.getByText('Sending your enquiry').waitFor();
  check('loading state while sending', await page.getByRole('button', { name: 'Send enquiry' }).isDisabled());
  await page.getByText('Enquiry not sent.').waitFor();
  check('rejected submission shows error, no success, keeps input', (await page.getByText('Enquiry sent.').count()) === 0 && (await page.inputValue('#f-name')) === 'Test Person');

  page = await form((r) => r.abort());
  await fill(page);
  await page.getByRole('button', { name: 'Send enquiry' }).click();
  await page.getByText('could not reach the form service').waitFor();
  check('network failure shows error, no fake success', (await page.getByText('Enquiry sent.').count()) === 0);
  await ctx.close();

  // --- Mobile menu
  ctx = await browser.newContext({ viewport: { width: 375, height: 740 }, isMobile: true, hasTouch: true });
  page = await ctx.newPage();
  await page.goto(B);
  check('mobile menu closed and inert on load', (await page.locator('#mobile-menu').getAttribute('inert')) !== null);
  await page.getByRole('button', { name: 'Open menu' }).tap();
  await page.waitForTimeout(600);
  check('mobile menu opens', await page.locator('#mobile-menu').getByRole('link', { name: 'Network', exact: true }).isVisible());
  await page.locator('#mobile-menu').getByRole('link', { name: 'Network', exact: true }).tap();
  await page.waitForURL(B + '/network'); await page.waitForTimeout(600);
  check('mobile menu navigates and closes', (await page.locator('#mobile-menu').getAttribute('inert')) !== null);
  check('mobile call bar', (await page.locator('.quick a[href="tel:+919425410665"]').isVisible()));
  await page.evaluate(() => scrollTo(0, 3000)); await page.waitForTimeout(500);
  check('scroll-to-top appears', await page.getByRole('button', { name: 'Back to top' }).isVisible());
  await ctx.close();

} catch (err) {
  // A step threw (browser launch, navigation, or a locator timing out): count it as a failure.
  check(`run aborted: ${err.message.split('\n')[0]}`, false);
} finally {
  await browser?.close().catch(() => {});
  server.close();
}
const failed = out.filter((o) => !o.ok);
console.log(`\n${out.length - failed.length}/${out.length} passed`);
process.exit(failed.length ? 1 : 0);
