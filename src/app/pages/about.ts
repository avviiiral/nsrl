import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CITIES, SERVICES, SITE } from '../core/site.config';
import { CtaSectionComponent } from '../shared/cta-section';
import { HeroComponent } from '../shared/hero';
import { HistoryComponent } from '../shared/history';
import { MediaComponent } from '../shared/media';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionHeadingComponent } from '../shared/section-heading';
import { SplitDirective } from '../shared/split.directive';

@Component({
  selector: 'app-about-page',
  imports: [RouterLink, HeroComponent, MediaComponent, SectionHeadingComponent, HistoryComponent, CtaSectionComponent, RevealDirective, SplitDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero
      eyebrow="About NSRL"
      title="A road logistics company from Indore."
      lead="North South Roadlines, known as NSRL, moves goods for Indian businesses and manages the logistics around them."
    />

    <section class="section">
      <div class="wrap grid">
        <div class="col-6 stack">
          <p class="eyebrow">The company</p>
          <h2 appSplit>Trucking first. Everything else followed from doing it well.</h2>
          <div class="prose">
            <p>
              North South Roadlines works in supply chain and logistics management, transportation and third-party
              logistics. The company’s line has long been “{{ site.tagline }}”, and road transport remains the centre
              of the business.
            </p>
            <p>
              NSRL started in Central India, where Airtel was its first logistics partner. From its head office in
              Indore it has built a branch network across western, central and northern India and widened its work from
              carrying goods to managing how they move.
            </p>
          </div>
        </div>
        <figure class="col-5 start-8 story__figure" appReveal="wipe">
          <app-media class="story__media" image="intro" alt="An NSRL goods carrier, its board lettered NSRL, at a loading dock" ratio="4 / 5" />
          <figcaption class="small muted">An NSRL goods carrier at a loading dock.</figcaption>
        </figure>
      </div>
    </section>

    <section class="section section--asphalt on-dark">
      <div class="wrap stack" style="--stack: 3rem">
        <p class="eyebrow">History</p>
        <app-section-heading title="Company history" lead="Three stages that took NSRL from a regional transporter to a 3PL provider." />
        @defer (hydrate on viewport) {
          <app-history />
        }
      </div>
    </section>

    <section class="section">
      <div class="wrap grid">
        <div class="col-4">
          <p class="eyebrow">On record</p>
          <app-section-heading class="particulars__head" title="Company particulars" lead="The facts on record about the business." />
        </div>
        <dl class="col-8 facts">
          @for (f of facts; track f.label) {
            <div>
              <dt>{{ f.label }}</dt>
              <dd>{{ f.value }}</dd>
            </div>
          }
        </dl>
      </div>
    </section>

    <section class="section section--concrete">
      <div class="wrap">
        <div class="grid purpose">
          <div class="col-6" appReveal>
            <h2 class="h3 purpose__label">Vision</h2>
            <p class="purpose__text display">To be the logistics partner Indian businesses rely on to move their goods by road.</p>
          </div>
          <div class="col-6" appReveal>
            <h2 class="h3 purpose__label">Mission</h2>
            <p class="purpose__text display">To move every consignment with care and accountability, and keep earning the trust of the companies we serve.</p>
          </div>
        </div>

        <div class="grid values">
          <app-section-heading class="col-4" [level]="3" title="Core values" />
          <dl class="col-8 values__list">
            @for (v of values; track v.term) {
              <div>
                <dt>{{ v.term }}</dt>
                <dd>{{ v.text }}</dd>
              </div>
            }
          </dl>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="wrap grid">
        <div class="col-5 stack">
          <p class="eyebrow">Expertise</p>
          <app-section-heading title="Logistics expertise" lead="Three areas of work, each grown out of the one before." />
          <p><a class="btn btn--red" routerLink="/services">Explore our services</a></p>
        </div>
        <ul class="col-6 start-7 expertise">
          @for (s of services; track s.id) {
            <li>
              <a routerLink="/services" [fragment]="s.id">
                <span class="expertise__num">0{{ $index + 1 }}</span>
                <h3>{{ s.name }}</h3>
                <p>{{ s.summary }}</p>
              </a>
            </li>
          }
        </ul>
      </div>
    </section>

    @defer (hydrate on viewport) {

      <app-cta-section title="Talk to the team in Indore." text="Call the head office or send an enquiry with your requirement." />

    }
  `,
  styles: `
    .story__figure {
      width: 100%;
    }
    .story__media {
      box-shadow: var(--depth-shadow);
      max-height: 38rem;
    }
    .story__figure figcaption {
      margin-top: 0.75rem;
    }
    .particulars__head {
      margin-top: 1.25rem;
    }
    .facts > div,
    .values__list > div {
      display: grid;
      gap: 0.25rem 2rem;
      padding-block: 1rem;
      border-top: 1px solid var(--ink);
    }
    .facts > div:first-child,
    .values__list > div:first-child {
      border-top-width: 2px;
    }
    .facts dt,
    .values__list dt {
      font-weight: 700;
    }
    @media (min-width: 40rem) {
      .facts > div,
      .values__list > div {
        grid-template-columns: 12rem 1fr;
      }
    }

    .purpose__label {
      display: inline-block;
      margin-bottom: 1rem;
      padding: 0.3rem 0.7rem;
      background: var(--red);
      color: var(--paper);
      font-size: var(--step-0);
      font-stretch: 86%;
      letter-spacing: 0;
      line-height: 1.3;
    }
    .purpose__text {
      font-size: var(--step-2);
      line-height: 1.12;
      max-width: 20ch;
    }
    .values {
      margin-top: var(--section);
    }

    .expertise li {
      border-top: 2px solid var(--ink);
    }
    .expertise li:last-child {
      border-bottom: 2px solid var(--ink);
    }
    .expertise a {
      display: grid;
      grid-template-columns: 2.5rem 1fr;
      padding-block: 1.4rem;
      text-decoration: none;
      transition:
        padding-left 0.4s var(--ease-out),
        background-color 0.4s var(--ease-out),
        color 0.3s;
    }
    .expertise a > :not(.expertise__num) {
      grid-column: 2;
    }
    .expertise__num {
      grid-row: span 2;
      padding-top: 0.3rem;
      font-size: 0.8rem;
      font-weight: 650;
      color: var(--red-deep);
      font-variant-numeric: tabular-nums;
    }
    .expertise a:hover,
    .expertise a:focus-visible {
      padding-left: 1rem;
      background: var(--asphalt);
      color: var(--paper);
    }
    .expertise a:hover .expertise__num,
    .expertise a:focus-visible .expertise__num {
      color: var(--red-glow);
    }
    .expertise p {
      margin-top: 0.4rem;
      max-width: 44ch;
      opacity: 0.8;
    }
  `,
})
export class AboutPage {
  protected readonly site = SITE;
  protected readonly services = SERVICES;
  protected readonly facts = [
    { label: 'Company name', value: SITE.name },
    { label: 'Brand', value: SITE.brand },
    { label: 'Business', value: SITE.business },
    { label: 'Head office', value: SITE.address.lines.join(', ') },
    { label: 'Branches', value: CITIES.filter((c) => c.branch && !c.headOffice).map((c) => c.name).join(', ') },
    { label: 'Cities served', value: CITIES.filter((c) => c.served).map((c) => c.name).join(', ') },
    ...SITE.ownership,
  ];
  /** Draft wording written for this site. It makes no factual claim but needs the company's approval. */
  protected readonly values = [
    { term: 'Reliability', text: 'We do what we said we would, when we said we would.' },
    { term: 'Accountability', text: 'One company answers for the consignment from pickup to delivery.' },
    { term: 'Care for the load', text: 'Our clients’ goods are handled as if their name were on our trucks.' },
    { term: 'Long relationships', text: 'We would rather keep a client for decades than win a contract for a season.' },
  ];
}
