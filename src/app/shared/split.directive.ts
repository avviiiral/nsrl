import { DestroyRef, Directive, ElementRef, PLATFORM_ID, afterNextRender, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { watchEntrance } from './in-view';

/**
 * Headline reveal: each word rises out of its own masked line as the heading
 * scrolls into view. Screen readers get the sentence once, intact, from a
 * visually hidden copy; the animated words are hidden from them.
 *
 * Only headings that start below the fold are split, so nothing already on
 * screen ever blinks out and back in. Static text otherwise.
 */
@Directive({ selector: '[appSplit]' })
export class SplitDirective {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const node = this.el.nativeElement;
      if (matchMedia('(prefers-reduced-motion: reduce)').matches || !('IntersectionObserver' in window)) return;
      const stop = watchEntrance(
        node,
        () => this.split(node),
        () => node.classList.add('is-in'),
        0.3,
      );
      destroyRef.onDestroy(stop);
    });
  }

  private split(node: HTMLElement): boolean {
    const text = node.textContent?.trim().replace(/\s+/g, ' ');
    if (!text) return false;
    const sr = document.createElement('span');
    sr.className = 'visually-hidden';
    sr.textContent = text;
    const visual = document.createElement('span');
    visual.setAttribute('aria-hidden', 'true');
    text.split(' ').forEach((word, i) => {
      const line = document.createElement('span');
      line.className = 'split-line';
      const w = document.createElement('span');
      w.className = 'split-word';
      w.style.setProperty('--i', String(i));
      w.textContent = word;
      line.append(w);
      visual.append(line, ' ');
    });
    node.replaceChildren(sr, visual);
    node.classList.add('split-armed');
    return true;
  }
}
