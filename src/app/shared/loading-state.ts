import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Inline progress indicator: a centre line that keeps moving while work is in flight. */
@Component({
  selector: 'app-loading-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { role: 'status', 'aria-live': 'polite' },
  template: `
    <span class="track" aria-hidden="true"></span>
    <span>{{ label() }}</span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: 0.9rem;
      font-weight: 600;
    }
    .track {
      flex: 0 0 5rem;
      height: 5px;
      background: repeating-linear-gradient(90deg, var(--ink) 0 0.9rem, transparent 0.9rem 1.8rem);
      animation: lane 0.6s linear infinite;
    }
    @keyframes lane {
      to {
        background-position-x: 1.8rem;
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .track {
        animation: none;
      }
    }
  `,
})
export class LoadingStateComponent {
  readonly label = input('Loading');
}
