import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../core/motion';

/**
 * The company's history as three stops along a road. As the section scrolls
 * through the viewport the road draws itself and a truck marker drives to
 * each stop in turn. Stops carry no dates: the live site quotes both 1993 and
 * 1994, so no founding year is asserted here beyond the tagline.
 */
@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--t]': 't()' },
  template: `
    <div class="road" aria-hidden="true">
      <span class="road__line"></span>
      <span class="road__truck"></span>
    </div>
    <ol class="stops">
      @for (stop of stops; track stop.title; let i = $index) {
        <li class="stop" [class.is-reached]="t() >= i / 3 + 0.02">
          <span class="stop__num">Stage 0{{ i + 1 }}</span>
          <h3 class="stop__title">{{ stop.title }}</h3>
          <p>{{ stop.text }}</p>
        </li>
      }
    </ol>
  `,
  styleUrl: './history.scss',
})
export class HistoryComponent {
  /** Journey progress, 0 → 1. Fully drawn unless scroll animation is running. */
  protected readonly t = signal(1);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly stops = [
    {
      title: 'It starts in Central India',
      text: 'NSRL begins work in supply chain and logistics management. Airtel is its first logistics partner in the region.',
    },
    {
      title: 'Indore becomes the hub',
      text: 'With its head office in Indore, the company opens branches in Ahmedabad, Pune, Mumbai, Gurgaon, Chandigarh, Raipur and Bhopal.',
    },
    {
      title: 'Trucking grows into 3PL',
      text: 'NSRL expands beyond transportation into third-party logistics, taking on more of its clients’ logistics work.',
    },
  ];

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    let revert: (() => void) | null = null;
    destroyRef.onDestroy(() => revert?.());
    afterNextRender(async () => {
      const kit = await motion.load();
      if (!kit) return;
      const node = this.host.nativeElement;
      const ctx = kit.gsap.context(() => {
        kit.ScrollTrigger.create({
          trigger: node,
          start: 'top 75%',
          end: 'bottom 55%',
          scrub: 0.5,
          onUpdate: (self) => this.t.set(Number(self.progress.toFixed(3))),
          onRefresh: (self) => this.t.set(Number(self.progress.toFixed(3))),
        });
      }, node);
      revert = () => ctx.revert();
    });
  }
}
