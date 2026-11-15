import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import india from '@svg-maps/india';
import { CITIES, City, SITE } from '../core/site.config';

type Filter = 'all' | 'office' | 'served';

/**
 * Interactive coverage map. Offices (head office and branches) and cities
 * served are drawn as two distinct marker types, and the same split is
 * carried by the kilometre-stone buttons beside the map. City positions are
 * city-level and indicative; no street addresses are implied for branches.
 */
@Component({
  selector: 'app-network-section',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="network">
      <figure class="map">
        <svg [attr.viewBox]="map.viewBox" role="group" aria-label="Map of India showing NSRL offices and cities served">
          <g class="map__land" aria-hidden="true">
            @for (s of map.locations; track s.id) {
              <path [attr.d]="s.path" />
            }
          </g>
          @for (c of cities; track c.id) {
            <g
              class="pin"
              [class.pin--served]="!c.branch"
              [class.pin--hq]="c.headOffice"
              [class.is-active]="active().id === c.id"
              [class.is-dim]="!matches(c)"
              (click)="select(c)"
            >
              <circle class="pin__hit" [attr.cx]="c.x" [attr.cy]="c.y" r="16" />
              @if (c.headOffice) {
                <circle class="pin__ring" [attr.cx]="c.x" [attr.cy]="c.y" r="11" />
              }
              <circle class="pin__dot" [attr.cx]="c.x" [attr.cy]="c.y" [attr.r]="c.headOffice ? 6.5 : 5" />
            </g>
          }
          <text
            class="map__label"
            aria-hidden="true"
            [attr.x]="active().x + 13"
            [attr.y]="active().y + 5"
          >
            {{ active().name }}
          </text>
        </svg>
        <figcaption class="small muted">
          Indicative city positions, not to scale. Map outline: &#64;svg-maps/india, CC BY 4.0.
        </figcaption>
      </figure>

      <div class="side">
        @if (filters()) {
          <div class="filters" role="group" aria-label="Show">
            @for (f of filterOptions; track f.id) {
              <button type="button" class="filter" [attr.aria-pressed]="filter() === f.id" (click)="filter.set(f.id)">
                {{ f.label }}
              </button>
            }
          </div>
        }

        <ul class="stones">
          @for (c of visible(); track c.id) {
            <li>
              <button
                type="button"
                class="stone"
                [class.stone--served]="!c.branch"
                [class.is-active]="active().id === c.id"
                [attr.aria-pressed]="active().id === c.id"
                (click)="select(c)"
              >
                <span class="stone__cap">{{ c.name }}</span>
                <span class="stone__body">{{ kind(c) }}</span>
              </button>
            </li>
          }
        </ul>

        <div class="detail" aria-live="polite">
          <h3 class="detail__name">{{ active().name }}</h3>
          <p>{{ describe(active()) }}</p>
          <p class="small muted">
            For local contact details, call the head office on
            <a class="text-link" [href]="'tel:' + phone.tel">{{ phone.display }}</a
            >.
          </p>
        </div>

        <ul class="legend small">
          <li><span class="key key--office"></span>Head office and branches</li>
          <li><span class="key key--served"></span>Cities served</li>
        </ul>
      </div>
    </div>
  `,
  styles: `
    :host-context(.section--concrete) {
      --land: var(--paper);
      --land-edge: var(--concrete-2);
    }
    .network {
      display: grid;
      gap: 2rem var(--gutter);
      align-items: start;
    }
    .map svg {
      width: 100%;
      height: auto;
      max-height: 44rem;
      overflow: visible;
    }
    .map__land path {
      fill: var(--land, var(--concrete));
      stroke: var(--land-edge, var(--paper));
      stroke-width: 0.9;
    }
    .pin {
      cursor: pointer;
      transition: opacity 0.3s;
    }
    .pin__hit {
      fill: transparent;
    }
    .pin__dot {
      fill: var(--signal);
      stroke: var(--ink);
      stroke-width: 2;
      transition: r 0.25s var(--ease);
    }
    .pin--served .pin__dot {
      fill: var(--sign);
      stroke: var(--paper);
    }
    .pin__ring {
      fill: none;
      stroke: var(--ink);
      stroke-width: 1.5;
    }
    .pin.is-dim {
      opacity: 0.2;
    }
    .pin.is-active .pin__dot {
      r: 8.5px;
    }
    .map__label {
      font-stretch: 78%;
      font-weight: 750;
      font-size: 17px;
      fill: var(--ink);
      stroke: var(--paper);
      stroke-width: 5px;
      paint-order: stroke;
      stroke-linejoin: round;
      pointer-events: none;
    }
    figcaption {
      margin-top: 0.75rem;
    }

    .filters {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
    }
    .filter {
      min-height: 2.75rem;
      padding: 0.4rem 1rem;
      border: 2px solid var(--ink);
      border-radius: 3px;
      background: transparent;
      font-weight: 600;
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
    }
    .filter[aria-pressed='true'] {
      background: var(--ink);
      color: var(--paper);
    }

    .stones {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(6.9rem, 1fr));
      gap: 0.75rem;
    }
    .stone {
      width: 100%;
      min-width: 0;
      padding: 0;
      cursor: pointer;
      transition: transform 0.25s var(--ease), box-shadow 0.25s var(--ease);
    }
    .stone:hover,
    .stone.is-active {
      transform: translateY(-4px);
      box-shadow: 0 4px 0 var(--ink);
    }

    .detail {
      margin-top: 1.75rem;
      padding-top: 1.25rem;
      border-top: 2px solid var(--ink);
    }
    .detail__name {
      margin-bottom: 0.35rem;
    }
    .detail .small {
      margin-top: 0.5rem;
    }
    .legend {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem 1.5rem;
      margin-top: 1.5rem;
    }
    .legend li {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .key {
      width: 0.95rem;
      height: 0.95rem;
      border-radius: 50%;
      border: 2px solid var(--ink);
      background: var(--signal);
    }
    .key--served {
      background: var(--sign);
    }

    @media (min-width: 60rem) {
      .network {
        grid-template-columns: minmax(0, 6fr) minmax(0, 5fr);
      }
      .side {
        padding-top: 1rem;
      }
    }
  `,
})
export class NetworkSectionComponent {
  readonly filters = input(true);

  protected readonly map = india;
  protected readonly cities = CITIES;
  protected readonly phone = SITE.phones[0];
  protected readonly filterOptions: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All locations' },
    { id: 'office', label: 'Offices' },
    { id: 'served', label: 'Cities served' },
  ];

  protected readonly filter = signal<Filter>('all');
  private readonly activeId = signal('indore');
  protected readonly active = computed(() => CITIES.find((c) => c.id === this.activeId())!);
  protected readonly visible = computed(() => CITIES.filter((c) => this.matches(c)));

  protected matches(c: City): boolean {
    const f = this.filter();
    return f === 'all' || (f === 'office' ? c.branch : c.served);
  }

  protected select(c: City): void {
    this.activeId.set(c.id);
  }

  protected kind(c: City): string {
    if (c.headOffice) return 'Head office';
    return c.branch ? 'Branch' : 'City served';
  }

  protected describe(c: City): string {
    if (c.headOffice) return `Head office, at ${SITE.address.street}. Indore is also one of the cities NSRL serves.`;
    if (c.branch && c.served) return `NSRL has a branch in ${c.name}, and it is one of the cities NSRL serves.`;
    if (c.branch) return `NSRL has a branch in ${c.name}.`;
    return `${c.name} is one of the cities NSRL serves.`;
  }
}
