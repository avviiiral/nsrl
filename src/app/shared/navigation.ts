import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NAV, SERVICES } from '../core/site.config';

/** Primary link list. Rendered as a bar in the desktop header and as a stacked list in the mobile panel. */
@Component({
  selector: 'app-navigation',
  imports: [RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-panel]': 'layout() === "panel"' },
  template: `
    <nav [attr.aria-label]="layout() === 'panel' ? 'Mobile' : 'Primary'">
      <ul class="links">
        @for (item of nav; track item.path) {
          <li [class.has-sub]="item.path === '/services'">
            <a [routerLink]="item.path" routerLinkActive="is-active" (click)="navigated.emit()">{{ item.label }}</a>
            @if (item.path === '/services') {
              <ul class="sub">
                @for (s of services; track s.id) {
                  <li>
                    <a routerLink="/services" [fragment]="s.id" (click)="navigated.emit()">{{ s.name }}</a>
                  </li>
                }
              </ul>
            }
          </li>
        }
      </ul>
    </nav>
  `,
  styles: `
    .links {
      display: flex;
      align-items: center;
      gap: clamp(1rem, 2vw, 2rem);
    }
    li {
      position: relative;
    }
    a {
      display: inline-block;
      padding: 0.5rem 0;
      font-weight: 600;
      text-decoration: none;
      /* The underline is a road marking: it draws in from the left on hover. */
      background: linear-gradient(var(--signal), var(--signal)) left bottom / 0 3px no-repeat;
      transition: background-size 0.3s var(--ease);
    }
    a:hover,
    a:focus-visible,
    a.is-active {
      background-size: 100% 3px;
    }
    .sub {
      position: absolute;
      top: 100%;
      left: -1rem;
      min-width: 17rem;
      padding: 0.5rem 1rem 0.75rem;
      background: var(--paper);
      border: 2px solid var(--ink);
      border-radius: 3px;
      opacity: 0;
      visibility: hidden;
      transform: translateY(-0.4rem);
      transition: opacity 0.2s, transform 0.2s var(--ease), visibility 0.2s;
    }
    .sub a {
      display: block;
      font-weight: 500;
    }
    .has-sub:hover .sub,
    .has-sub:focus-within .sub {
      opacity: 1;
      visibility: visible;
      transform: none;
    }

    :host(.is-panel) .links {
      flex-direction: column;
      align-items: stretch;
      gap: 0;
    }
    :host(.is-panel) li {
      border-bottom: 1px solid rgb(255 255 255 / 0.16);
    }
    :host(.is-panel) a {
      display: block;
      padding: 0.95rem 0;
      font-size: 1.6rem;
      font-stretch: 78%;
      font-weight: 750;
      line-height: 1.1;
    }
    :host(.is-panel) .sub {
      position: static;
      opacity: 1;
      visibility: visible;
      transform: none;
      min-width: 0;
      padding: 0 0 0.75rem;
      background: none;
      border: 0;
    }
    :host(.is-panel) .sub li {
      border: 0;
    }
    :host(.is-panel) .sub a {
      padding: 0.6rem 0;
      font-size: 1rem;
      font-stretch: 100%;
      font-weight: 500;
      color: var(--muted-on-dark);
    }
  `,
})
export class NavigationComponent {
  readonly layout = input<'bar' | 'panel'>('bar');
  readonly navigated = output<void>();
  protected readonly nav = NAV;
  protected readonly services = SERVICES;
}
