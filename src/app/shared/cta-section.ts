import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../core/site.config';

@Component({
  selector: 'app-cta-section',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cta on-dark">
      <div class="wrap cta__inner">
        <div>
          <h2>{{ title() }}</h2>
          <p class="cta__text">{{ text() }}</p>
        </div>
        <div class="btn-row">
          <a class="btn btn--signal" routerLink="/enquiry">Request an enquiry</a>
          <a class="btn btn--ghost" [href]="'tel:' + phone.tel">Call {{ phone.display }}</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .cta {
      background: var(--sign);
      color: var(--paper);
      padding-block: calc(var(--section) * 0.7);
    }
    .cta__inner {
      display: grid;
      gap: 2rem var(--gutter);
      align-items: end;
    }
    h2 {
      max-width: 16ch;
    }
    .cta__text {
      margin-top: 1rem;
      max-width: 44ch;
      font-size: var(--step-1);
      line-height: 1.45;
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
