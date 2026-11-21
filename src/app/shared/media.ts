import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IMAGES, ImageKey } from '../core/site.config';
import { ParallaxDirective } from './parallax.directive';

/**
 * A photography slot. Renders the configured photo when one exists in
 * site.config IMAGES (responsive, with a slow scroll parallax); otherwise
 * draws a carriageway seen from above so layouts hold their shape until
 * licensed photography is supplied. A drawing never stands in for a photo of
 * the company.
 */
@Component({
  selector: 'app-media',
  imports: [ParallaxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.aspect-ratio]': 'ratio()' },
  template: `
    @if (photo(); as p) {
      <img
        appParallax
        [speed]="-0.08"
        [src]="p.src"
        [attr.srcset]="p.srcset ?? null"
        [attr.sizes]="p.srcset ? sizes() : null"
        [width]="p.width"
        [height]="p.height"
        [alt]="alt()"
        [attr.loading]="priority() ? 'eager' : 'lazy'"
        [attr.fetchpriority]="priority() ? 'high' : null"
        decoding="async"
      />
    } @else {
      <div class="plate" aria-hidden="true" [style.--tilt]="tilt() + 'deg'">
        <div class="plate__road"></div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
      position: relative;
      overflow: hidden;
      background: var(--asphalt-2);
    }
    img {
      width: 100%;
      height: 110%;
      margin-top: -5%;
      object-fit: cover;
    }
    .plate {
      position: absolute;
      inset: 0;
      background:
        radial-gradient(120% 90% at 20% 10%, rgb(255 255 255 / 0.06), transparent 60%),
        var(--asphalt-2);
    }
    /* Carriageway seen from above: two white edge lines and a broken yellow centre line. */
    .plate__road {
      position: absolute;
      left: -50%;
      top: 50%;
      width: 200%;
      height: clamp(7rem, 42%, 16rem);
      transform: translateY(-50%) rotate(var(--tilt, -16deg));
      background: var(--asphalt);
      border-block: 5px solid rgb(255 255 255 / 0.82);
    }
    .plate__road::before {
      content: '';
      position: absolute;
      left: 0;
      right: 0;
      top: calc(50% - 3px);
      height: 6px;
      background: repeating-linear-gradient(90deg, var(--marking) 0 3.25rem, transparent 3.25rem 6.5rem);
    }
  `,
})
export class MediaComponent {
  readonly image = input.required<ImageKey>();
  readonly alt = input('');
  readonly ratio = input<string | null>(null);
  readonly priority = input(false);
  readonly tilt = input(-16);
  readonly sizes = input('(min-width: 60rem) 40vw, 92vw');
  protected readonly photo = computed(() => IMAGES[this.image()]);
}
