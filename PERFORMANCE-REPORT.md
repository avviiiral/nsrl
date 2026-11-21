# Performance report

Measured 21–22 Nov 2026 on the production build (`npm run build`), served locally with gzip and
long cache headers, Lighthouse 12 mobile defaults (simulated slow 4G, 4× CPU slowdown), headless
Chrome in a shared container. Full JSON reports are in `qa/lighthouse/`.

## Lighthouse (mobile), final run

| Page | Performance | Accessibility | Best practices | SEO | FCP | LCP | TBT | CLS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Home | 90 | 100 | 100 | 100 | 0.8 s | 0.8 s | 430 ms | 0.001 |
| About | 93 | 100 | 100 | 100 | 0.7 s | 0.7 s | 330 ms | 0.003 |
| Services | 90 | 100 | 100 | 100 | 0.9 s | 0.9 s | 410 ms | 0.017 |
| Network | 96 | 100 | 100 | 100 | 0.8 s | 0.8 s | 220 ms | 0 |
| Clients | 90 | 100 | 100 | 100 | 0.6 s | 2.7 s | 290 ms | 0 |
| Enquiry | 95 | 100 | 100 | 100 | 0.6 s | 2.5 s | 200 ms | 0 |
| Contact | 97 | 100 | 100 | 100 | 0.6 s | 0.6 s | 200 ms | 0 |

Targets (Perf 90+, A11y 95+, BP 95+, SEO 95+) are met on every page, but three pages sit exactly
at 90. Scores moved by ±5 between identical runs in this environment, so treat 90 as the floor,
not a margin. Lighthouse here runs without WebGL, so these numbers reflect the poster hero; the
3D chunk is not downloaded during the mobile test (phones start it on first touch).

## What was done

- Three.js in its own lazy chunk; GSAP loaded on first user intent; neither is in the initial bundle.
- Incremental hydration (`@defer (hydrate on viewport)`) for below-the-fold sections.
- Scroll effects decide visibility from IntersectionObserver callbacks, not forced layout.
- India map path data cut 77% (homepage HTML 284 kB → 150 kB).
- CSS road animations use transforms only (no per-frame repaint).
- Sized images, `srcset` for the logo and photo, AVIF/WebP-ready slots.
- 3D: adaptive resolution, still-frame mode on weak GPUs, pause off-screen, async shader compile,
  build split into yielding steps, full disposal on navigation.

## Remaining blocking time

The remaining 200–430 ms of TBT is Angular bootstrap and hydration of the app shell (header,
navigation, footer, hero) under 4× CPU slowdown. Next steps if more margin is wanted: hydrate the
footer and hero chapters on idle, trim the header's hydration, and move per-component CSS for
below-the-fold blocks into deferred chunks. Clients/Enquiry LCP (2.5–2.7 s) is a lazy logo/meter
paint; making the first wall row eager would help.

## Not measured

Real devices, Safari, and a deployed host (CDN, HTTP/2). Re-run Lighthouse after deploying and
after real photography is added.
