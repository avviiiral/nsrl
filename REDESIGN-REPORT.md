# NSRL premium 3D redesign — report

Branch `feature/3d-smooth-experience`, built on top of its two existing depth/motion commits.
Base commit for the patch: `main` @ `0728ffe`.

## 1. Live-site audit (nsrl.in, fetched 21 Nov 2026)

The live site is a Next.js build with five routes: `/`, `/about`, `/contact`, `/enquiry`, `/login`.
Every business fact on it matches `src/app/core/site.config.ts`; nothing new was invented.

Preserved, verified content: company name and NSRL brand, tagline "Trucking value since 1994",
head office 21/7 Gulab Bagh, Dewas Naka, Indore; branches Ahmedabad, Pune, Mumbai, Gurgaon,
Chandigarh, Raipur, Bhopal; cities served Delhi, Mumbai, Hyderabad, Ahmedabad, Indore, Pune,
Jaipur; phones 94254-10665, 92001-61925, 98931-33019; email northsouthrl@gmail.com; Airtel as
first logistics partner in Central India; expansion into 3PL; clients Britannia, Bisleri,
Samsung, Nilkamal, TATA, DMart.

Discrepancies found on the live site (documented, not resolved — needs the company's decision):

| Item | Live site says | This build |
| --- | --- | --- |
| Founding year | "since 1993" (About copy) vs "since 1994" (tagline) | Only the tagline is used; no year counters |
| Experience | "30 years of Experience" vs "over 31 years, spanning over 4 decades" in the same block | No experience figure shown |
| Email | northsouthrl@gmail.com (Contact) vs nsrl@gmail.com (Enquiry page) | northsouthrl@gmail.com only |

Functional findings on the live site:
- **Enquiry form sends nothing.** Its submit handler reads the fields, calls `preventDefault()`
  and resets the form. No request, no message. The redesign keeps the repo's Formspree flow,
  which only reports success after a confirmed 2xx and otherwise shows phone/email instead.
- **Login has no backend** (`action="post"`, no handler). No login link is shown here.
- The live Samsung logo link (Wikimedia) returns 404.

## 2. What changed, page by page

**Every page.** New design system (brand red `#DE2A1B` sampled from the original logo, night
asphalt, concrete, highway-yellow for road markings only; Archivo Variable, condensed for
display). The original NSRL logo (from nsrl.in, unchanged, resampled to WebP) in header and
footer; favicon from nsrl.in. Fixed header that is transparent over each page's dark opening and
solid once past it, a red scroll-progress rule, a sliding active-link marker, an animated
services dropdown, a full-screen staggered mobile menu. Red closing CTA lined with the logo's
stripes. Inner-page openings carry a carriageway drawn as a genuine CSS 3D plane.

**Home.** Real-time Three.js hero (below), then: company intro with the real NSRL truck
photograph (masked reveal + parallax) and count-up figures (1 head office, 7 branch cities,
7 cities served, 3 services — counts of verified lists only); a pinned horizontal services rail;
"Why NSRL" as kilometre stones along a road that draws on scroll; the India network map; a
client marquee; the history road with a truck marker driven by scroll; CTA.

**About.** Company story with the truck photo, scroll-driven history road, company particulars,
vision/mission/values, expertise list.

**Services.** Sticky jump bar that tracks the section being read; each service has its own
animated diagram: transportation (a consignment travelling a road from Indore), supply chain
(supplier → stock point → customer flow), 3PL (isometric CSS 3D stack whose logistics layer
slides out to NSRL).

**Network.** Interactive map on dark: offices in red, cities served as white rings, arcs from the
Indore head office to each branch drawn on first view, pulsing head-office marker, filters and
kilometre-stone buttons. The caption says plainly that the arcs show how the network is
organised, not freight lanes.

**Clients.** Large tile wall with pointer tilt and sheen; official logos where available.

**Enquiry.** Consignment-note form restyled: red header with a live "n of 8 details" meter,
valid-field ticks, a red focus rule per cell. Validation and submission logic unchanged.

**Contact.** Restyled contact block and map.

## 3. 3D and motion

| Effect | How |
| --- | --- |
| Highway hero | Three.js scene: procedural medium-duty truck (red cab, white container with the original logo drawn onto the livery), scrolling asphalt and centre line, instanced kilometre stones, delineators, street lights, oncoming headlamps, dusk sky shader, hills, fog, PMREM reflections |
| Scroll camera | Four camera shots on Catmull-Rom curves driven by native scroll through three hero chapters; eased, never scroll-jacked |
| Pointer parallax | Camera drift on fine pointers only |
| Framing | View offset keeps the truck beside the copy on desktop and above it on phones |
| CSS 3D | Inner-page road planes, fallback poster road, isometric 3PL stack, pointer tilt on client tiles and service panels |
| GSAP ScrollTrigger | Pinned horizontal services rail, hero chapter fades, history and "why" road scrubs, photo parallax |
| Other | Word-split headline reveals, masked image reveals, count-ups, SVG route/flow animations, map arc draw |

Fallbacks and safety: the hero prerenders a CSS road poster (the LCP), and Three.js is a separate
lazy chunk downloaded only when used. No WebGL, reduced motion or Save-Data → poster only.
Phones start the scene after the first touch/scroll, desktops when idle. The scene pauses
off-screen and in hidden tabs, drops resolution on slow GPUs and, if still too slow, renders only
on scroll. Context loss falls back to the poster. All geometry, materials and textures are
disposed on navigation.

## 4. Libraries introduced

- **three 0.187** — real WebGL rendering; Angular-native, no React. Lazy chunk (~120 kB gzip).
- **gsap 3.15 + ScrollTrigger** — pinning and scrubbed timelines (free for commercial use since
  3.13). Loaded on first user intent, never in the initial bundle.
- Not used: React / @react-three/fiber (not needed), Lenis (native scrolling is better for
  accessibility and was enough), Lottie (no vector assets that need it).
- `@svg-maps/india` moved to devDependencies: `npm run map:simplify` generates a lighter,
  visually identical outline (`src/app/shared/india-map.ts`, 174 kB → 40 kB of path data, every
  state's bounding box unchanged, all islands kept).

## 5. Build and test status

- `npm run build`: passes, no errors or warnings, 7 routes prerendered, 404.html written.
- `qa/run.mjs`: 77/77 page × width checks clean (7 pages at 320–1920 px: no overflow, one h1,
  no console errors, no buttons under 44 px). The overflow check now ignores content clipped by
  an `overflow` ancestor.
- `qa/functional.mjs`: 39/39 pass (navigation, CTAs, click-to-call/email, map filters, SEO tags on
  all prerendered routes, every enquiry state against a mocked Formspree endpoint).
- Reduced motion, WebGL disabled, and full motion + WebGL checked on every page at 1440 and 390:
  no console errors, no hidden content.
- `npm test`: the project has no spec files, so there is nothing to run.
- Lighthouse: see PERFORMANCE-REPORT.md.
- Screenshots: `qa/screenshots/*-1440.png`, `*-390.png` (all pages, rendered without WebGL) and
  `qa/screenshots/3d/` (live 3D hero, desktop and phone, three scroll positions).

## 6. Not done / needs the company

- Real Formspree form ID, GA4 ID, Search Console token, WhatsApp number (slots unchanged).
- Founding year, experience figure and enquiry mailbox (see discrepancies).
- Vision, mission and values are draft wording and need approval.
- Missing assets: see ASSET-REQUIREMENTS.md.
- Not tested on real devices or Safari; Google Maps tiles were blocked during automated runs.
