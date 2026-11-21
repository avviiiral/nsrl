import {
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { RenderTier, renderTier } from '../core/capabilities';
import { MotionService } from '../core/motion';
import { CITIES, SERVICES, SITE } from '../core/site.config';
import type { HighwayScene } from '../three/highway-scene';

/**
 * Homepage opening. A sticky stage holds a real-time Three.js highway scene;
 * three chapters of copy scroll over it in normal document flow, and the
 * camera follows the reader's scroll position.
 *
 * The stage is prerendered as a CSS road scene, which is what visitors see
 * first, and what stays on screen without WebGL, with reduced motion, or with
 * Save-Data. The Three.js chunk is only downloaded when it will be used.
 */
@Component({
  selector: 'app-hero-3d',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'on-dark', 'data-hero': '', '[attr.data-tier]': 'tier()', '[class.is-live]': 'live()' },
  templateUrl: './hero-3d.html',
  styleUrl: './hero-3d.scss',
})
export class Hero3dComponent {
  protected readonly site = SITE;
  protected readonly services = SERVICES;
  protected readonly branches = CITIES.filter((c) => c.branch && !c.headOffice);
  protected readonly tier = signal<RenderTier | 'pending'>('pending');
  protected readonly live = signal(false);
  protected readonly chapter = signal(0);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly canvas = viewChild.required<ElementRef<HTMLCanvasElement>>('canvas');
  private readonly doc = inject(DOCUMENT);
  private readonly motion = inject(MotionService);
  private scene: HighwayScene | null = null;
  private progress = 0;
  private cleanups: (() => void)[] = [];

  constructor() {
    const destroyRef = inject(DestroyRef);
    destroyRef.onDestroy(() => {
      this.cleanups.forEach((fn) => fn());
      this.scene?.dispose();
      this.scene = null;
    });
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;

    afterNextRender(() => {
      const win = this.doc.defaultView!;
      const tier = renderTier(win);
      this.tier.set(tier);
      this.trackScroll(win);
      void this.animateChapters();
      if (tier === 'none') return;

      // Desktop starts once the page is idle; phones wait for the visitor to
      // touch or scroll, so first paint and input stay fast on slow CPUs.
      const start = () => void this.startScene(win, tier);
      if (tier === 'full') this.whenIdle(win, start);
      // Let the interaction itself (a menu opening, a scroll) paint first.
      else this.onFirstIntent(win, () => this.whenIdle(win, start));
    });
  }

  private whenIdle(win: Window, fn: () => void): void {
    const go = () => {
      if (typeof win.requestIdleCallback === 'function') win.requestIdleCallback(fn, { timeout: 1500 });
      else setTimeout(fn, 300);
    };
    if (this.doc.readyState === 'complete') go();
    else win.addEventListener('load', go, { once: true });
  }

  private onFirstIntent(win: Window, fn: () => void): void {
    const events = ['pointerdown', 'touchstart', 'scroll', 'keydown', 'wheel'] as const;
    let done = false;
    const fire = () => {
      if (done) return;
      done = true;
      events.forEach((e) => win.removeEventListener(e, fire));
      fn();
    };
    events.forEach((e) => win.addEventListener(e, fire, { passive: true, once: true }));
    this.cleanups.push(() => events.forEach((e) => win.removeEventListener(e, fire)));
  }

  private async startScene(win: Window, tier: 'full' | 'lite'): Promise<void> {
    let mod: typeof import('../three/highway-scene');
    try {
      mod = await import('../three/highway-scene');
    } catch {
      return; // chunk failed to load: the poster stays, nothing else changes
    }
    const canvas = this.canvas().nativeElement;
    const scene = await mod.HighwayScene.create({
      canvas,
      quality: tier,
      logoUrl: SITE.logo?.src ?? '',
      onReady: () => this.live.set(true),
      onLost: () => {
        this.live.set(false);
        this.scene?.dispose();
        this.scene = null;
      },
    });
    if (!this.host.nativeElement.isConnected) {
      scene.dispose();
      return;
    }
    this.scene = scene;

    const stage = canvas.parentElement!;
    const sideBySide = win.matchMedia('(min-width: 64rem)');
    const frame = () => scene.setFraming(sideBySide.matches ? 'side' : 'center');
    const size = () => scene.resize(stage.clientWidth, stage.clientHeight);
    frame();
    size();
    scene.setProgress(this.progress);

    const ro = new ResizeObserver(size);
    ro.observe(stage);
    sideBySide.addEventListener('change', frame);

    // Only animate while the hero is on screen.
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? scene.play() : scene.pause()), { threshold: 0 });
    io.observe(this.host.nativeElement);

    let move: ((e: PointerEvent) => void) | null = null;
    if (this.motion.finePointer) {
      move = (e: PointerEvent) => scene.setPointer((e.clientX / win.innerWidth) * 2 - 1, (e.clientY / win.innerHeight) * 2 - 1);
      win.addEventListener('pointermove', move, { passive: true });
    }

    this.cleanups.push(() => {
      ro.disconnect();
      io.disconnect();
      sideBySide.removeEventListener('change', frame);
      if (move) win.removeEventListener('pointermove', move);
    });
  }

  /** Native scroll drives everything: progress is read, never imposed. */
  private trackScroll(win: Window): void {
    const el = this.host.nativeElement;
    let queued = false;
    const read = () => {
      queued = false;
      const rect = el.getBoundingClientRect();
      const travel = Math.max(1, rect.height - win.innerHeight);
      this.progress = Math.min(1, Math.max(0, -rect.top / travel));
      el.style.setProperty('--p', this.progress.toFixed(4));
      this.chapter.set(Math.min(2, Math.floor(this.progress * 3 + 0.15)));
      this.scene?.setProgress(this.progress);
    };
    const onScroll = () => {
      if (!queued) {
        queued = true;
        win.requestAnimationFrame(read);
      }
    };
    win.addEventListener('scroll', onScroll, { passive: true });
    win.addEventListener('resize', onScroll, { passive: true });
    this.cleanups.push(() => {
      win.removeEventListener('scroll', onScroll);
      win.removeEventListener('resize', onScroll);
    });
    read();
  }

  /** Chapter copy fades up as it arrives and dims as it leaves. Off with reduced motion. */
  private async animateChapters(): Promise<void> {
    const kit = await this.motion.load();
    if (!kit) return;
    const { gsap } = kit;
    const root = this.host.nativeElement;
    const ctx = gsap.context(() => {
      const chapters = gsap.utils.toArray<HTMLElement>('.chapter__body', root);
      chapters.forEach((body, i) => {
        if (i > 0) {
          gsap.from(body.children, {
            y: 48,
            opacity: 0,
            stagger: 0.08,
            ease: 'power3.out',
            duration: 1,
            scrollTrigger: { trigger: body, start: 'top 85%', toggleActions: 'play none none reverse' },
          });
        }
        gsap.to(body, {
          opacity: 0,
          y: -60,
          ease: 'none',
          scrollTrigger: { trigger: body, start: 'top 10%', end: 'top -30%', scrub: true },
        });
      });
    }, root);
    this.cleanups.push(() => ctx.revert());
  }
}
