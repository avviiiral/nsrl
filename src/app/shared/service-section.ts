import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '../core/site.config';
import { RevealDirective } from './reveal.directive';
import { ServiceVisualComponent } from './service-visual';
import { SplitDirective } from './split.directive';
import { TiltDirective } from './tilt.directive';

/** One service, in full: its own diagram beside the verified description and benefits. */
@Component({
  selector: 'app-service-section',
  imports: [RouterLink, ServiceVisualComponent, RevealDirective, SplitDirective, TiltDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-flipped]': 'flip()', '[attr.id]': 'service().id' },
  template: `
    <div class="wrap service">
      <div class="service__media" appReveal>
        <div class="service__panel on-dark" [appTilt]="4">
          <span class="service__num" aria-hidden="true">0{{ index() + 1 }} / 03</span>
          <app-service-visual [kind]="service().id" />
        </div>
      </div>
      <div class="service__text">
        <p class="eyebrow">Service 0{{ index() + 1 }}</p>
        <h2 appSplit>{{ service().name }}</h2>
        <p class="lead">{{ service().summary }}</p>
        <div class="prose">
          @for (p of service().body; track p) {
            <p>{{ p }}</p>
          }
        </div>
        <h3 class="service__sub">What it means for your business</h3>
        <ul class="benefits">
          @for (b of service().benefits; track b; let i = $index) {
            <li appReveal [style.--reveal-delay]="i * 80 + 'ms'">{{ b }}</li>
          }
        </ul>
        <a class="btn btn--red" routerLink="/enquiry" [queryParams]="{ service: service().id }">
          Enquire about {{ service().short.toLowerCase() === '3pl' ? '3PL' : service().short.toLowerCase() }}
        </a>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding-block: calc(var(--section) * 0.7);
      scroll-margin-top: calc(var(--header-h) + 3.25rem);
    }
    :host(.is-flipped) {
      background: var(--concrete);
    }
    .service {
      display: grid;
      gap: 2.5rem var(--gutter);
      align-items: start;
    }
    .service__panel {
      position: relative;
      padding: clamp(1.5rem, 1rem + 3vw, 3.5rem);
      background: var(--asphalt);
      box-shadow: var(--depth-shadow);
    }
    .service__num {
      position: absolute;
      top: 1rem;
      left: 1.25rem;
      font-size: 0.75rem;
      font-weight: 650;
      letter-spacing: 0.14em;
      color: var(--muted-on-dark);
      font-variant-numeric: tabular-nums;
    }
    .service__text h2 {
      margin-top: 1.1rem;
      max-width: 14ch;
    }
    .lead {
      margin-top: 1.25rem;
      max-width: 34ch;
    }
    .prose {
      margin-top: 1.25rem;
    }
    .service__sub {
      margin-top: 2.25rem;
      font-size: var(--step-0);
      font-stretch: 100%;
      font-weight: 700;
      letter-spacing: 0;
      line-height: 1.4;
    }
    .benefits {
      margin: 0.75rem 0 2rem;
    }
    .benefits li {
      position: relative;
      padding: 0.7rem 0 0.7rem 2.5rem;
      border-bottom: 1px solid var(--concrete-2);
      max-width: 52ch;
    }
    :host(.is-flipped) .benefits li {
      border-color: rgb(21 25 27 / 0.14);
    }
    /* Each benefit is ticked off with one dash of the centre line. */
    .benefits li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 1.3em;
      width: 1.6rem;
      height: 4px;
      background: var(--red);
    }
    @media (min-width: 60rem) {
      .service {
        grid-template-columns: repeat(12, minmax(0, 1fr));
      }
      .service__media {
        grid-column: 1 / span 6;
        position: sticky;
        top: calc(var(--header-h) + 5rem);
      }
      .service__text {
        grid-column: 8 / span 5;
      }
      :host(.is-flipped) .service__media {
        grid-column: 7 / span 6;
        order: 2;
      }
      :host(.is-flipped) .service__text {
        grid-column: 1 / span 5;
        grid-row: 1;
      }
    }
  `,
})
export class ServiceSectionComponent {
  readonly service = input.required<Service>();
  readonly flip = input(false);
  readonly index = input(0);
}
