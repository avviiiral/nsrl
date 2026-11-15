import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * The company's history as three stops along a road. Stops carry no dates:
 * the existing site quotes both 1993 and 1994, so no founding year is
 * asserted here beyond the tagline.
 */
@Component({
  selector: 'app-history',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ol class="road">
      @for (stop of stops; track stop.title) {
        <li class="stop">
          <h3 class="stop__title">{{ stop.title }}</h3>
          <p>{{ stop.text }}</p>
        </li>
      }
    </ol>
  `,
  styles: `
    .road {
      display: grid;
      gap: 2.25rem;
      padding-left: 2rem;
      /* Centre line runs down the side on phones and across the top on wide screens. */
      background: repeating-linear-gradient(180deg, var(--signal) 0 1.4rem, transparent 1.4rem 2.6rem) left top / 5px 100% no-repeat;
    }
    .stop {
      position: relative;
    }
    .stop::before {
      content: '';
      position: absolute;
      left: calc(-2rem - 6px);
      top: 0.35rem;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      background: var(--paper);
      border: 4px solid var(--asphalt);
      box-shadow: 0 0 0 2px var(--paper);
    }
    .stop__title {
      margin-bottom: 0.6rem;
    }
    .stop p {
      max-width: 34ch;
      color: var(--muted-on-dark);
    }
    @media (min-width: 60rem) {
      .road {
        grid-template-columns: repeat(3, 1fr);
        gap: var(--gutter);
        padding: 2.75rem 0 0;
        background: repeating-linear-gradient(90deg, var(--signal) 0 3.25rem, transparent 3.25rem 6.5rem) left top / 100% 5px no-repeat;
      }
      .stop::before {
        left: 0;
        top: calc(-2.75rem - 6px);
      }
    }
  `,
})
export class HistoryComponent {
  protected readonly stops = [
    {
      title: 'It starts in Central India',
      text: 'NSRL begins work in supply chain and logistics management. Airtel is its first logistics partner in the region.',
    },
    {
      title: 'Indore becomes the hub',
      text: 'With its head office in Indore, the company opens branches in Ahmedabad, Pune, Mumbai, Gurgaon, Chandigarh, Raipur and Bhopal.',
    },
    {
      title: 'Trucking grows into 3PL',
      text: 'NSRL expands beyond transportation into third-party logistics, taking on more of its clients’ logistics work.',
    },
  ];
}
