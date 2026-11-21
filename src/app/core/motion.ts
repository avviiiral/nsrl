import { DOCUMENT, Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { gsap as Gsap } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

export interface MotionKit {
  gsap: typeof Gsap;
  ScrollTrigger: typeof ScrollTriggerType;
}

/**
 * Single entry point for scroll-linked animation.
 *
 * GSAP and ScrollTrigger are imported on demand, once, and only in the
 * browser, so they never sit in the initial bundle or run during prerender.
 * Callers receive `null` when motion should not run (server, reduced motion),
 * and must leave content in its readable, static state in that case.
 */
@Injectable({ providedIn: 'root' })
export class MotionService {
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly doc = inject(DOCUMENT);
  private kit: Promise<MotionKit> | null = null;

  get reducedMotion(): boolean {
    if (!this.browser) return true;
    return this.doc.defaultView!.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /** True on devices with a precise, hover-capable pointer (mouse, trackpad). */
  get finePointer(): boolean {
    if (!this.browser) return false;
    return this.doc.defaultView!.matchMedia('(hover: hover) and (pointer: fine)').matches;
  }

  /**
   * Loads GSAP + ScrollTrigger, or resolves `null` when motion is off.
   *
   * Scroll animation only matters once the reader moves, so the import waits
   * for the first sign of intent (scroll, wheel, touch, key, pointer) after the
   * page has loaded, and otherwise for a long idle period. First paint,
   * hydration and the first interaction never compete with it.
   */
  async load(): Promise<MotionKit | null> {
    if (!this.browser || this.reducedMotion) return null;
    this.kit ??= this.intent().then(() => Promise.all([import('gsap'), import('gsap/ScrollTrigger')])).then(([g, st]) => {
      g.gsap.registerPlugin(st.ScrollTrigger);
      // Mobile browsers resize the viewport as the URL bar shows and hides; ignore that.
      st.ScrollTrigger.config({ ignoreMobileResize: true });
      return { gsap: g.gsap, ScrollTrigger: st.ScrollTrigger };
    });
    return this.kit;
  }

  private intent(): Promise<void> {
    const win = this.doc.defaultView!;
    const events = ['scroll', 'wheel', 'touchstart', 'pointerdown', 'pointermove', 'keydown'] as const;
    const loaded = this.doc.readyState === 'complete' ? Promise.resolve() : new Promise<void>((r) => win.addEventListener('load', () => r(), { once: true }));
    // Already scrolled (e.g. a restored position or an anchor link): start now.
    if (win.scrollY > 0) return loaded;
    return loaded.then(
      () =>
        new Promise<void>((resolve) => {
          let done = false;
          const go = () => {
            if (done) return;
            done = true;
            events.forEach((e) => win.removeEventListener(e, go));
            clearTimeout(timer);
            // Let the interaction that woke us paint first.
            if (typeof win.requestIdleCallback === 'function') win.requestIdleCallback(() => resolve(), { timeout: 300 });
            else setTimeout(resolve, 50);
          };
          events.forEach((e) => win.addEventListener(e, go, { passive: true }));
          const timer = setTimeout(go, 9000);
        }),
    );
  }

  /** Re-measure every trigger, e.g. after fonts or images change layout. */
  refresh(): void {
    void this.kit?.then((k) => k.ScrollTrigger.refresh());
  }
}
