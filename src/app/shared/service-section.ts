import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Service } from '../core/site.config';
import { MediaComponent } from './media';
import { RevealDirective } from './reveal.directive';

@Component({
  selector: 'app-service-section',
  imports: [RouterLink, MediaComponent, RevealDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-flipped]': 'flip()', '[attr.id]': 'service().id' },
  template: `
    <div class="wrap service">
      <app-media
        class="service__media zoom"
        appReveal="wipe"
        [image]="service().image"
        [alt]="service().name"
        ratio="4 / 3"
        [tilt]="flip() ? 12 : -12"
      />
      <div class="service__text">
        <h2>{{ service().name }}</h2>
        <p class="lead">{{ service().summary }}</p>
        <div class="prose">
          @for (p of service().body; track p) {
            <p>{{ p }}</p>
          }
        </div>
        <h3 class="service__sub">What it means for your business</h3>
        <ul class="benefits">
          @for (b of service().benefits; track b) {
            <li>{{ b }}</li>
          }
        </ul>
        <a class="btn" routerLink="/enquiry" [queryParams]="{ service: service().id }">
          Enquire about {{ service().short.toLowerCase() === '3pl' ? '3PL' : service().short.toLowerCase() }}
        </a>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
      padding-block: calc(var(--section) * 0.55);
    }
    :host(.is-flipped) {
      background: var(--concrete);
    }
    .service {
      display: grid;
      gap: 2rem var(--gutter);
      align-items: start;
    }
    .lead {
      margin-top: 1rem;
      max-width: 34ch;
    }
    .prose {
      margin-top: 1.25rem;
    }
    .service__sub {
      margin-top: 2rem;
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
      padding: 0.6rem 0 0.6rem 2.5rem;
      border-bottom: 1px solid var(--concrete-2);
      max-width: 52ch;
    }
    :host(.is-flipped) .benefits li {
      border-color: rgb(21 25 27 / 0.18);
    }
    /* Each benefit is ticked off with one dash of the centre line. */
    .benefits li::before {
      content: '';
      position: absolute;
      left: 0;
      top: 1.25em;
      width: 1.6rem;
      height: 5px;
      background: var(--signal);
      outline: 1px solid rgb(21 25 27 / 0.25);
    }
    @media (min-width: 60rem) {
      .service {
        grid-template-columns: repeat(12, minmax(0, 1fr));
      }
      .service__media {
        grid-column: 1 / span 6;
        position: sticky;
        top: calc(var(--header-h) + 2rem);
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
}
