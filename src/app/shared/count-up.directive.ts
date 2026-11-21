import { DestroyRef, Directive, ElementRef, PLATFORM_ID, afterNextRender, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { watchEntrance } from './in-view';

/**
 * Counts a figure up from zero the first time it scrolls into view. Only use
 * it on numbers that are verified (here: counts of verified lists). The final
 * number is in the prerendered HTML; screen readers and reduced-motion users
 * only ever get that.
 */
@Directive({ selector: '[appCountUp]' })
export class CountUpDirective {
  readonly appCountUp = input.required<number>();
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);
    let raf = 0;
    afterNextRender(() => {
      const node = this.el.nativeElement;
      const target = this.appCountUp();
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
      const stop = watchEntrance(
        node,
        () => {
          node.setAttribute('aria-hidden', 'true');
          const label = document.createElement('span');
          label.className = 'visually-hidden';
          label.textContent = String(target);
          node.after(label);
          node.textContent = '0';
        },
        () => {
          const start = performance.now();
          const step = (now: number) => {
            const k = Math.min(1, (now - start) / 1100);
            node.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
            if (k < 1) raf = requestAnimationFrame(step);
          };
          raf = requestAnimationFrame(step);
        },
        0.6,
      );
      destroyRef.onDestroy(() => {
        stop();
        cancelAnimationFrame(raf);
      });
    });
  }
}
