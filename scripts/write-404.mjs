// Post-build step: publish the client-side app shell as 404.html so static
// hosts can serve it for URLs that have no prerendered page.
import { copyFile } from 'node:fs/promises';

const dir = new URL('../dist/nsrl-web/browser/', import.meta.url);
try {
  await copyFile(new URL('index.csr.html', dir), new URL('404.html', dir));
  console.log('Wrote dist/nsrl-web/browser/404.html');
} catch (err) {
  console.error(`Could not write 404.html: ${err.message}\nCheck that \`ng build\` completed and produced index.csr.html.`);
  process.exit(1);
}
