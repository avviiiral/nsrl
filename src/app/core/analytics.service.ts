import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

type Gtag = (...args: unknown[]) => void;

/** Loads GA4 only in the browser and only when a measurement ID is configured. */
@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly doc = inject(DOCUMENT);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private gtag: Gtag | null = null;

  init(): void {
    const id = environment.ga4MeasurementId;
    if (!this.isBrowser || !id || this.gtag) return;

    const w = this.doc.defaultView as (Window & { dataLayer?: unknown[] }) | null;
    if (!w) return;
    w.dataLayer = w.dataLayer ?? [];
    // gtag.js expects the Arguments object itself to be pushed.
    this.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    } as Gtag;
    this.gtag('js', new Date());
    this.gtag('config', id, { send_page_view: false });

    const script = this.doc.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`;
    this.doc.head.appendChild(script);
  }

  pageView(path: string, title: string): void {
    this.gtag?.('event', 'page_view', { page_path: path, page_title: title });
  }

  event(name: string, params: Record<string, unknown> = {}): void {
    this.gtag?.('event', name, params);
  }
}
