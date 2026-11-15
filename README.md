# North South Roadlines (NSRL) website

Angular 22 front end for nsrl.in. Seven prerendered pages, no backend.

| Page | Route |
| --- | --- |
| Home | `/` |
| About us | `/about` |
| Our services | `/services` |
| Our network | `/network` |
| Our clients | `/clients` |
| Enquiry | `/enquiry` |
| Contact us | `/contact` |

## Run it

```bash
npm install
npm start          # dev server on http://localhost:4200
npm run build      # production build in dist/nsrl-web/browser
npm run preview    # serve the production build on http://localhost:4300
```

Needs Node 22 or newer.

## Before going live: what the client must supply

Nothing below has been invented. Each item has a slot in `src/app/core/site.config.ts`
(or `src/environments/`), and the site hides or falls back cleanly until it is filled.

| Item | Where | Until supplied |
| --- | --- | --- |
| **Original NSRL logo file** | Put it in `public/brand/`, set `SITE.logo` | Header and footer show the name in plain text. The logo has not been redrawn. |
| **Brand colours from the logo** | `--signal` and `--sign` in `src/styles.scss` | Highway yellow and signboard green stand in. Tune these two tokens to the logo. |
| **Photography** (8 slots) | Put WebP/AVIF files in `public/images/`, set `IMAGES` | Each slot draws a road-surface plate. See "Photography" below. |
| **Client logos** (6) | Put official files in `public/clients/`, set `CLIENTS[].logo` | Client names are set in type. |
| **Formspree form ID** | `formspreeFormId` in `src/environments/environment.production.ts` | The enquiry form validates, then tells the visitor online enquiries are not switched on and offers phone and email. It never shows a false success. |
| **GA4 measurement ID** | `ga4MeasurementId` | Analytics script is not loaded. |
| **Search Console token** | `googleSiteVerification` | Verification tag is not rendered. |
| **WhatsApp number** | `SITE.whatsappNumber` | WhatsApp link is hidden. |
| **Login portal URL** | `SITE.loginUrl` | No login link is shown and no login page exists. Once the real destination is confirmed, add a header link that points to it. |
| **Social profiles** | `SITE.social` | Footer shows none. |
| **Ownership / leadership** | `SITE.ownership` | "Company particulars" on About shows only verified facts. No leadership section is rendered. |

### Content that needs the client's sign-off

- **Founding year.** The existing site mentions 1993, 1994, "30 years" and "31 years". This build uses only the tagline "Trucking value since 1994" and shows no year counters or experience statistics. Confirm the correct year.
- **Two email addresses.** `northsouthrl@gmail.com` is shown on the site. `nsrl@gmail.com` (the old enquiry address) is not shown; confirm which mailbox should receive enquiries and set it as the Formspree recipient.
- **Vision, mission and core values** on the About page are draft wording written for this build. They make no factual claims, but they speak for the company and need approval.
- **Service descriptions and benefits** stay within the three verified services. Full truckload, part truckload, warehousing, distribution and freight management are not mentioned anywhere; add them only after the company confirms it offers them.
- **Client list wording** says the six companies are "on the NSRL client list". It claims no endorsement.

### Photography

`IMAGES` in `site.config.ts` lists the eight slots with a note on the intended subject
(hero: heavy trucks on an Indian highway, and so on). Supply licensed photographs,
exported as WebP or AVIF, about 2400px wide for the hero and 1600px for the rest,
and record each file's real width and height so the browser can reserve space.
The hero image is loaded eagerly with high priority; all others are lazy-loaded.

## Enquiry form (Formspree)

1. Create a form at formspree.io with the NSRL mailbox as the recipient.
2. Copy the form ID (the part after `/f/` in the endpoint).
3. Set `formspreeFormId` in `src/environments/environment.production.ts` and rebuild.
4. In the Formspree dashboard, restrict the form to the `nsrl.in` domain and turn on its spam filtering (reCAPTCHA can also be enabled there).

The form ID is public by design; there are no secrets in this codebase. The form
also carries a `_gotcha` honeypot field, which Formspree uses to discard bot submissions.

## Analytics and Search Console

- **GA4:** set `ga4MeasurementId` (for example `G-XXXXXXXXXX`). Page views are sent on every route change and a `generate_lead` event on each successful enquiry.
- **Search Console:** add the property for `https://nsrl.in`, choose the "HTML tag" method, copy the `content` value into `googleSiteVerification`, rebuild, deploy, then press Verify. Submit `https://nsrl.in/sitemap.xml` afterwards.

## Deployment

`npm run build` writes a fully static site to `dist/nsrl-web/browser`. Upload that
folder to any static host (Netlify, Vercel, Firebase Hosting, S3 + CloudFront, cPanel).

- Each route has its own prerendered `index.html` with title, description, canonical URL, Open Graph tags and Organization structured data.
- `404.html` is the client-side app shell. Point the host's not-found fallback at it (Netlify, GitHub Pages and Firebase do this automatically or with one setting).
- Serve with gzip or Brotli, and give hashed `.js`/`.css` files and `/fonts/` long cache lifetimes.
- If the domain is ever not `https://nsrl.in`, change `siteUrl` in both environment files, plus `public/robots.txt` and `public/sitemap.xml`.

## Project layout

```
src/app/core/        site.config.ts (all content and slots), SEO, analytics, enquiry services
src/app/shared/      reusable components and the scroll-reveal directive
src/app/pages/       one component per route
src/styles.scss      design tokens, type scale, grid, buttons, motion
public/              robots.txt, sitemap.xml, fonts, and the brand / images / clients folders
qa/                  browser QA scripts, screenshots, Lighthouse reports, QA-REPORT.md
```

Shared components: `HeaderComponent`, `NavigationComponent`, `FooterComponent`,
`HeroComponent`, `SectionHeadingComponent`, `ServiceSectionComponent`,
`ClientLogoSectionComponent`, `NetworkSectionComponent`, `EnquiryFormComponent`,
`ContactInformationComponent`, `CtaSectionComponent`, `ScrollToTopComponent`,
`LoadingStateComponent`, plus `MediaComponent` (photo slot) and `HistoryComponent`.

## Running QA

```bash
npm i -D playwright          # once
npm run build && npm run qa  # all pages at 11 widths; screenshots in qa/screenshots
```

`qa/functional.mjs` exercises navigation, the map, SEO tags and every form state
against a mocked Formspree endpoint. It needs a build with any non-empty
`formspreeFormId`; pass its folder with `DIST=dist/<folder>`.

## Credits

- Typeface: Archivo Variable, SIL Open Font License, self-hosted in `public/fonts`.
- Map outline: `@svg-maps/india`, CC BY 4.0, credited beneath the map. City markers are city-level and indicative; no branch street addresses or coordinates are shown.
