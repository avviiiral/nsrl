import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterLink, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AnalyticsService } from './core/analytics.service';
import { PageSeo, SeoService } from './core/seo.service';
import { SITE } from './core/site.config';
import { FooterComponent } from './shared/footer';
import { HeaderComponent } from './shared/header';
import { ScrollToTopComponent } from './shared/scroll-to-top';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, HeaderComponent, FooterComponent, ScrollToTopComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a class="skip" href="#main" (click)="skip($event, main)">Skip to content</a>
    <app-header />
    <main id="main" #main tabindex="-1"><router-outlet /></main>
    <app-footer />
    <app-scroll-to-top />

    <!-- Phones keep call and enquiry one thumb away on every page. -->
    <div class="quick">
      <a class="quick__call" [href]="'tel:' + phone.tel">Call NSRL</a>
      <a class="quick__enquiry" routerLink="/enquiry">Request an enquiry</a>
    </div>
  `,
  styles: `
    main {
      display: block;
      outline: none;
    }
    .skip {
      position: absolute;
      left: 0.5rem;
      top: -4rem;
      z-index: 100;
      padding: 0.75rem 1rem;
      background: var(--signal);
      color: var(--ink);
      font-weight: 650;
    }
    .skip:focus {
      top: 0.5rem;
    }
    .quick {
      position: fixed;
      inset: auto 0 0 0;
      z-index: 45;
      display: grid;
      grid-template-columns: 2fr 3fr;
      border-top: 2px solid var(--ink);
    }
    .quick a {
      display: grid;
      place-items: center;
      min-height: 3.5rem;
      padding: 0.25rem 0.5rem;
      font-weight: 700;
      text-align: center;
      line-height: 1.15;
      text-decoration: none;
    }
    .quick__call {
      background: var(--paper);
    }
    .quick__enquiry {
      background: var(--signal);
      border-left: 2px solid var(--ink);
    }
    @media (min-width: 48rem) {
      .quick {
        display: none;
      }
    }
  `,
})
export class App {
  protected readonly phone = SITE.phones[0];

  constructor() {
    const router = inject(Router);
    const route = inject(ActivatedRoute);
    const seo = inject(SeoService);
    const analytics = inject(AnalyticsService);
    analytics.init();

    router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe((e) => {
      let leaf = route;
      while (leaf.firstChild) leaf = leaf.firstChild;
      const page = leaf.snapshot.data['seo'] as PageSeo | undefined;
      if (!page) return;
      seo.apply(page, e.urlAfterRedirects);
      analytics.pageView(e.urlAfterRedirects, page.title);
    });
  }

  protected skip(event: Event, main: HTMLElement): void {
    event.preventDefault();
    main.focus();
    main.scrollIntoView();
  }
}
