import { ChangeDetectionStrategy, Component, DOCUMENT, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-scroll-to-top',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button type="button" class="top" [class.is-visible]="visible()" [attr.tabindex]="visible() ? 0 : -1" (click)="toTop()">
      <span class="visually-hidden">Back to top</span>
      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
        <path d="M12 19V6M6 11l6-6 6 6" fill="none" stroke="currentColor" stroke-width="2.5" />
      </svg>
    </button>
  `,
  styles: `
    .top {
      position: fixed;
      right: var(--gutter);
      bottom: 1.25rem;
      z-index: 40;
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      border: 0;
      border-radius: 2px;
      background: var(--asphalt);
      color: var(--paper);
      box-shadow:
        0 0 0 1px rgb(255 255 255 / 0.18),
        0 10px 24px -8px rgb(15 18 20 / 0.5);
      cursor: pointer;
      opacity: 0;
      visibility: hidden;
      transform: translateY(0.75rem);
      transition: opacity 0.25s, transform 0.25s var(--ease), visibility 0.25s;
    }
    .top.is-visible {
      opacity: 1;
      visibility: visible;
      transform: none;
    }
    .top:hover,
    .top:focus-visible {
      background: var(--red);
    }
    @media (max-width: 47.99rem) {
      .top {
        bottom: 4.75rem;
      }
    }
  `,
})
export class ScrollToTopComponent {
  protected readonly visible = signal(false);
  private readonly doc = inject(DOCUMENT);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    afterNextRender(() => {
      const win = this.doc.defaultView!;
      let queued = false;
      win.addEventListener(
        'scroll',
        () => {
          if (queued) return;
          queued = true;
          win.requestAnimationFrame(() => {
            this.visible.set(win.scrollY > win.innerHeight);
            queued = false;
          });
        },
        { passive: true },
      );
    });
  }

  protected toTop(): void {
    const win = this.doc.defaultView!;
    const reduce = win.matchMedia('(prefers-reduced-motion: reduce)').matches;
    win.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  }
}
