# QA report

Tested on the production build (`npm run build`) in headless Chrome, 14 November 2026.

## Summary

| Check | Result |
| --- | --- |
| Production build | Passes, no TypeScript or template errors or warnings, 7 routes prerendered |
| Pages x viewports | 77 of 77 clean (7 pages at 11 widths) |
| Functional checks | 39 of 39 pass |
| Console errors | None |
| Lighthouse (mobile) | Performance 96–100, Accessibility 100, Best Practices 100, SEO 100 |

## Pages tested

Home, About, Services, Network, Clients, Enquiry, Contact, plus the not-found page.

## Viewports tested

320, 360, 375, 390, 412, 430, 768, 1024, 1366, 1440 and 1920 px wide. At each one
every page was loaded and checked for horizontal overflow, elements extending past
the viewport, exactly one `h1`, console errors, and buttons shorter than 44 px.
Full-page screenshots at 390 px and 1440 px are in `qa/screenshots/`; raw results
are in `qa/results.json`. Screenshots at 320 px and 768 px were also reviewed by eye.

## Functional checks (qa/functional.mjs)

- Every header link reaches the right page with the right title and heading.
- Both hero calls to action, and the per-service enquiry buttons (which preselect the service).
- Three click-to-call links and the click-to-email link on Contact.
- Unknown URLs show the not-found page.
- Network: selecting a city updates the detail panel; the Offices and Cities served filters show 8 and 7 locations.
- Prerendered HTML for all 7 routes contains title, description, canonical URL, Open Graph tags, structured data and an `h1`.
- Enquiry form: empty submit shows all 9 errors and sends nothing; email validation; Indian mobile validation (accepts `9876543210`, `+919876543210`, `09876543210`, `98765-43210`; rejects short numbers and numbers not starting 6–9).
- Enquiry form states against a mocked Formspree endpoint: loading state with the button disabled, success after HTTP 200, error after HTTP 422 with input kept, error after a network failure. No path shows success without a 200.
- Mobile: menu is inert when closed, opens, navigates and closes; call bar is present; back-to-top button appears after scrolling.

## Lighthouse (mobile emulation, local static server with gzip)

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS |
| --- | --- | --- | --- | --- | --- | --- |
| Home | 98 | 100 | 100 | 100 | 1.8 s | 0 |
| About | 100 | 100 | 100 | 100 | 1.1 s | 0 |
| Services | 100 | 100 | 100 | 100 | 0.9 s | 0 |
| Network | 97 | 100 | 100 | 100 | 1.8 s | 0.013 |
| Clients | 99 | 100 | 100 | 100 | 1.0 s | 0.001 |
| Enquiry | 100 | 100 | 100 | 100 | 0.9 s | 0 |
| Contact | 96 | 100 | 100 | 100 | 0.9 s | 0 |

Full JSON reports are in `qa/lighthouse/`. These numbers were measured without
photographs and without the Google map loading; expect them to move once real
images are added, so re-run after that.

## Issues found and fixed

| Issue | Fix |
| --- | --- |
| Image wipe reveals never fired: clipping the observed element hid it from IntersectionObserver | Clip the child instead of the observed element |
| Two-column splits collapsed to one narrow column on About | Column-span and column-start utilities no longer override each other |
| Spacing utilities ignored on component hosts (inline by default) | Hosts set to block |
| Map outline invisible on white sections | Land fill follows the section background |
| Homepage LCP 5.8 s, performance 65 | Font self-hosted and preloaded; map code deferred until scrolled into view; score now 98 |
| Clicks made before hydration finished were lost | Event replay enabled |
| Brand link accessible name did not match its visible text | Redundant aria-label removed |
| Unknown URLs fell back to the prerendered homepage | Build now emits `404.html` from the app shell |
| "Why NSRL" terms rendered in regular weight | Heading utility classes share the display style |

## Not tested here

- **Live Formspree submission.** No form ID exists yet. Success, rejection and network-failure handling were tested against a mocked endpoint; send one real enquiry after the ID is set.
- **Google Maps embed.** Google domains are blocked in the test environment, so the iframe was checked for presence and URL only. Confirm on a normal connection that the pin lands on the head office.
- **The existing nsrl.in site.** It could not be reached from the build environment, so no audit of the live site, its Login link or its assets was done. Content comes from the project brief.
- **Production deployment.** Nothing has been deployed.
- **Real devices and Safari.** Testing used Chrome's emulation only.
- **GA4 and Search Console.** Wired up but inactive until IDs are supplied.

## Known limitation

Text typed into the enquiry form in the first moments before the page's JavaScript
has loaded can be cleared when the form becomes interactive. On a normal connection
this window is well under a second.
