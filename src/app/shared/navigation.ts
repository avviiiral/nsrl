import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';
import { NAV, SERVICES } from '../core/site.config';

/**
 * Primary link list: a bar in the desktop header, a stacked list in the mobile
 * panel. On the bar, one marker slides to the link under the pointer and
 * settles back on the current page's link.
 */
@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-panel]': 'layout() === "panel"' },
  template: `
    <nav [attr.aria-label]="layout() === 'panel' ? 'Mobile' : 'Primary'">
      <ul class="links" (mouseleave)="settle()">
        @for (item of nav; track item.path; let i = $index) {
          <li [class.has-sub]="item.path === '/services'" [style.--i]="i">
            <a
              class="link"
              [routerLink]="item.path"
              routerLinkActive="is-active"
              ariaCurrentWhenActive="page"
              (click)="navigated.emit()"
              (mouseenter)="mark($event)"
              (focus)="mark($event)"
              >{{ item.label }}</a
            >
            @if (item.path === '/services') {
              <div class="sub">
                <ul class="sub__list">
                  @for (s of services; track s.id; let j = $index) {
                    <li>
                      <a class="sub__link" routerLink="/services" [fragment]="s.id" (click)="navigated.emit()">
                        <span class="sub__num">0{{ j + 1 }}</span>
                        <span class="sub__name">{{ s.name }}</span>
                        <span class="sub__text">{{ s.summary }}</span>
                      </a>
                    </li>
                  }
                </ul>
              </div>
            }
          </li>
        }
      </ul>
      @if (layout() === 'bar') {
        <span class="marker" aria-hidden="true" [style.--x.px]="marker().x" [style.--w.px]="marker().w" [class.is-on]="marker().w > 0"></span>
      }
    </nav>
  `,
  styleUrl: './navigation.scss',
})
export class NavigationComponent {
  readonly layout = input<'bar' | 'panel'>('bar');
  readonly navigated = output<void>();
  protected readonly nav = NAV;
  protected readonly services = SERVICES;
  protected readonly marker = signal({ x: 0, w: 0 });
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const router = inject(Router);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      this.settle();
      const sub = router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => requestAnimationFrame(() => this.settle()));
      // Web font swap changes link widths.
      void document.fonts?.ready.then(() => this.settle());
      destroyRef.onDestroy(() => sub.unsubscribe());
    });
  }

  protected mark(event: Event): void {
    if (this.layout() !== 'bar') return;
    this.place(event.target as HTMLElement);
  }

  /** Return the marker to the current page's link, or hide it. */
  protected settle(): void {
    if (this.layout() !== 'bar') return;
    const active = this.host.nativeElement.querySelector<HTMLElement>('.link.is-active');
    if (active) this.place(active);
    else this.marker.update((m) => ({ ...m, w: 0 }));
  }

  private place(link: HTMLElement): void {
    const nav = this.host.nativeElement.querySelector('nav')!.getBoundingClientRect();
    const r = link.getBoundingClientRect();
    this.marker.set({ x: r.left - nav.left, w: r.width });
  }
}
