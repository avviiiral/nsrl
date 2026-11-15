import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../core/site.config';

@Component({
  selector: 'app-contact-information',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <dl class="contact">
      <div>
        <dt>Head office</dt>
        <dd>
          <address>
            {{ site.name }}<br />
            @for (line of site.address.lines; track line) {
              {{ line }}<br />
            }
          </address>
        </dd>
      </div>
      <div>
        <dt>Phone</dt>
        <dd>
          @for (p of site.phones; track p.tel) {
            <a class="contact__big" [href]="'tel:' + p.tel">{{ p.display }}</a>
          }
        </dd>
      </div>
      <div>
        <dt>Email</dt>
        <dd>
          <a class="contact__big contact__email" [href]="'mailto:' + site.email">{{ site.email }}</a>
        </dd>
      </div>
      @if (site.whatsappNumber; as wa) {
        <div>
          <dt>WhatsApp</dt>
          <dd>
            <a class="text-link" [href]="'https://wa.me/' + wa" rel="noopener" target="_blank">Message us on WhatsApp</a>
          </dd>
        </div>
      }
    </dl>
  `,
  styles: `
    .contact > div {
      padding-block: 1.25rem;
      border-top: 2px solid var(--ink);
    }
    dt {
      margin-bottom: 0.35rem;
      font-weight: 600;
      color: var(--muted);
    }
    address {
      font-style: normal;
    }
    .contact__big {
      display: block;
      width: fit-content;
      padding-block: 0.3rem;
      font-stretch: 78%;
      font-weight: 750;
      font-size: var(--step-2);
      line-height: 1.15;
      text-decoration: none;
      background: linear-gradient(var(--signal), var(--signal)) left bottom / 0 4px no-repeat;
      transition: background-size 0.3s var(--ease);
    }
    .contact__big:hover,
    .contact__big:focus-visible {
      background-size: 100% 4px;
    }
    .contact__email {
      font-size: clamp(1.25rem, 0.9rem + 1.8vw, 2rem);
      overflow-wrap: anywhere;
    }
  `,
})
export class ContactInformationComponent {
  protected readonly site = SITE;
}
