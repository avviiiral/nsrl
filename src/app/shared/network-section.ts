import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, computed, inject, input, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CITIES, City, SITE } from '../core/site.config';
import { INDIA_MAP } from './india-map';
import { watchEntrance } from './in-view';

type Filter = 'all' | 'office' | 'served';

/**
 * Interactive coverage map. Offices (head office and branches) and cities
 * served are drawn as two distinct marker types, and the same split is
 * carried by the kilometre-stone buttons beside the map. City positions are
 * city-level and indicative; no street addresses are implied for branches.
 */
@Component({
  selector: 'app-network-section',
  host: { '[class.is-armed]': 'armed()', '[class.is-in]': 'inView()' },
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
          <g class="arcs" aria-hidden="true">
            @for (a of arcs; track a.id; let i = $index) {
              <path
                class="arc"
                [class.is-active]="active().id === a.id"
                [class.is-dim]="filter() === 'served'"
                [attr.d]="a.d"
                pathLength="1"
                [style.--i]="i"
              />
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
                <circle class="pin__pulse" [attr.cx]="c.x" [attr.cy]="c.y" r="11" />
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
          Lines join each branch to the Indore head office; they show how the network is organised, not specific
          freight lanes. City positions are indicative. Map outline: &#64;svg-maps/india, CC BY 4.0.
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
          <li><span class="key key--arc"></span>Branch linked to head office</li>
        </ul>
      </div>
    </div>
  `,
  styleUrl: './network-section.scss',
})
export class NetworkSectionComponent {
  readonly filters = input(true);

  protected readonly map = INDIA_MAP;
  protected readonly cities = CITIES;
  protected readonly phone = SITE.phones[0];
  protected readonly filterOptions: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All locations' },
    { id: 'office', label: 'Offices' },
    { id: 'served', label: 'Cities served' },
  ];

  /** Arcs draw in on first view; until armed (prerender, no JS, reduced motion) they are simply shown. */
  protected readonly armed = signal(false);
  protected readonly inView = signal(false);

  /** One gentle arc from the head office to each branch, bowed to the north-west. */
  protected readonly arcs = (() => {
    const hq = CITIES.find((c) => c.headOffice)!;
    return CITIES.filter((c) => c.branch && !c.headOffice).map((c) => {
      const mx = (hq.x + c.x) / 2;
      const my = (hq.y + c.y) / 2;
      const dx = c.x - hq.x;
      const dy = c.y - hq.y;
      const bow = 0.22;
      return { id: c.id, d: `M${hq.x} ${hq.y}Q${(mx - dy * bow).toFixed(1)} ${(my + dx * bow).toFixed(1)} ${c.x} ${c.y}` };
    });
  })();

  protected readonly filter = signal<Filter>('all');
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
      // Already on screen when the code arrives: leave it drawn rather than redraw it.
      const stop = watchEntrance(
        this.host.nativeElement,
        () => this.armed.set(true),
        () => this.inView.set(true),
        0.25,
      );
      destroyRef.onDestroy(stop);
    });
  }
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
