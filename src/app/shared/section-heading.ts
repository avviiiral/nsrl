import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (level() === 3) {
      <h3 class="h2">{{ title() }}</h3>
    } @else {
      <h2>{{ title() }}</h2>
    }
    @if (lead(); as l) {
      <p class="lead">{{ l }}</p>
    }
  `,
  styles: `
    :host {
      display: block;
      max-width: 44rem;
    }
    .lead {
      margin-top: 1rem;
      max-width: 46ch;
    }
    :host-context(.section--asphalt) .lead {
      color: var(--muted-on-dark);
    }
  `,
})
export class SectionHeadingComponent {
  readonly title = input.required<string>();
  readonly lead = input<string>();
  readonly level = input<2 | 3>(2);
}
