/**
 * Public, non-secret configuration. Everything here ships to the browser,
 * so never put private keys in this file.
 */
export const environment = {
  production: true,
  /** True only for the sandboxed preview build (`npm run build:preview`); routes are kept in memory. */
  preview: false,
  /** Canonical origin, no trailing slash. */
  siteUrl: 'https://nsrl.in',
  /** Formspree form ID (the part after /f/ in the endpoint). Empty = enquiries disabled. */
  formspreeFormId: '',
  /** GA4 measurement ID, e.g. G-XXXXXXXXXX. Empty = analytics not loaded. */
  ga4MeasurementId: '',
  /** Google Search Console HTML-tag token. Empty = tag not rendered. */
  googleSiteVerification: '',
};
