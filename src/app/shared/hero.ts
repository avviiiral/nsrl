import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ImageKey } from '../core/site.config';
import { MediaComponent } from './media';

/**
 * Full-bleed opening for every page. `size="home"` is the tall homepage
 * version; `size="page"` is the shorter inner-page version. Calls to action
 * are projected so each page decides its own.
 */
@Component({
  selector: 'app-hero',
  imports: [MediaComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-home]': 'size() === "home"', class: 'on-dark' },
  template: `
    <div class="hero__media">
      <app-media [image]="image()" [alt]="imageAlt()" [priority]="true" [tilt]="size() === 'home' ? -14 : -9" />
    </div>
    <div class="wrap hero__inner">
      @if (sign(); as s) {
        <p class="sign">{{ s }}</p>
      }
      <h1 class="hero__title">{{ title() }}</h1>
      @if (lead(); as l) {
        <p class="hero__lead">{{ l }}</p>
      }
      <div class="hero__actions btn-row"><ng-content /></div>
    </div>
  `,
  styles: `
    :host {
      position: relative;
      display: flex;
      align-items: flex-end;
      min-height: clamp(17rem, 44svh, 26rem);
      background: var(--asphalt);
      color: var(--paper);
      overflow: hidden;
      isolation: isolate;
    }
    :host(.is-home) {
      min-height: clamp(27rem, 76svh, 48rem);
    }
    .hero__media {
      position: absolute;
      inset: -6% 0;
      z-index: -1;
    }
    .hero__media app-media {
      width: 100%;
      height: 100%;
    }
    /* Scrim keeps the headline legible over any photograph. */
    .hero__media::after {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to top, rgb(27 32 35 / 0.92) 0%, rgb(27 32 35 / 0.55) 45%, rgb(27 32 35 / 0.15) 100%);
    }
    .hero__inner {
      padding-block: clamp(3rem, 2.5rem + 3vw, 5.5rem) clamp(2rem, 1.5rem + 3vw, 4.5rem);
    }
    .hero__title {
      max-width: 15ch;
    }
    :host(:not(.is-home)) .hero__title {
      font-size: var(--step-3);
      max-width: 20ch;
    }
    .hero__lead {
      margin-top: 1.1rem;
      max-width: 46ch;
      font-size: var(--step-1);
      line-height: 1.45;
    }
    .hero__actions {
      margin-top: 1.75rem;
    }
    .hero__actions:empty {
      display: none;
    }
    /* The tagline is lettered like an Indian highway signboard. */
    .sign {
      display: inline-block;
      margin-bottom: 1.4rem;
      padding: 0.5rem 0.9rem;
      background: var(--sign);
      border: 2px solid var(--paper);
      border-radius: 6px;
      box-shadow: 0 0 0 3px var(--sign);
      font-stretch: 86%;
      font-weight: 650;
      font-size: var(--step-0);
      line-height: 1.2;
    }

    @media (prefers-reduced-motion: no-preference) {
      /* One orchestrated load sequence: sign, headline, lead, actions. */
      .sign,
      .hero__title,
      .hero__lead,
      .hero__actions {
        animation: hero-rise 0.8s var(--ease) both;
      }
      .hero__title {
        animation-delay: 0.08s;
      }
      .hero__lead {
        animation-delay: 0.18s;
      }
      .hero__actions {
        animation-delay: 0.28s;
      }
      .hero__media app-media {
        animation: hero-settle 1.4s var(--ease) both;
      }
      /* Subtle parallax, driven by scroll position with no JavaScript. */
      @supports (animation-timeline: scroll()) {
        .hero__media {
          animation: hero-drift linear both;
          animation-timeline: scroll(root);
          animation-range: 0 100vh;
        }
      }
    }
    @keyframes hero-rise {
      from {
        opacity: 0;
        transform: translateY(1.5rem);
      }
    }
    @keyframes hero-settle {
      from {
        transform: scale(1.06);
      }
    }
    @keyframes hero-drift {
      to {
        transform: translateY(5%);
      }
    }
  `,
})
export class HeroComponent {
  readonly title = input.required<string>();
  readonly lead = input<string>();
  readonly sign = input<string>();
  readonly image = input.required<ImageKey>();
  readonly imageAlt = input('');
  readonly size = input<'home' | 'page'>('page');
}
