import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CITIES, IMAGES, SERVICES } from '../core/site.config';
import { ClientLogoSectionComponent } from '../shared/client-logo-section';
import { CountUpDirective } from '../shared/count-up.directive';
import { CtaSectionComponent } from '../shared/cta-section';
import { Hero3dComponent } from '../shared/hero-3d';
import { HistoryComponent } from '../shared/history';
import { NetworkSectionComponent } from '../shared/network-section';
import { ParallaxDirective } from '../shared/parallax.directive';
import { RevealDirective } from '../shared/reveal.directive';
import { ServicesRailComponent } from '../shared/services-rail';
import { SplitDirective } from '../shared/split.directive';
import { WhyRoadComponent } from '../shared/why-road';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    Hero3dComponent,
    ServicesRailComponent,
    WhyRoadComponent,
    ClientLogoSectionComponent,
    NetworkSectionComponent,
    HistoryComponent,
    CtaSectionComponent,
    RevealDirective,
    SplitDirective,
    ParallaxDirective,
    CountUpDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero-3d />

    <section class="section intro" aria-labelledby="intro-title">
      <div class="wrap grid intro__grid">
        <div class="col-6 intro__copy">
          <p class="eyebrow">About NSRL</p>
          <h2 id="intro-title" appSplit>A logistics company built on the road out of Indore.</h2>
          <div class="prose">
            <p>
              North South Roadlines works in supply chain and logistics management, transportation and third-party
              logistics. The company is headquartered in Indore, with branches in Ahmedabad, Pune, Mumbai, Gurgaon,
              Chandigarh, Raipur and Bhopal.
            </p>
            <p>
              It began in Central India, where Airtel was its first logistics partner, and has grown from trucking into
              3PL.
            </p>
          </div>
          <a class="go" routerLink="/about">Read the company story</a>
        </div>
        @if (photo; as p) {
          <figure class="col-5 start-8 intro__figure" appReveal="wipe">
            <div class="intro__frame">
              <img
                appParallax
                [speed]="-0.1"
                [src]="p.src"
                [attr.srcset]="p.srcset"
                sizes="(min-width: 60rem) 36vw, 92vw"
                [width]="p.width"
                [height]="p.height"
                alt="An NSRL goods carrier, its board lettered NSRL, parked at a loading dock"
                loading="lazy"
                decoding="async"
              />
            </div>
            <figcaption class="small muted">An NSRL goods carrier at a loading dock.</figcaption>
          </figure>
        }
      </div>

      <!-- Counts of the verified lists above; no other figures are claimed. -->
      <dl class="wrap figures">
        @for (f of figures; track f.label) {
          <div class="figure" appReveal>
            <dt>{{ f.label }}</dt>
            <dd><span class="figure__n" [appCountUp]="f.value">{{ f.value }}</span></dd>
            <dd class="figure__note">{{ f.note }}</dd>
          </div>
        }
      </dl>
    </section>

    @defer (hydrate on viewport) {
      <app-services-rail />
    }

    <section class="section">
      @defer (hydrate on viewport) {
        <app-why-road />
      }
    </section>

    <section class="section section--asphalt on-dark" aria-labelledby="network-title">
      <div class="wrap stack" style="--stack: 2.75rem">
        <div class="head-row">
          <div>
            <p class="eyebrow">The network</p>
            <h2 id="network-title" class="head-row__title" appSplit>Where NSRL operates</h2>
          </div>
          <p class="head-row__lead">
            A head office in Indore, seven branches, and the commercial centres NSRL serves. Choose a city to see what
            NSRL has there.
          </p>
        </div>
        <!-- The map is prerendered, but its code only loads once it scrolls into view. -->
        @defer (hydrate on viewport) {
          <app-network-section [filters]="false" />
        }
        <a class="go" routerLink="/network">Explore the full network</a>
      </div>
    </section>

    <section class="section section--concrete clients" aria-labelledby="clients-title">
      <div class="wrap head-row">
        <div>
          <p class="eyebrow">Clients</p>
          <h2 id="clients-title" class="head-row__title" appSplit>Companies NSRL works with</h2>
        </div>
        <p class="head-row__lead">
          The client list on record includes some of the best-known names in Indian consumer goods, electronics and
          retail.
        </p>
      </div>
      @defer (hydrate on viewport) {
        <app-client-logo-section class="clients__band" />
      }
      <div class="wrap">
        <a class="go" routerLink="/clients">See our clients</a>
      </div>
    </section>

    <section class="section section--asphalt on-dark" aria-labelledby="history-title">
      <div class="wrap stack" style="--stack: 3.5rem">
        <div>
          <p class="eyebrow">History</p>
          <h2 id="history-title" class="head-row__title" appSplit>How NSRL got here</h2>
        </div>
        @defer (hydrate on viewport) {
          <app-history />
        }
      </div>
    </section>

    @defer (hydrate on viewport) {
      <app-cta-section />
    }
  `,
  styles: `
    .intro__grid {
      align-items: center;
    }
    .intro__copy h2 {
      margin: 1.25rem 0 1.75rem;
      max-width: 15ch;
    }
    .intro__copy .prose {
      margin-bottom: 1.75rem;
    }
    .intro__figure {
      width: 100%;
    }
    .intro__frame {
      position: relative;
      overflow: hidden;
      aspect-ratio: 4 / 5;
      max-height: 40rem;
      box-shadow: var(--depth-shadow);
    }
    .intro__frame img {
      width: 100%;
      height: 114%;
      margin-top: -7%;
      object-fit: cover;
    }
    .intro__frame::after {
      content: '';
      position: absolute;
      inset: auto 0 0;
      height: 6px;
      background: repeating-linear-gradient(90deg, var(--marking) 0 2.6rem, transparent 2.6rem 5rem);
    }
    .intro__figure figcaption {
      margin-top: 0.75rem;
    }
    @media (max-width: 59.99rem) {
      .intro__frame {
        aspect-ratio: 4 / 3;
      }
    }

    .figures {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0 var(--gutter);
      margin-top: clamp(3.5rem, 2.5rem + 4vw, 6rem);
    }
    .figure {
      display: flex;
      flex-direction: column;
      padding-block: 1.25rem 1.5rem;
      border-top: 2px solid var(--ink);
    }
    .figure dt {
      order: 2;
      margin-top: 0.4rem;
      font-weight: 700;
    }
    .figure__n {
      display: block;
      font-stretch: 74%;
      font-weight: 800;
      font-size: var(--step-5);
      line-height: 0.9;
      letter-spacing: -0.03em;
      color: var(--red);
      font-variant-numeric: tabular-nums;
    }
    .figure__note {
      order: 3;
      margin-top: 0.25rem;
      font-size: var(--step--1);
      color: var(--muted);
    }
    @media (min-width: 60rem) {
      .figures {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    .head-row {
      display: grid;
      gap: 1.25rem var(--gutter);
      align-items: end;
    }
    .head-row__title {
      margin-top: 1.25rem;
      max-width: 14ch;
    }
    .head-row__lead {
      max-width: 44ch;
      font-size: var(--step-1);
      line-height: 1.45;
    }
    .on-dark .head-row__lead {
      color: var(--muted-on-dark);
    }
    @media (min-width: 60rem) {
      .head-row {
        grid-template-columns: 1fr 1fr;
      }
    }

    .clients__band {
      margin-block: clamp(2.5rem, 2rem + 2vw, 3.5rem) 2rem;
    }
  `,
})
export class HomePage {
  protected readonly services = SERVICES;
  protected readonly photo = IMAGES.intro;
  protected readonly figures = [
    { value: 1, label: 'Head office', note: 'Dewas Naka, Indore' },
    { value: CITIES.filter((c) => c.branch && !c.headOffice).length, label: 'Branch cities', note: 'West, central and north India' },
    { value: CITIES.filter((c) => c.served).length, label: 'Cities served', note: 'Listed on nsrl.in' },
    { value: SERVICES.length, label: 'Services', note: 'Transport, supply chain, 3PL' },
  ];
}
