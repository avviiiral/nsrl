import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SERVICES, SITE } from '../core/site.config';
import { ClientLogoSectionComponent } from '../shared/client-logo-section';
import { CtaSectionComponent } from '../shared/cta-section';
import { HeroComponent } from '../shared/hero';
import { HistoryComponent } from '../shared/history';
import { MediaComponent } from '../shared/media';
import { NetworkSectionComponent } from '../shared/network-section';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionHeadingComponent } from '../shared/section-heading';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    HeroComponent,
    MediaComponent,
    SectionHeadingComponent,
    ClientLogoSectionComponent,
    NetworkSectionComponent,
    HistoryComponent,
    CtaSectionComponent,
    RevealDirective,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero
      size="home"
      image="hero"
      imageAlt="NSRL trucks on an Indian highway"
      [sign]="site.tagline"
      title="Road freight, supply chain and 3PL, run from the centre of India."
      lead="North South Roadlines moves goods for manufacturers and brands from its base in Indore."
    >
      <a class="btn btn--signal" routerLink="/services">Explore our services</a>
      <a class="btn btn--ghost" routerLink="/enquiry">Request an enquiry</a>
    </app-hero>

    <section class="section">
      <div class="wrap grid intro">
        <div class="col-7 stack">
          <h2>A logistics company built on the road out of Indore.</h2>
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
          <p><a class="text-link" routerLink="/about">Read the company story</a></p>
        </div>
        <app-media class="col-5 zoom intro__media" appReveal="wipe" image="intro" alt="Loading operation at an NSRL site" ratio="4 / 5" [tilt]="-58" />
      </div>
    </section>

    <section class="section section--asphalt on-dark">
      <div class="wrap">
        <app-section-heading title="Three services, one operator." />
        <ul class="services">
          @for (s of services; track s.id) {
            <li>
              <a class="service-row" routerLink="/services" [fragment]="s.id">
                <h3 class="service-row__name">{{ s.name }}</h3>
                <p class="service-row__text">{{ s.summary }}</p>
                <span class="service-row__go">View service</span>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>

    <section class="section">
      <div class="wrap grid">
        <app-section-heading class="col-4" title="Why companies choose NSRL" />
        <dl class="col-8 why">
          @for (w of why; track w.term) {
            <div class="why__row" appReveal>
              <dt class="h3">{{ w.term }}</dt>
              <dd>{{ w.text }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>

    <section class="section section--concrete">
      <div class="wrap stack" style="--stack: 2.5rem">
        <app-section-heading
          title="Companies NSRL works with"
          lead="The client list on record includes some of the best-known names in Indian consumer goods, electronics and retail."
        />
        <app-client-logo-section />
        <p><a class="text-link" routerLink="/clients">See our clients</a></p>
      </div>
    </section>

    <section class="section">
      <div class="wrap stack" style="--stack: 2.5rem">
        <app-section-heading
          title="Where NSRL operates"
          lead="A head office in Indore, seven branches, and the commercial centres we serve. Choose a city to see what NSRL has there."
        />
        <!-- The map is prerendered, but its code only loads once it scrolls into view. -->
        @defer (hydrate on viewport) {
          <app-network-section [filters]="false" />
        }
        <p><a class="text-link" routerLink="/network">Explore the full network</a></p>
      </div>
    </section>

    <section class="section section--asphalt on-dark">
      <div class="wrap stack" style="--stack: 3rem">
        <app-section-heading title="How NSRL got here" />
        <app-history />
      </div>
    </section>

    <app-cta-section />
  `,
  styles: `
    .intro {
      align-items: center;
    }
    .intro h2 {
      max-width: 17ch;
    }
    .intro__media {
      max-height: 34rem;
      width: 100%;
    }
    @media (max-width: 59.99rem) {
      .intro__media {
        aspect-ratio: 16 / 10 !important;
      }
    }

    .services {
      margin-top: clamp(2rem, 1.5rem + 2vw, 3.5rem);
      border-top: 2px solid var(--paper);
    }
    .service-row {
      position: relative;
      display: grid;
      gap: 0.6rem 2rem;
      padding-block: clamp(1.5rem, 1.2rem + 1.5vw, 2.5rem);
      border-bottom: 1px solid rgb(255 255 255 / 0.25);
      text-decoration: none;
    }
    /* A solid yellow line overtakes the rule on hover. */
    .service-row::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -1px;
      width: 100%;
      height: 4px;
      background: var(--signal);
      transform: scaleX(0);
      transform-origin: left;
      transition: transform 0.5s var(--ease);
    }
    .service-row:hover::after,
    .service-row:focus-visible::after {
      transform: scaleX(1);
    }
    .service-row__text {
      color: var(--muted-on-dark);
      max-width: 44ch;
    }
    .service-row__go {
      font-weight: 650;
      text-decoration: underline;
      text-decoration-color: var(--signal);
      text-decoration-thickness: 2px;
      text-underline-offset: 0.25em;
    }
    @media (min-width: 60rem) {
      .service-row {
        grid-template-columns: 5fr 5fr auto;
        align-items: baseline;
      }
    }

    .why__row {
      display: grid;
      gap: 0.5rem 2rem;
      padding-block: 1.5rem;
      border-top: 2px solid var(--ink);
    }
    .why__row dd {
      max-width: 48ch;
    }
    @media (min-width: 44rem) {
      .why__row {
        grid-template-columns: 2fr 3fr;
      }
    }
  `,
})
export class HomePage {
  protected readonly site = SITE;
  protected readonly services = SERVICES;
  protected readonly why = [
    {
      term: 'An established operator',
      text: 'NSRL has worked under the line “Trucking value since 1994”. This is a long-running road logistics business, not a new entrant.',
    },
    {
      term: 'Run from Indore',
      text: 'The head office at Dewas Naka, Indore, plans and controls the work from the middle of the country.',
    },
    {
      term: 'Branches where you ship',
      text: 'Ahmedabad, Pune, Mumbai, Gurgaon, Chandigarh, Raipur and Bhopal each have an NSRL branch.',
    },
    {
      term: 'Known clients',
      text: 'Britannia, Bisleri, Samsung, Nilkamal, TATA and DMart are on the NSRL client list.',
    },
    {
      term: 'More than a truck',
      text: 'The business has expanded from transportation into supply chain management and third-party logistics.',
    },
  ];
}
