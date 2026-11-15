import { ChangeDetectionStrategy, Component } from '@angular/core';
import { SERVICES } from '../core/site.config';
import { CtaSectionComponent } from '../shared/cta-section';
import { HeroComponent } from '../shared/hero';
import { ServiceSectionComponent } from '../shared/service-section';

@Component({
  selector: 'app-services-page',
  imports: [HeroComponent, ServiceSectionComponent, CtaSectionComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-hero
      image="transport"
      imageAlt="NSRL truck on the highway"
      title="Transport, supply chain and 3PL."
      lead="Three services from one operator. Take one, or let NSRL run them together."
    />

    <nav class="jump" aria-label="Services on this page">
      <div class="wrap jump__inner">
        @for (s of services; track s.id) {
          <a [href]="'/services#' + s.id" (click)="jump($event, s.id)">{{ s.short }}</a>
        }
      </div>
    </nav>

    @for (s of services; track s.id; let odd = $odd) {
      <app-service-section [service]="s" [flip]="odd" />
    }

    <app-cta-section title="Not sure which service fits?" text="Describe the requirement and we will tell you how NSRL can handle it." />
  `,
  styles: `
    .jump {
      border-bottom: 2px solid var(--ink);
      background: var(--signal);
    }
    .jump__inner {
      display: flex;
      flex-wrap: wrap;
      gap: 0 2rem;
    }
    .jump a {
      padding-block: 0.9rem;
      font-weight: 700;
      text-decoration: none;
    }
    .jump a:hover {
      text-decoration: underline;
      text-decoration-thickness: 2px;
      text-underline-offset: 0.25em;
    }
  `,
})
export class ServicesPage {
  protected readonly services = SERVICES;

  protected jump(event: Event, id: string): void {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView();
    try {
      history.replaceState(null, '', `/services#${id}`);
    } catch {
      /* sandboxed frames may refuse URL changes; the scroll has already happened */
    }
  }
}
