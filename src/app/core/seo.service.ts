import { DOCUMENT, Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { environment } from '../../environments/environment';
import { SITE } from './site.config';

export interface PageSeo {
  title: string;
  description: string;
}

/** Sets per-route title, description, Open Graph, canonical and structured data. Runs during prerender too. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  apply(seo: PageSeo, path: string): void {
    const cleanPath = path.split(/[?#]/)[0].replace(/\/$/, '');
    const url = `${environment.siteUrl}${cleanPath || '/'}`;
    const fullTitle = `${seo.title} | ${SITE.name} (${SITE.brand})`;

    this.title.setTitle(fullTitle);
    this.meta.updateTag({ name: 'description', content: seo.description });
    this.meta.updateTag({ property: 'og:type', content: 'website' });
    this.meta.updateTag({ property: 'og:site_name', content: SITE.name });
    this.meta.updateTag({ property: 'og:title', content: fullTitle });
    this.meta.updateTag({ property: 'og:description', content: seo.description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:locale', content: 'en_IN' });
    this.meta.updateTag({ name: 'twitter:card', content: 'summary' });

    if (environment.googleSiteVerification) {
      this.meta.updateTag({ name: 'google-site-verification', content: environment.googleSiteVerification });
    }

    let canonical = this.doc.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = this.doc.createElement('link');
      canonical.rel = 'canonical';
      this.doc.head.appendChild(canonical);
    }
    canonical.href = url;

    this.setStructuredData();
  }

  /** Organization schema built only from verified company facts. */
  private setStructuredData(): void {
    const id = 'nsrl-org-schema';
    if (this.doc.getElementById(id)) return;
    const script = this.doc.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: SITE.name,
      alternateName: SITE.brand,
      url: environment.siteUrl,
      slogan: SITE.tagline,
      description: SITE.business,
      email: SITE.email,
      telephone: SITE.phones.map((p) => p.tel),
      address: {
        '@type': 'PostalAddress',
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.region,
        addressCountry: SITE.address.country,
      },
    });
    this.doc.head.appendChild(script);
  }
}
