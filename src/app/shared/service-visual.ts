import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, PLATFORM_ID, afterNextRender, inject, input, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * One diagram per service, each drawn from what the service copy says:
 * - transportation: a consignment travelling a road from Indore to its destination;
 * - supply-chain: goods flowing supplier → stock point → customer;
 * - 3pl: the client's operation as a stack, with the logistics layer lifted out to NSRL.
 *
 * Motion is CSS only, runs while the diagram is on screen, and stops with reduced motion.
 */
@Component({
  selector: 'app-service-visual',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-running]': 'running()', '[attr.data-kind]': 'kind()', role: 'img', '[attr.aria-label]': 'label()' },
  templateUrl: './service-visual.html',
  styleUrl: './service-visual.scss',
})
export class ServiceVisualComponent {
  readonly kind = input.required<string>();
  readonly theme = input<'dark' | 'light'>('dark');
  protected readonly running = signal(false);
  protected readonly stones = [0.18, 0.38, 0.58, 0.78];
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected label(): string {
    switch (this.kind()) {
      case 'transportation':
        return 'Diagram: a consignment travelling by road from Indore to its destination.';
      case 'supply-chain':
        return 'Diagram: goods flowing from suppliers to a stock point to customers.';
      default:
        return 'Diagram: a client’s operation as layers, with the logistics layer handed to NSRL.';
    }
  }

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const io = new IntersectionObserver(([e]) => this.running.set(e.isIntersecting), { threshold: 0.2 });
      io.observe(this.host.nativeElement);
      destroyRef.onDestroy(() => io.disconnect());
    });
  }
}
