import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CLIENTS } from '../core/site.config';
import { RevealDirective } from './reveal.directive';
import { TiltDirective } from './tilt.directive';

/**
 * Client portfolio, in two layouts:
 * - `band`: a slow horizontal gallery for the homepage (pauses on hover and
 *   focus, stops entirely with reduced motion);
 * - `wall`: large tiles for the clients page, with pointer tilt.
 *
 * Uses each brand's official logo file when one is configured; otherwise the
 * name is set in type. Logos are never redrawn or approximated.
 */
@Component({
  selector: 'app-client-logo-section',
  imports: [RevealDirective, TiltDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-wall]': 'view() === "wall"' },
  template: `
    @if (view() === 'band') {
      <div class="band">
        <ul class="band__track">
          @for (c of clients; track c.name) {
            <li class="band__item">
              @if (c.logo) {
                <img [src]="c.logo.src" [width]="c.logo.width" [height]="c.logo.height" [alt]="c.name" loading="lazy" decoding="async" />
              } @else {
                <span class="band__name">{{ c.name }}</span>
              }
            </li>
          }
        </ul>
        <!-- Second copy makes the loop seamless; hidden from assistive tech. -->
        <ul class="band__track" aria-hidden="true">
          @for (c of clients; track c.name) {
            <li class="band__item">
              @if (c.logo) {
                <img [src]="c.logo.src" [width]="c.logo.width" [height]="c.logo.height" alt="" loading="lazy" decoding="async" />
              } @else {
                <span class="band__name">{{ c.name }}</span>
              }
            </li>
          }
        </ul>
      </div>
    } @else {
      <ul class="wall">
        @for (c of clients; track c.name; let i = $index) {
          <li class="tile" appReveal [style.--reveal-delay]="i * 70 + 'ms'">
            <div class="tile__face" [appTilt]="5">
              @if (c.logo) {
                <img [src]="c.logo.src" [width]="c.logo.width" [height]="c.logo.height" [alt]="c.name" loading="lazy" decoding="async" />
              } @else {
                <span class="tile__name">{{ c.name }}</span>
              }
            </div>
            <span class="tile__caption" aria-hidden="true">{{ c.name }}</span>
          </li>
        }
      </ul>
    }
  `,
  styleUrl: './client-logo-section.scss',
})
export class ClientLogoSectionComponent {
  readonly layout = input<'band' | 'wall'>('band');
  /** Kept for existing call sites: `large` maps to the wall layout. */
  readonly size = input<'compact' | 'large'>('compact');
  protected readonly clients = CLIENTS;
  protected readonly view = computed(() => (this.size() === 'large' ? 'wall' : this.layout()));
}
