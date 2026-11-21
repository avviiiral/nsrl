import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section nf">
      <div class="wrap stack">
        <h1>This road does not go anywhere.</h1>
        <p class="lead">The page you asked for is not on this site. It may have moved in the redesign.</p>
        <div class="btn-row">
          <a class="btn" routerLink="/">Go to the homepage</a>
          <a class="btn btn--ghost" routerLink="/contact">Contact NSRL</a>
        </div>
      </div>
    </section>
  `,
  styles: `
    .nf {
      padding-top: calc(var(--header-h) + var(--section));
      min-height: 70svh;
    }
  `,
})
export class NotFoundPage {}
