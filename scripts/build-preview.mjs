// Builds a self-contained preview of the site that runs from any folder or
// sandboxed frame: relative asset paths, client-rendered, routes kept in memory.
import { execFileSync } from 'node:child_process';
import { cp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';

const out = new URL('../dist/preview/', import.meta.url);
const built = new URL('../dist/preview-build/browser/', import.meta.url);
try {
  execFileSync('npx', ['ng', 'build', '--configuration', 'preview', '--output-path', 'dist/preview-build', '--base-href', './'], { stdio: 'inherit' });
  await rm(out, { recursive: true, force: true });
  await mkdir(new URL('fonts/', out), { recursive: true });
  for (const name of await readdir(built)) {
    if (/\.(js|css|svg)$/.test(name)) await cp(new URL(name, built), new URL(name, out));
  }
  await cp(new URL('fonts/archivo-latin.woff2', built), new URL('fonts/archivo-latin.woff2', out));
  // The app shell (not the prerendered homepage) is the entry point, and root-absolute URLs become relative.
  const html = await readFile(new URL('index.csr.html', built), 'utf8');
  await writeFile(new URL('index.html', out), html.replaceAll('url(/fonts/', 'url(fonts/').replaceAll('url("/fonts/', 'url("fonts/'));
  const css = await readFile(new URL('styles.css', out), 'utf8');
  await writeFile(new URL('styles.css', out), css.replaceAll('url(/fonts/', 'url(fonts/').replaceAll('url("/fonts/', 'url("fonts/'));
  await rm(new URL('../dist/preview-build/', import.meta.url), { recursive: true, force: true });
  console.log('Preview written to dist/preview');
} catch (err) {
  console.error(`Preview build failed: ${err.message}`);
  process.exit(1);
}
