import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MotionService } from '../core/motion';
import { SERVICES } from '../core/site.config';
import { ServiceVisualComponent } from './service-visual';
import { SplitDirective } from './split.directive';

/**
 * The three services as a horizontal journey. On wide screens with motion
 * allowed, the section pins and vertical scrolling drives the panels
 * sideways. Everywhere else it is an ordinary grid or stack, which is also
 * what prerenders and what shows before the animation code arrives.
 */
@Component({
  selector: 'app-services-rail',
  imports: [RouterLink, ServiceVisualComponent, SplitDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'on-dark', '[class.is-pinned]': 'pinned()' },
  templateUrl: './services-rail.html',
  styleUrl: './services-rail.scss',
})
export class ServicesRailComponent {
  protected readonly services = SERVICES;
  protected readonly pinned = signal(false);
  protected readonly progress = signal(0);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    let cleanup: (() => void) | null = null;
    destroyRef.onDestroy(() => cleanup?.());

    afterNextRender(async () => {
      const kit = await motion.load();
      if (!kit) return;
      const { gsap, ScrollTrigger } = kit;
      const root = this.host.nativeElement;
      const mm = gsap.matchMedia();

      mm.add('(min-width: 64rem)', () => {
        this.pinned.set(true);
        const pin = root.querySelector<HTMLElement>('.rail__pin')!;
        const track = root.querySelector<HTMLElement>('.rail__track')!;
        const distance = () => Math.max(0, track.scrollWidth - pin.clientWidth);

        const tween = gsap.to(track, {
          x: () => -distance(),
          ease: 'none',
          scrollTrigger: {
            trigger: pin,
            start: 'top top',
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onUpdate: (self) => this.progress.set(self.progress),
          },
        });

        // Keyboard users: focusing a link in an off-screen panel scrolls the page to that panel.
        const onFocus = (e: FocusEvent) => {
          const st = tween.scrollTrigger;
          const panel = (e.target as HTMLElement).closest<HTMLElement>('.rail__panel, .rail__intro');
          if (!st || !panel || distance() === 0) return;
          const ratio = Math.min(1, panel.offsetLeft / distance());
          window.scrollTo({ top: st.start + ratio * (st.end - st.start), behavior: 'auto' });
        };
        track.addEventListener('focusin', onFocus);
        requestAnimationFrame(() => ScrollTrigger.refresh());

        return () => {
          track.removeEventListener('focusin', onFocus);
          this.pinned.set(false);
        };
      });
      cleanup = () => mm.revert();
    });
  }
}
