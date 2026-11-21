import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { SITE } from '../core/site.config';
import { ContactInformationComponent } from '../shared/contact-information';
import { CtaSectionComponent } from '../shared/cta-section';
import { HeroComponent } from '../shared/hero';

@Component({
  selector: 'app-contact-page',
  imports: [HeroComponent, ContactInformationComponent, CtaSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero
      eyebrow="Contact"
      title="Contact the head office in Indore."
      lead="Call, email or visit. For a quotation, the enquiry form gets the right details to the team fastest."
    />

    <section class="section">
      <div class="wrap grid">
        <app-contact-information class="col-5" />
        <div class="col-7 map">
          <!-- Google resolves the written address; no coordinates are hard-coded. -->
          <iframe
            [src]="mapUrl"
            title="Google Map showing the North South Roadlines head office in Indore"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            allowfullscreen
          ></iframe>
          <p class="small">
            <a class="text-link" [href]="mapLink" target="_blank" rel="noopener">Open in Google Maps</a>
          </p>
        </div>
      </div>
    </section>

    @defer (hydrate on viewport) {

      <app-cta-section title="Have a load to move?" text="Send the pickup point, destination and what is moving. The Indore team will reply." />

    }
  `,
  styles: `
    .map iframe {
      width: 100%;
      height: clamp(20rem, 14rem + 30vw, 32rem);
      border: 0;
      background: var(--concrete);
      box-shadow:
        0 0 0 1px rgb(21 25 27 / 0.12),
        var(--depth-shadow);
    }
    .map p {
      margin-top: 0.75rem;
    }
  `,
})
export class ContactPage {
  private readonly query = encodeURIComponent(SITE.address.mapQuery);
  protected readonly mapUrl = inject(DomSanitizer).bypassSecurityTrustResourceUrl(
    `https://www.google.com/maps?q=${this.query}&output=embed`,
  );
  protected readonly mapLink = `https://www.google.com/maps/search/?api=1&query=${this.query}`;
}
