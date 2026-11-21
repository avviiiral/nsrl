import { DestroyRef, Directive, ElementRef, PLATFORM_ID, afterNextRender, inject, input } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { MotionService } from '../core/motion';

/**
 * Pointer-responsive 3D tilt for a surface. Only on mouse and trackpad
 * (never touch) and never with reduced motion. Sets --rx / --ry / --mx / --my
 * on the element; its stylesheet decides how to use them.
 */
@Directive({ selector: '[appTilt]', host: { class: 'tilt' } })
export class TiltDirective {
  /** Maximum rotation in degrees. */
  readonly tilt = input(6, { alias: 'appTilt', transform: (v: number | string) => (v === '' ? 6 : Number(v)) });
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    if (!isPlatformBrowser(inject(PLATFORM_ID))) return;
    const motion = inject(MotionService);
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      if (motion.reducedMotion || !motion.finePointer) return;
      const node = this.el.nativeElement;
      let frame = 0;
      const move = (e: PointerEvent) => {
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(() => {
          const r = node.getBoundingClientRect();
          const x = (e.clientX - r.left) / r.width - 0.5;
          const y = (e.clientY - r.top) / r.height - 0.5;
          const max = this.tilt();
          node.style.setProperty('--ry', `${(x * max * 2).toFixed(2)}deg`);
          node.style.setProperty('--rx', `${(-y * max * 2).toFixed(2)}deg`);
          node.style.setProperty('--mx', `${((x + 0.5) * 100).toFixed(1)}%`);
          node.style.setProperty('--my', `${((y + 0.5) * 100).toFixed(1)}%`);
        });
      };
      const leave = () => {
        cancelAnimationFrame(frame);
        node.style.setProperty('--rx', '0deg');
        node.style.setProperty('--ry', '0deg');
      };
      node.classList.add('tilt-on');
      node.addEventListener('pointermove', move);
      node.addEventListener('pointerleave', leave);
      destroyRef.onDestroy(() => {
        cancelAnimationFrame(frame);
        node.removeEventListener('pointermove', move);
        node.removeEventListener('pointerleave', leave);
      });
    });
  }
}
