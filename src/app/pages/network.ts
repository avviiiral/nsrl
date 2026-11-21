import { ChangeDetectionStrategy, Component } from '@angular/core';
import { CITIES } from '../core/site.config';
import { CtaSectionComponent } from '../shared/cta-section';
import { HeroComponent } from '../shared/hero';
import { NetworkSectionComponent } from '../shared/network-section';
import { RevealDirective } from '../shared/reveal.directive';
import { SectionHeadingComponent } from '../shared/section-heading';

@Component({
  selector: 'app-network-page',
  imports: [HeroComponent, NetworkSectionComponent, SectionHeadingComponent, CtaSectionComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero
      eyebrow="Our network"
      title="Indore at the centre, branches in seven cities."
      lead="Where NSRL has its own offices, and the cities it serves."
    />

    <section class="section section--asphalt on-dark">
      <div class="wrap stack" style="--stack: 2.5rem">
        <app-section-heading
          title="Explore the network"
          lead="Red marks an NSRL office. A white ring marks a city served. Choose any location for details."
        />
        @defer (hydrate on viewport) {
          <app-network-section />
        }
      </div>
    </section>

    <section class="section">
      <div class="wrap grid">
        <div class="col-6" appReveal>
          <h2 class="h3">Offices</h2>
          <p class="muted lists__note">Head office and branches staffed by NSRL.</p>
          <ul class="names">
            @for (c of offices; track c.id) {
              <li>
                {{ c.name }}
                @if (c.headOffice) {
                  <span class="tag">Head office</span>
                }
              </li>
            }
          </ul>
        </div>
        <div class="col-6" appReveal [style.--reveal-delay]="'120ms'">
          <h2 class="h3">Cities served</h2>
          <p class="muted lists__note">Commercial centres NSRL moves goods to and from.</p>
          <ul class="names">
            @for (c of served; track c.id) {
              <li>{{ c.name }}</li>
            }
          </ul>
        </div>
      </div>
    </section>

    @defer (hydrate on viewport) {

      <app-cta-section title="Shipping to or from one of these cities?" />

    }
  `,
  styles: `
    .lists__note {
      margin: 0.4rem 0 1.25rem;
    }
    .names li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding-block: 0.7rem;
      border-top: 1px solid var(--ink);
      font-stretch: 78%;
      font-weight: 750;
      font-size: var(--step-2);
      line-height: 1.1;
    }
    .names li:first-child {
      border-top-width: 2px;
    }
    .tag {
      padding: 0.25rem 0.6rem;
      background: var(--red);
      color: var(--paper);
      border: 0;
      border-radius: 3px;
      font-stretch: 100%;
      font-size: var(--step--1);
      font-weight: 650;
      white-space: nowrap;
    }
  `,
})
export class NetworkPage {
  protected readonly offices = CITIES.filter((c) => c.branch);
  protected readonly served = CITIES.filter((c) => c.served);
}
