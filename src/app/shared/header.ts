import { ChangeDetectionStrategy, Component, DOCUMENT, effect, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SITE } from '../core/site.config';
import { NavigationComponent } from './navigation';

@Component({
  selector: 'app-header',
  imports: [RouterLink, NavigationComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'close()' },
  template: `
    <header class="bar">
      <div class="wrap bar__inner">
        <a class="brand" routerLink="/" (click)="close()">
          @if (site.logo; as logo) {
            <img [src]="logo.src" [width]="logo.width" [height]="logo.height" [alt]="site.name" />
          } @else {
            <!-- Plain-text stand-in until the original logo file is supplied. Not a redrawn logo. -->
            <span class="brand__mark">{{ site.brand }}</span>
            <span class="brand__name">{{ site.name }}</span>
          }
        </a>

        <app-navigation class="bar__nav" />

        <div class="bar__actions">
          <a class="bar__phone" [href]="'tel:' + phone.tel">{{ phone.display }}</a>
          <a class="btn bar__cta" routerLink="/enquiry">Request an enquiry</a>
          <button
            class="burger"
            type="button"
            [attr.aria-expanded]="open()"
            aria-controls="mobile-menu"
            (click)="open.set(!open())"
          >
            <span class="visually-hidden">{{ open() ? 'Close menu' : 'Open menu' }}</span>
            <span class="burger__lines" aria-hidden="true"></span>
          </button>
        </div>
      </div>
    </header>

    <div id="mobile-menu" class="panel on-dark" [class.is-open]="open()" [attr.inert]="open() ? null : ''">
      <div class="wrap panel__inner">
        <app-navigation layout="panel" (navigated)="close()" />
        <div class="panel__foot">
          <a class="btn btn--signal" routerLink="/enquiry" (click)="close()">Request an enquiry</a>
          <a class="btn btn--ghost" [href]="'tel:' + phone.tel">Call {{ phone.display }}</a>
        </div>
      </div>
    </div>
  `,
  styles: `
    :host {
      position: sticky;
      top: 0;
      z-index: 50;
      display: block;
    }
    .bar {
      position: relative;
      z-index: 2;
      background: var(--paper);
      border-bottom: 2px solid var(--ink);
    }
    .bar__inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      height: var(--header-h);
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      min-width: 0;
      text-decoration: none;
    }
    .brand img {
      height: 2.6rem;
      width: auto;
    }
    .brand__mark {
      font-stretch: 78%;
      font-weight: 800;
      font-size: 1.7rem;
      line-height: 1;
      letter-spacing: -0.01em;
    }
    .brand__name {
      padding-left: 0.7rem;
      border-left: 2px solid var(--ink);
      font-size: 0.82rem;
      font-weight: 600;
      line-height: 1.15;
      max-width: 6.5rem;
    }
    .bar__nav,
    .bar__phone,
    .bar__cta {
      display: none;
    }
    .bar__actions {
      display: flex;
      align-items: center;
      gap: 1.25rem;
    }
    .bar__phone {
      font-weight: 650;
      text-decoration: none;
      white-space: nowrap;
    }
    .bar__cta {
      min-height: 2.75rem;
      padding-block: 0.5rem;
    }
    .burger {
      display: grid;
      place-items: center;
      width: 3rem;
      height: 3rem;
      margin-right: -0.6rem;
      padding: 0;
      border: 0;
      background: none;
      cursor: pointer;
    }
    .burger__lines,
    .burger__lines::before,
    .burger__lines::after {
      display: block;
      width: 1.6rem;
      height: 3px;
      background: var(--ink);
      transition: transform 0.3s var(--ease), background-color 0.2s;
    }
    .burger__lines {
      position: relative;
    }
    .burger__lines::before,
    .burger__lines::after {
      content: '';
      position: absolute;
      left: 0;
    }
    .burger__lines::before {
      top: -8px;
    }
    .burger__lines::after {
      top: 8px;
    }
    .burger[aria-expanded='true'] .burger__lines {
      background: transparent;
    }
    .burger[aria-expanded='true'] .burger__lines::before {
      transform: translateY(8px) rotate(45deg);
    }
    .burger[aria-expanded='true'] .burger__lines::after {
      transform: translateY(-8px) rotate(-45deg);
    }

    .panel {
      position: fixed;
      inset: var(--header-h) 0 0 0;
      z-index: 1;
      background: var(--asphalt);
      color: var(--paper);
      overflow-y: auto;
      overscroll-behavior: contain;
      visibility: hidden;
      clip-path: inset(0 0 100% 0);
      transition: clip-path 0.45s var(--ease), visibility 0.45s;
    }
    .panel.is-open {
      visibility: visible;
      clip-path: inset(0);
    }
    .panel__inner {
      display: flex;
      flex-direction: column;
      min-height: 100%;
      padding-block: 1rem 1.5rem;
    }
    .panel__foot {
      display: grid;
      gap: 0.75rem;
      margin-top: auto;
      padding-top: 2rem;
    }
    @media (prefers-reduced-motion: reduce) {
      .panel {
        transition: none;
      }
    }

    @media (min-width: 48rem) {
      .bar__cta {
        display: inline-flex;
      }
    }
    @media (min-width: 64rem) {
      .bar__nav {
        display: block;
      }
      .burger,
      .panel {
        display: none;
      }
    }
    @media (min-width: 78rem) {
      .bar__phone {
        display: inline;
      }
    }
  `,
})
export class HeaderComponent {
  protected readonly site = SITE;
  protected readonly phone = SITE.phones[0];
  protected readonly open = signal(false);
  private readonly doc = inject(DOCUMENT);

  constructor() {
    // Stop the page scrolling behind the open menu.
    effect(() => {
      this.doc.documentElement.style.overflow = this.open() ? 'hidden' : '';
    });
  }

  protected close(): void {
    this.open.set(false);
  }
}
