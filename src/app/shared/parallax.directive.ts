import { DestroyRef, Directive, ElementRef, PLATFORM_ID, afterNextRender, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../core/motion';

/**
 * Scroll-linked depth. The element drifts against the scroll by `speed`
 * (a fraction of its own height) while its section crosses the viewport, so
 * foreground and background separate. GPU transform only; no layout work.
 */
@Directive({ selector: '[appParallax]' })
export class ParallaxDirective {
  /** Negative drifts up as you scroll down (sits further back); positive drifts down. */
  readonly speed = input(-0.15);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    let revert: (() => void) | null = null;
    destroyRef.onDestroy(() => revert?.());

    afterNextRender(async () => {
      const kit = await motion.load();
      if (!kit) return;
      const node = this.el.nativeElement;
      const trigger = node.parentElement ?? node;
      // Elements already on screen start from rest, so nothing jumps at load.
      const onScreen = trigger.getBoundingClientRect().top < innerHeight;
      const ctx = kit.gsap.context(() => {
        kit.gsap.fromTo(
          node,
          { yPercent: onScreen ? 0 : (-this.speed() * 100) / 2 },
          {
            yPercent: (this.speed() * 100) / (onScreen ? 1 : 2),
            ease: 'none',
            scrollTrigger: { trigger, start: onScreen ? 'top top' : 'top bottom', end: 'bottom top', scrub: true },
          },
        );
      });
      revert = () => ctx.revert();
    });
  }
}
