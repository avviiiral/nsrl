import { ChangeDetectionStrategy, Component, DestroyRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { SERVICES } from '../core/site.config';
import { CtaSectionComponent } from '../shared/cta-section';
import { HeroComponent } from '../shared/hero';
import { ServiceSectionComponent } from '../shared/service-section';

@Component({
  selector: 'app-services-page',
  imports: [HeroComponent, ServiceSectionComponent, CtaSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero
      eyebrow="Our services"
      title="Transport, supply chain and 3PL."
      lead="Three services from one operator. Take one, or let NSRL run them together."
    />

    <nav class="jump" aria-label="Services on this page">
      <div class="wrap jump__inner">
        @for (s of services; track s.id; let i = $index) {
          <a
            class="jump__link"
            [class.is-here]="current() === s.id"
            [attr.aria-current]="current() === s.id ? 'true' : null"
            [href]="'/services#' + s.id"
            (click)="jump($event, s.id)"
          >
            <span class="jump__num">0{{ i + 1 }}</span>{{ s.short }}
          </a>
        }
      </div>
    </nav>

    @for (s of services; track s.id; let odd = $odd; let i = $index) {
      @defer (hydrate on viewport) {
        <app-service-section [service]="s" [flip]="odd" [index]="i" />
      }
    }

    @defer (hydrate on viewport) {

      <app-cta-section title="Not sure which service fits?" text="Describe the requirement and we will tell you how NSRL can handle it." />

    }
  `,
  styles: `
    .jump {
      position: sticky;
      top: var(--header-h);
      z-index: 20;
      background: var(--paper);
      box-shadow: 0 1px 0 rgb(15 18 20 / 0.12);
    }
    .jump__inner {
      display: flex;
      gap: 0 clamp(1rem, 3vw, 2.5rem);
      overflow-x: auto;
      scrollbar-width: none;
    }
    .jump__link {
      position: relative;
      display: inline-flex;
      align-items: baseline;
      gap: 0.5rem;
      padding-block: 1rem;
      font-weight: 700;
      white-space: nowrap;
      text-decoration: none;
      color: var(--muted);
      transition: color 0.3s;
    }
    .jump__link::after {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      height: 3px;
      background: var(--red);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.45s var(--ease-out);
    }
    .jump__link:hover,
    .jump__link.is-here {
      color: var(--ink);
    }
    .jump__link.is-here::after {
      transform: none;
    }
    .jump__num {
      font-size: 0.75rem;
      color: var(--red-deep);
      font-variant-numeric: tabular-nums;
    }
  `,
})
export class ServicesPage {
  protected readonly services = SERVICES;
  protected readonly current = signal<string | null>(null);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      // Highlight the service whose section is crossing the middle of the screen.
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) if (e.isIntersecting) this.current.set(e.target.id);
        },
        { rootMargin: '-45% 0px -50% 0px' },
      );
      SERVICES.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el) io.observe(el);
      });
      destroyRef.onDestroy(() => io.disconnect());
    });
  }

  protected jump(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView();
    try {
      history.replaceState(null, '', `/services#${id}`);
    } catch {
      /* sandboxed frames may refuse URL changes; the scroll has already happened */
    }
  }
}
