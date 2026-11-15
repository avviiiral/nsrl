import { ChangeDetectionStrategy, Component } from '@angular/core';
import { ClientLogoSectionComponent } from '../shared/client-logo-section';
import { CtaSectionComponent } from '../shared/cta-section';
import { HeroComponent } from '../shared/hero';

@Component({
  selector: 'app-clients-page',
  imports: [HeroComponent, ClientLogoSectionComponent, CtaSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero
      image="supplyChain"
      imageAlt="Goods at a distribution point"
      title="The companies NSRL works with."
      lead="Six names from the NSRL client list, across consumer goods, electronics, manufacturing and retail."
    />

    <section class="section">
      <div class="wrap">
        <app-client-logo-section size="large" />
        <div class="grid after">
          <p class="col-7 display statement">
            Household brands depend on their goods reaching the shelf. These are companies that have put that work in
            NSRL’s hands.
          </p>
          <p class="col-4 start-9 small muted note">
            Company names and logos are trademarks of their respective owners. They appear here only to identify NSRL
            clients and do not imply endorsement.
          </p>
        </div>
      </div>
    </section>

    <app-cta-section title="Add your company to this list." text="Tell us what you need moved and where. We will show you how NSRL would handle it." />
  `,
  styles: `
    .after {
      margin-top: clamp(2.5rem, 2rem + 3vw, 5rem);
      align-items: end;
    }
    .statement {
      font-size: var(--step-2);
      line-height: 1.12;
      max-width: 24ch;
    }
    @media (min-width: 60rem) {
      .note {
        grid-column: 9 / span 4;
      }
    }
  `,
})
export class ClientsPage {}
