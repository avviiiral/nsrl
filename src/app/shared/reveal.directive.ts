import { Directive, ElementRef, PLATFORM_ID, afterNextRender, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

let observer: IntersectionObserver | null = null;

function sharedObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          observer!.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
  );
  return observer;
}

/**
 * Scroll-triggered reveal. `appReveal` fades content up; `appReveal="wipe"`
 * uncovers an image. Content is visible by default (no JS, prerender, reduced
 * motion); the hidden start state only applies once the directive has armed it.
 */
@Directive({ selector: '[appReveal]', host: { '[attr.data-reveal]': 'appReveal() || "rise"' } })
export class RevealDirective {
  readonly appReveal = input<'' | 'rise' | 'wipe'>('');
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    afterNextRender(() => {
      const node = this.el.nativeElement;
      const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (reduce || !('IntersectionObserver' in window)) return;
      // Already on screen at load: leave it alone rather than flashing it out and in.
      if (node.getBoundingClientRect().top < innerHeight * 0.9) return;
      node.classList.add('reveal-armed');
      sharedObserver().observe(node);
    });
  }
}
