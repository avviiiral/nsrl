import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { IMAGES, ImageKey } from '../core/site.config';
import { ParallaxDirective } from './parallax.directive';

/**
 * Opening for inner pages. Dark, like the homepage, so the header reads the
 * same everywhere. Behind the title, a carriageway drawn as a real CSS 3D
 * plane recedes toward the horizon; where the page has a company photograph,
 * the photograph is shown instead.
 */
@Component({
  selector: 'app-hero',
  imports: [ParallaxDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'on-dark', 'data-hero': '', '[class.has-photo]': '!!photo()' },
  template: `
    <div class="scene" aria-hidden="true">
      <div class="scene__stripes stripes"></div>
      @if (!photo()) {
        <div class="scene__road"><div class="scene__plane"></div></div>
      }
    </div>
    <div class="wrap hero__inner">
      <div class="hero__copy">
        @if (eyebrow(); as e) {
          <p class="eyebrow">{{ e }}</p>
        }
        <h1 class="hero__title">{{ title() }}</h1>
        @if (lead(); as l) {
          <p class="hero__lead">{{ l }}</p>
        }
        <div class="hero__actions btn-row"><ng-content /></div>
      </div>
      @if (photo(); as p) {
        <figure class="hero__photo">
          <img
            appParallax
            [speed]="-0.12"
            [src]="p.src"
            [attr.srcset]="p.srcset ?? null"
            sizes="(min-width: 60rem) 34vw, 90vw"
            [width]="p.width"
            [height]="p.height"
            [alt]="imageAlt()"
            fetchpriority="high"
          />
        </figure>
      }
    </div>
  `,
  styleUrl: './hero.scss',
})
export class HeroComponent {
  readonly title = input.required<string>();
  readonly lead = input<string>();
  readonly eyebrow = input<string>();
  /** Kept for existing call sites; only slots with a real photograph render one. */
  readonly sign = input<string>();
  readonly image = input<ImageKey | null>(null);
  readonly imageAlt = input('');
  readonly size = input<'home' | 'page'>('page');
  protected readonly photo = computed(() => {
    const key = this.image();
    return key ? IMAGES[key] : null;
  });
}
