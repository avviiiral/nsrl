import { ChangeDetectionStrategy, Component, DOCUMENT, DestroyRef, PLATFORM_ID, afterNextRender, effect, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { NavigationEnd, Router, RouterLink } from '@angular/router';
import { filter } from 'rxjs';
import { SITE } from '../core/site.config';
import { NavigationComponent } from './navigation';

/**
 * Fixed site header. Transparent with light type while a dark page opening
 * (`[data-hero]`) is behind it, solid once the reader scrolls past. A red
 * rule along its bottom edge shows how far down the page the reader is.
 */
@Component({
  selector: 'app-header',
  imports: [RouterLink, NavigationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'close()',
    '[class.is-over]': 'over() && !open()',
    '[class.is-open]': 'open()',
  },
  templateUrl: './header.html',
  styleUrl: './header.scss',
})
export class HeaderComponent {
  protected readonly site = SITE;
  protected readonly phone = SITE.phones[0];
  protected readonly open = signal(false);
  /** Prerendered pages all open on a dark hero, so start transparent. */
  protected readonly over = signal(true);
  protected readonly progress = signal(0);
  private readonly doc = inject(DOCUMENT);

  constructor() {
    // Stop the page scrolling behind the open menu.
    effect(() => {
      this.doc.documentElement.style.overflow = this.open() ? 'hidden' : '';
    });
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    const router = inject(Router);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const win = this.doc.defaultView!;
      let queued = false;
      const measure = () => {
        queued = false;
        const hero = this.doc.querySelector('[data-hero]');
        const headerH = 72;
        this.over.set(!!hero && hero.getBoundingClientRect().bottom > headerH);
        const max = this.doc.documentElement.scrollHeight - win.innerHeight;
        this.progress.set(max > 0 ? Math.min(1, win.scrollY / max) : 0);
      };
      const onScroll = () => {
        if (!queued) {
          queued = true;
          win.requestAnimationFrame(measure);
        }
      };
      win.addEventListener('scroll', onScroll, { passive: true });
      win.addEventListener('resize', onScroll, { passive: true });
      const sub = router.events.pipe(filter((e) => e instanceof NavigationEnd)).subscribe(() => {
        this.close();
        // The new page renders on the next frame; measure after it does.
        win.requestAnimationFrame(() => win.requestAnimationFrame(measure));
      });
      destroyRef.onDestroy(() => {
        win.removeEventListener('scroll', onScroll);
        win.removeEventListener('resize', onScroll);
        sub.unsubscribe();
      });
      measure();
    });
  }

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }
}
