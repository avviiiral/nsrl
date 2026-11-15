import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV, SERVICES, SITE } from '../core/site.config';

@Component({
  selector: 'app-footer',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <footer class="footer on-dark">
      <div class="wrap footer__grid">
        <div class="footer__about">
          <a class="footer__brand" routerLink="/">
            @if (site.logo; as logo) {
              <img [src]="logo.src" [width]="logo.width" [height]="logo.height" [alt]="site.name" loading="lazy" />
            } @else {
              <span class="footer__mark">{{ site.brand }}</span>
            }
          </a>
          <p class="footer__tagline">{{ site.tagline }}</p>
          <p class="small footer__muted">
            {{ site.name }} is a logistics company headquartered in Indore, working in transportation, supply chain
            management and third-party logistics.
          </p>
        </div>

        <nav aria-label="Footer">
          <h2 class="footer__h">Company</h2>
          <ul>
            <li><a routerLink="/">Home</a></li>
            @for (item of nav; track item.path) {
              <li>
                <a [routerLink]="item.path">{{ item.label }}</a>
              </li>
            }
            <li><a routerLink="/enquiry">Enquiry</a></li>
          </ul>
        </nav>

        <nav aria-label="Services">
          <h2 class="footer__h">Services</h2>
          <ul>
            @for (s of services; track s.id) {
              <li>
                <a routerLink="/services" [fragment]="s.id">{{ s.name }}</a>
              </li>
            }
          </ul>
        </nav>

        <div>
          <h2 class="footer__h">Head office</h2>
          <address>
            @for (line of site.address.lines; track line) {
              <span>{{ line }}</span>
            }
          </address>
          <ul class="footer__contact">
            @for (p of site.phones; track p.tel) {
              <li>
                <a [href]="'tel:' + p.tel">{{ p.display }}</a>
              </li>
            }
            <li>
              <a [href]="'mailto:' + site.email">{{ site.email }}</a>
            </li>
          </ul>
          @if (site.social.length) {
            <ul class="footer__social">
              @for (s of site.social; track s.url) {
                <li>
                  <a [href]="s.url" rel="noopener" target="_blank">{{ s.label }}</a>
                </li>
              }
            </ul>
          }
        </div>
      </div>

      <div class="wrap footer__base small">
        <p>© {{ year }} {{ site.name }}. All rights reserved.</p>
        <p class="footer__muted">Client names are trademarks of their respective owners.</p>
      </div>
    </footer>
  `,
  styles: `
    .footer {
      background: var(--asphalt);
      color: var(--paper);
      padding-top: clamp(3rem, 2rem + 4vw, 5rem);
      /* Broken centre line across the top edge. */
      border-top: 6px solid transparent;
      border-image: repeating-linear-gradient(90deg, var(--signal) 0 3.25rem, transparent 3.25rem 6.5rem) 6;
    }
    .footer__grid {
      display: grid;
      gap: 2.5rem var(--gutter);
    }
    .footer__brand {
      display: inline-block;
      text-decoration: none;
    }
    .footer__brand img {
      height: 3rem;
      width: auto;
    }
    .footer__mark {
      font-stretch: 78%;
      font-weight: 800;
      font-size: 2.6rem;
      line-height: 1;
    }
    .footer__tagline {
      margin-top: 0.75rem;
      font-weight: 650;
    }
    .footer__about .small {
      margin-top: 0.75rem;
      max-width: 34ch;
    }
    .footer__muted {
      color: var(--muted-on-dark);
    }
    .footer__h {
      margin-bottom: 0.75rem;
      font-size: 1rem;
      font-stretch: 100%;
      font-weight: 650;
      letter-spacing: 0;
      line-height: 1.4;
      color: var(--muted-on-dark);
    }
    li a,
    address span {
      display: block;
    }
    li a {
      padding-block: 0.4rem;
      text-decoration: none;
      overflow-wrap: anywhere;
    }
    li a:hover {
      text-decoration: underline;
      text-decoration-color: var(--signal);
      text-decoration-thickness: 2px;
      text-underline-offset: 0.25em;
    }
    address {
      font-style: normal;
    }
    .footer__contact {
      margin-top: 0.75rem;
    }
    .footer__social {
      display: flex;
      gap: 1rem;
      margin-top: 0.75rem;
    }
    .footer__base {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.25rem 2rem;
      margin-top: clamp(2.5rem, 2rem + 3vw, 4rem);
      padding-block: 1.25rem;
      border-top: 1px solid rgb(255 255 255 / 0.16);
    }
    @media (min-width: 40rem) {
      .footer__grid {
        grid-template-columns: 1fr 1fr;
      }
      .footer__about {
        grid-column: 1 / -1;
      }
    }
    @media (min-width: 64rem) {
      .footer__grid {
        grid-template-columns: 1.5fr 0.8fr 1.3fr 1.3fr;
      }
      .footer__about {
        grid-column: auto;
      }
    }
  `,
})
export class FooterComponent {
  protected readonly site = SITE;
  protected readonly nav = NAV;
  protected readonly services = SERVICES;
  protected readonly year = new Date().getFullYear();
}
