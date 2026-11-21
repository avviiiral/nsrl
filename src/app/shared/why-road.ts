import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../core/motion';
import { SITE } from '../core/site.config';
import { RevealDirective } from './reveal.directive';
import { SplitDirective } from './split.directive';

/**
 * Reasons to choose NSRL, set as kilometre stones along a road. The heading
 * stays in view while the stones pass; the road draws itself as you read.
 * Every reason restates a fact from the live site.
 */
@Component({
  selector: 'app-why-road',
  imports: [RevealDirective, SplitDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[style.--t]': 't()' },
  template: `
    <div class="wrap why">
      <div class="why__head">
        <p class="eyebrow">Why NSRL</p>
        <h2 appSplit>Why companies choose NSRL</h2>
        <p class="why__tag">“{{ tagline }}”</p>
      </div>
      <div class="why__road">
        <span class="why__line" aria-hidden="true"></span>
        <ol class="why__list">
          @for (w of reasons; track w.term; let i = $index) {
            <li class="why__row" appReveal>
              <span class="why__stone" aria-hidden="true">
                <span class="why__cap">KM</span>
                <span class="why__km">0{{ i + 1 }}</span>
              </span>
              <div>
                <h3 class="why__term">{{ w.term }}</h3>
                <p>{{ w.text }}</p>
              </div>
            </li>
          }
        </ol>
      </div>
    </div>
  `,
  styleUrl: './why-road.scss',
})
export class WhyRoadComponent {
  protected readonly tagline = SITE.tagline;
  protected readonly t = signal(1);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly reasons = [
    {
      term: 'An established operator',
      text: 'NSRL has worked under the line “Trucking value since 1994”. This is a long-running road logistics business, not a new entrant.',
    },
    {
      term: 'Run from Indore',
      text: 'The head office at Dewas Naka, Indore, plans and controls the work from the middle of the country.',
    },
    {
      term: 'Branches where you ship',
      text: 'Ahmedabad, Pune, Mumbai, Gurgaon, Chandigarh, Raipur and Bhopal each have an NSRL branch.',
    },
    {
      term: 'Known clients',
      text: 'Britannia, Bisleri, Samsung, Nilkamal, TATA and DMart are on the NSRL client list.',
    },
    {
      term: 'More than a truck',
      text: 'The business has expanded from transportation into supply chain management and third-party logistics.',
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
      const list = this.host.nativeElement.querySelector('.why__road')!;
      const ctx = kit.gsap.context(() => {
        kit.ScrollTrigger.create({
          trigger: list,
          start: 'top 70%',
          end: 'bottom 60%',
          scrub: 0.4,
          onUpdate: (self) => this.t.set(Number(self.progress.toFixed(3))),
          onRefresh: (self) => this.t.set(Number(self.progress.toFixed(3))),
        });
      });
      revert = () => ctx.revert();
    });
  }
}
