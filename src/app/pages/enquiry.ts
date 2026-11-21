import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SITE } from '../core/site.config';
import { EnquiryFormComponent } from '../shared/enquiry-form';
import { HeroComponent } from '../shared/hero';

@Component({
  selector: 'app-enquiry-page',
  imports: [HeroComponent, EnquiryFormComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero
      eyebrow="Enquiry"
      title="Request an enquiry."
      lead="Tell us what needs to move. Every field helps us give you a useful answer the first time."
    />

    <section class="section section--concrete">
      <div class="wrap grid">
        <app-enquiry-form class="col-8" />
        <aside class="col-4 stack aside" style="--stack: 2rem">
          <div>
            <h2 class="h3">Prefer to talk?</h2>
            <ul class="aside__phones">
              @for (p of site.phones; track p.tel) {
                <li><a class="text-link" [href]="'tel:' + p.tel">{{ p.display }}</a></li>
              }
              <li><a class="text-link aside__email" [href]="'mailto:' + site.email">{{ site.email }}</a></li>
            </ul>
          </div>
          <div>
            <h2 class="h3">What happens to this form</h2>
            <p>
              Your enquiry is emailed to the NSRL team in Indore. They reply on the phone number or email address you
              give. Your details are used only to answer this enquiry.
            </p>
          </div>
        </aside>
      </div>
    </section>
  `,
  styles: `
    .aside__phones {
      margin-top: 0.75rem;
    }
    .aside__phones li {
      padding-block: 0.45rem;
    }
    .aside__email {
      overflow-wrap: anywhere;
    }
    .aside p {
      margin-top: 0.75rem;
      max-width: 40ch;
    }
  `,
})
export class EnquiryPage {
  protected readonly site = SITE;
}
