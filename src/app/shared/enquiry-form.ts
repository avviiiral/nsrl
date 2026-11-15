import { ChangeDetectionStrategy, Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { AnalyticsService } from '../core/analytics.service';
import { EnquiryError, EnquiryService } from '../core/enquiry.service';
import { SERVICES, SITE } from '../core/site.config';
import { LoadingStateComponent } from './loading-state';

/** Indian mobile: optional +91 / 91 / 0 prefix, then ten digits starting 6–9. Spaces and hyphens allowed. */
export function indianMobile(control: AbstractControl): ValidationErrors | null {
  const raw = String(control.value ?? '').replace(/[\s-]/g, '');
  if (!raw) return null;
  return /^(?:\+91|91|0)?[6-9]\d{9}$/.test(raw) ? null : { indianMobile: true };
}

type Status = 'idle' | 'sending' | 'sent' | 'failed';

@Component({
  selector: 'app-enquiry-form',
  imports: [ReactiveFormsModule, LoadingStateComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="note">
      <div class="note__head">
        <span class="note__title">Enquiry note</span>
        <span class="small">{{ site.name }}, Indore</span>
      </div>

      @if (status() === 'sent') {
        <div class="note__done" #done tabindex="-1" role="status">
          <h2 class="h3">Enquiry sent.</h2>
          <p>Thank you. The NSRL team has your details and will contact you on the number or email you gave.</p>
          <button type="button" class="btn btn--ghost" (click)="reset()">Send another enquiry</button>
        </div>
      } @else {
        <form [formGroup]="form" (ngSubmit)="submit()" novalidate>
          <div class="cells">
            <div class="cell" [class.has-error]="bad('name')">
              <label for="f-name">Full name</label>
              <input id="f-name" formControlName="name" autocomplete="name" [attr.aria-invalid]="bad('name')" aria-describedby="e-name" />
              <p class="err" id="e-name">@if (bad('name')) { Enter your full name. }</p>
            </div>
            <div class="cell" [class.has-error]="bad('company')">
              <label for="f-company">Company name</label>
              <input id="f-company" formControlName="company" autocomplete="organization" [attr.aria-invalid]="bad('company')" aria-describedby="e-company" />
              <p class="err" id="e-company">@if (bad('company')) { Enter your company name. }</p>
            </div>
            <div class="cell" [class.has-error]="bad('email')">
              <label for="f-email">Email address</label>
              <input id="f-email" type="email" inputmode="email" formControlName="email" autocomplete="email" [attr.aria-invalid]="bad('email')" aria-describedby="e-email" />
              <p class="err" id="e-email">@if (bad('email')) { Enter an email address like name&#64;company.com. }</p>
            </div>
            <div class="cell" [class.has-error]="bad('phone')">
              <label for="f-phone">Contact number</label>
              <input id="f-phone" type="tel" inputmode="tel" formControlName="phone" autocomplete="tel" placeholder="+91" [attr.aria-invalid]="bad('phone')" aria-describedby="e-phone" />
              <p class="err" id="e-phone">@if (bad('phone')) { Enter a 10-digit Indian mobile number. }</p>
            </div>
            <div class="cell cell--wide" [class.has-error]="bad('service')">
              <label for="f-service">Service required</label>
              <select id="f-service" formControlName="service" [attr.aria-invalid]="bad('service')" aria-describedby="e-service">
                <option value="" disabled>Choose a service</option>
                @for (s of services; track s.id) {
                  <option [value]="s.name">{{ s.name }}</option>
                }
                <option value="Not sure yet">Not sure yet</option>
              </select>
              <p class="err" id="e-service">@if (bad('service')) { Choose the service you need. }</p>
            </div>
            <div class="cell" [class.has-error]="bad('pickup')">
              <label for="f-pickup">Pickup location</label>
              <input id="f-pickup" formControlName="pickup" placeholder="From" [attr.aria-invalid]="bad('pickup')" aria-describedby="e-pickup" />
              <p class="err" id="e-pickup">@if (bad('pickup')) { Enter where the load starts. }</p>
            </div>
            <div class="cell" [class.has-error]="bad('delivery')">
              <label for="f-delivery">Delivery location</label>
              <input id="f-delivery" formControlName="delivery" placeholder="To" [attr.aria-invalid]="bad('delivery')" aria-describedby="e-delivery" />
              <p class="err" id="e-delivery">@if (bad('delivery')) { Enter where the load is going. }</p>
            </div>
            <div class="cell cell--wide" [class.has-error]="bad('message')">
              <label for="f-message">Message</label>
              <textarea id="f-message" rows="5" formControlName="message" placeholder="What is moving, how much, and when" [attr.aria-invalid]="bad('message')" aria-describedby="e-message"></textarea>
              <p class="err" id="e-message">@if (bad('message')) { Add a few words about the load (at least 10 characters). }</p>
            </div>
          </div>

          <!-- Honeypot: hidden from people, tempting to bots. -->
          <div class="trap" aria-hidden="true">
            <label for="f-website">Leave this field empty</label>
            <input id="f-website" formControlName="_gotcha" tabindex="-1" autocomplete="off" />
          </div>

          <div class="note__foot">
            <label class="consent" [class.has-error]="bad('consent')">
              <input type="checkbox" formControlName="consent" [attr.aria-invalid]="bad('consent')" aria-describedby="e-consent" />
              <span>
                I agree that {{ site.name }} may use these details to reply to this enquiry. They are sent to NSRL by
                email through Formspree and are not used for marketing or shared with anyone else.
              </span>
            </label>
            <p class="err" id="e-consent">@if (bad('consent')) { Tick the box so we can reply to you. }</p>

            @if (status() === 'failed') {
              <div class="alert" role="alert" #alert tabindex="-1">
                <strong>Enquiry not sent.</strong>
                {{ failure() }}
                Call <a [href]="'tel:' + phone.tel">{{ phone.display }}</a> or email
                <a [href]="'mailto:' + site.email">{{ site.email }}</a> instead. What you typed is still here.
              </div>
            }

            <div class="note__submit">
              <button class="btn" type="submit" [disabled]="status() === 'sending'">Send enquiry</button>
              @if (status() === 'sending') {
                <app-loading-state label="Sending your enquiry" />
              }
            </div>
          </div>
        </form>
      }
    </div>
  `,
  styles: `
    /* The form is laid out like a transport consignment note: ruled cells on one sheet. */
    .note {
      border: 2px solid var(--ink);
      background: var(--paper);
    }
    .note__head {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      justify-content: space-between;
      gap: 0.25rem 1rem;
      padding: 0.8rem 1rem;
      background: var(--signal);
      border-bottom: 2px solid var(--ink);
    }
    .note__title {
      font-stretch: 78%;
      font-weight: 750;
      font-size: var(--step-1);
      line-height: 1.1;
    }
    .cells {
      display: grid;
    }
    .cell {
      position: relative;
      padding: 0.75rem 1rem 0.5rem;
      border-bottom: 1px solid var(--ink);
      transition: background-color 0.2s;
    }
    .cell:focus-within {
      background: #fff8dc;
    }
    label {
      display: block;
      font-size: var(--step--1);
      font-weight: 600;
      color: var(--muted);
    }
    input:not([type='checkbox']),
    select,
    textarea {
      display: block;
      width: 100%;
      min-height: 2.75rem;
      padding: 0.3rem 0;
      border: 0;
      border-radius: 0;
      background: transparent;
      font-size: max(1rem, var(--step-0)); /* 16px floor stops iOS zooming on focus */
      font-weight: 550;
      outline: none;
    }
    textarea {
      resize: vertical;
      line-height: 1.5;
    }
    ::placeholder {
      color: #8a9196;
      font-weight: 400;
    }
    .cell:focus-within::after {
      content: '';
      position: absolute;
      inset: 0;
      border: 3px solid var(--sign);
      pointer-events: none;
    }
    .err {
      min-height: 1.3em;
      font-size: var(--step--1);
      font-weight: 600;
      color: var(--danger);
    }
    .cell.has-error {
      box-shadow: inset 5px 0 0 var(--danger);
    }
    .trap {
      position: absolute;
      left: -100vw;
      width: 1px;
      height: 1px;
      overflow: hidden;
    }
    .note__foot {
      padding: 1rem;
    }
    .consent {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.75rem;
      align-items: start;
      font-size: var(--step--1);
      font-weight: 400;
      color: var(--ink);
      cursor: pointer;
    }
    .consent input {
      width: 1.5rem;
      height: 1.5rem;
      margin: 0.1rem 0 0;
      accent-color: var(--sign);
    }
    .alert {
      margin-top: 1rem;
      padding: 0.9rem 1rem;
      border: 2px solid var(--danger);
      border-left-width: 8px;
      background: #fdf1f0;
    }
    .alert a {
      font-weight: 650;
    }
    .note__submit {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 1rem 1.5rem;
      margin-top: 1.25rem;
    }
    .note__done {
      padding: clamp(1.5rem, 1rem + 3vw, 3rem) 1rem;
      outline: none;
    }
    .note__done p {
      margin: 0.75rem 0 1.5rem;
      max-width: 48ch;
    }
    @media (min-width: 40rem) {
      .cells {
        grid-template-columns: 1fr 1fr;
      }
      .cell:nth-child(odd):not(.cell--wide) {
        border-right: 1px solid var(--ink);
      }
      /* After the full-width service cell the odd/even rhythm flips. */
      .cell--wide ~ .cell:nth-child(odd):not(.cell--wide) {
        border-right: 0;
      }
      .cell--wide ~ .cell:nth-child(even):not(.cell--wide) {
        border-right: 1px solid var(--ink);
      }
      .cell--wide {
        grid-column: 1 / -1;
      }
      .note__head,
      .cell,
      .note__foot {
        padding-inline: 1.5rem;
      }
      .note__done {
        padding-inline: 1.5rem;
      }
    }
  `,
})
export class EnquiryFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly enquiries = inject(EnquiryService);
  private readonly analytics = inject(AnalyticsService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly site = SITE;
  protected readonly phone = SITE.phones[0];
  protected readonly services = SERVICES;
  protected readonly status = signal<Status>('idle');
  protected readonly failure = signal('');
  private readonly submitted = signal(false);
  private readonly done = viewChild<ElementRef<HTMLElement>>('done');
  private readonly alert = viewChild<ElementRef<HTMLElement>>('alert');

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    company: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email, Validators.pattern(/^[^@\s]+@[^@\s]+\.[^@\s]{2,}$/)]],
    phone: ['', [Validators.required, indianMobile]],
    service: ['', [Validators.required]],
    pickup: ['', [Validators.required]],
    delivery: ['', [Validators.required]],
    message: ['', [Validators.required, Validators.minLength(10)]],
    consent: [false, [Validators.requiredTrue]],
    _gotcha: [''],
  });

  constructor() {
    // /enquiry?service=3pl arrives with the service already chosen.
    const requested = inject(ActivatedRoute).snapshot.queryParamMap.get('service');
    const match = SERVICES.find((s) => s.id === requested);
    if (match) this.form.controls.service.setValue(match.name);
  }

  protected bad(name: keyof typeof this.form.controls): boolean {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || this.submitted());
  }

  protected async submit(): Promise<void> {
    if (this.status() === 'sending') return;
    this.submitted.set(true);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.host.nativeElement.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
      return;
    }

    this.status.set('sending');
    const { consent: _consent, ...payload } = this.form.getRawValue();
    try {
      await this.enquiries.send(payload);
      this.status.set('sent');
      this.analytics.event('generate_lead', { service: payload.service });
      setTimeout(() => this.done()?.nativeElement.focus());
    } catch (e) {
      // Only a confirmed 2xx from the form service counts as sent.
      const reason = e instanceof EnquiryError ? e.reason : 'network';
      this.failure.set(
        reason === 'not-configured'
          ? 'Online enquiries are not switched on for this site yet.'
          : reason === 'rejected'
            ? 'The form service did not accept the submission.'
            : 'We could not reach the form service. Check your connection and try again.',
      );
      this.status.set('failed');
      setTimeout(() => this.alert()?.nativeElement.focus());
    }
  }

  protected reset(): void {
    this.form.reset();
    this.submitted.set(false);
    this.status.set('idle');
  }
}
