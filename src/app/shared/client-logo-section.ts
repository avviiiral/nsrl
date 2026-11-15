import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CLIENTS } from '../core/site.config';

/**
 * Client portfolio. Uses each brand's original logo file when one is
 * configured in site.config; otherwise sets the name in type. Brand logos are
 * never redrawn or approximated.
 */
@Component({
  selector: 'app-client-logo-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-large]': 'size() === "large"' },
  template: `
    <ul class="clients">
      @for (c of clients; track c.name) {
        <li class="client">
          @if (c.logo) {
            <img [src]="c.logo" [alt]="c.name" loading="lazy" />
          } @else {
            <span class="client__name">{{ c.name }}</span>
          }
        </li>
      }
    </ul>
  `,
  styles: `
    .clients {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      border-top: 2px solid currentColor;
      border-left: 2px solid currentColor;
    }
    .client {
      position: relative;
      display: grid;
      place-items: center;
      min-height: 6.5rem;
      padding: 1rem;
      border-right: 2px solid currentColor;
      border-bottom: 2px solid currentColor;
      transition: background-color 0.3s var(--ease), color 0.3s var(--ease);
    }
    :host(.is-large) .client {
      min-height: clamp(8rem, 5rem + 12vw, 14rem);
    }
    .client:hover {
      background: var(--signal);
      color: var(--ink);
    }
    .client__name {
      font-stretch: 78%;
      font-weight: 750;
      font-size: var(--step-2);
      line-height: 1;
      letter-spacing: -0.01em;
    }
    :host(.is-large) .client__name {
      font-size: var(--step-3);
    }
    img {
      max-height: 3.5rem;
      width: auto;
      filter: grayscale(1);
      transition: filter 0.3s;
    }
    :host(.is-large) img {
      max-height: 5rem;
    }
    .client:hover img {
      filter: none;
    }
    @media (min-width: 48rem) {
      .clients {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    @media (min-width: 72rem) {
      :host(:not(.is-large)) .clients {
        grid-template-columns: repeat(6, minmax(0, 1fr));
      }
    }
  `,
})
export class ClientLogoSectionComponent {
  readonly size = input<'compact' | 'large'>('compact');
  protected readonly clients = CLIENTS;
}
