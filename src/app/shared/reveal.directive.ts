import { DestroyRef, Directive, ElementRef, PLATFORM_ID, afterNextRender, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { watchEntrance } from './in-view';

/**
 * Scroll-triggered reveal. `appReveal` fades content up; `appReveal="wipe"`
 * uncovers an image. Content is visible by default (no JS, prerender, reduced
 * motion, already on screen); the hidden start state only applies once the
 * directive has armed an element that starts below the fold.
 */
@Directive({ selector: '[appReveal]', host: { '[attr.data-reveal]': 'appReveal() || "rise"' } })
export class RevealDirective {
  readonly appReveal = input<'' | 'rise' | 'wipe'>('');
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const node = this.el.nativeElement;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
      const stop = watchEntrance(
        node,
        () => node.classList.add('reveal-armed'),
        () => node.classList.add('is-in'),
        0.1,
      );
      destroyRef.onDestroy(stop);
    });
  }
}
