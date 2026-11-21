import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../core/site.config';
import { SplitDirective } from './split.directive';

/** Closing call to action: brand red, lined with the logo's stripes. */
@Component({
  selector: 'app-cta-section',
  imports: [RouterLink, SplitDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cta on-dark">
      <div class="cta__stripes stripes" aria-hidden="true"></div>
      <div class="wrap cta__inner">
        <div>
          <h2 class="cta__title" appSplit>{{ title() }}</h2>
          <p class="cta__text">{{ text() }}</p>
        </div>
        <div class="cta__actions">
          <a class="btn cta__primary" routerLink="/enquiry">Request an enquiry</a>
          <a class="cta__call" [href]="'tel:' + phone.tel">
            <span class="cta__call-label">Or call the head office</span>
            <span class="cta__call-number">{{ phone.display }}</span>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .cta {
      position: relative;
      overflow: hidden;
      background: var(--red);
      color: var(--paper);
      padding-block: calc(var(--section) * 0.85);
      isolation: isolate;
    }
    .cta__stripes {
      position: absolute;
      inset: 0 0 0 45%;
      z-index: -1;
      --stripe: rgb(255 255 255 / 0.13);
      --stripe-w: 7px;
      --stripe-gap: 18px;
      mask-image: linear-gradient(90deg, transparent, #000 40%);
    }
    .cta__inner {
      display: grid;
      gap: 2.5rem var(--gutter);
      align-items: end;
    }
    .cta__title {
      font-size: var(--step-4);
      max-width: 13ch;
    }
    .cta__text {
      margin-top: 1.25rem;
      max-width: 42ch;
      font-size: var(--step-1);
      line-height: 1.45;
    }
    .cta__actions {
      display: grid;
      gap: 1.5rem;
      justify-items: start;
    }
    .cta__primary {
      --btn-bg: var(--paper);
      --btn-fg: var(--ink);
      --btn-hover: var(--ink);
      --btn-hover-fg: var(--paper);
    }
    .cta__call {
      display: grid;
      text-decoration: none;
    }
    .cta__call-label {
      font-size: var(--step--1);
      font-weight: 600;
    }
    .cta__call-number {
      font-stretch: 74%;
      font-weight: 780;
      font-size: var(--step-2);
      line-height: 1.15;
      font-variant-numeric: tabular-nums;
      background: linear-gradient(var(--paper), var(--paper)) left bottom / 0 3px no-repeat;
      transition: background-size 0.4s var(--ease-out);
    }
    .cta__call:hover .cta__call-number,
    .cta__call:focus-visible .cta__call-number {
      background-size: 100% 3px;
    }
    @media (min-width: 60rem) {
      .cta__inner {
        grid-template-columns: 1fr auto;
      }
    }
  `,
})
export class CtaSectionComponent {
  readonly title = input('Tell us what needs to move.');
  readonly text = input('Share the load, the pickup point and the destination. The Indore team will come back to you.');
  protected readonly phone = SITE.phones[0];
}
