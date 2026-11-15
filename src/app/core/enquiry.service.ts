import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface EnquiryPayload {
  name: string;
  company: string;
  email: string;
  phone: string;
  service: string;
  pickup: string;
  delivery: string;
  message: string;
  /** Honeypot. Humans leave it empty; Formspree discards submissions where it is filled. */
  _gotcha: string;
}

export type EnquiryFailure = 'not-configured' | 'rejected' | 'network';

export class EnquiryError extends Error {
  constructor(readonly reason: EnquiryFailure, message?: string) {
    super(message ?? reason);
  }
}

/**
 * Sends enquiries to Formspree's public JSON endpoint. There is no backend:
 * Formspree forwards each submission to the mailbox configured on the form.
 */
@Injectable({ providedIn: 'root' })
export class EnquiryService {
  get configured(): boolean {
    return !!environment.formspreeFormId;
  }

  async send(payload: EnquiryPayload): Promise<void> {
    if (!this.configured) throw new EnquiryError('not-configured');

    let response: Response;
    try {
      response = await fetch(`https://formspree.io/f/${environment.formspreeFormId}`, {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          _subject: `Website enquiry from ${payload.name} (${payload.company})`,
        }),
      });
    } catch {
      throw new EnquiryError('network');
    }

    if (!response.ok) {
      let detail: string | undefined;
      try {
        const body = (await response.json()) as { errors?: { message?: string }[] };
        detail = body.errors?.map((e) => e.message).filter(Boolean).join(' ');
      } catch {
        /* non-JSON error body */
      }
      throw new EnquiryError('rejected', detail);
    }
  }
}
