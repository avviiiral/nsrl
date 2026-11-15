import { Injectable } from '@angular/core';
import { LocationChangeListener, LocationStrategy } from '@angular/common';

/**
 * Keeps the current route in memory instead of the address bar. Used only by
 * the preview build, which runs inside a sandboxed frame where the URL cannot
 * be changed. The production site uses normal path URLs.
 */
@Injectable()
export class InMemoryLocationStrategy extends LocationStrategy {
  private stack: string[] = ['/'];
  private readonly listeners: LocationChangeListener[] = [];

  path(): string {
    return this.stack[this.stack.length - 1];
  }
  prepareExternalUrl(internal: string): string {
    return internal;
  }
  getState(): unknown {
    return null;
  }
  pushState(_state: unknown, _title: string, path: string, query: string): void {
    this.stack.push(this.join(path, query));
  }
  replaceState(_state: unknown, _title: string, path: string, query: string): void {
    this.stack[this.stack.length - 1] = this.join(path, query);
  }
  forward(): void {
    /* no forward history in the preview */
  }
  back(): void {
    if (this.stack.length < 2) return;
    this.stack.pop();
    const event = { type: 'popstate', state: null } as unknown as Parameters<LocationChangeListener>[0];
    this.listeners.forEach((listener) => listener(event));
  }
  onPopState(listener: LocationChangeListener): void {
    this.listeners.push(listener);
  }
  getBaseHref(): string {
    return '/';
  }

  private join(path: string, query: string): string {
    if (!query) return path;
    return path + (query.startsWith('?') ? query : `?${query}`);
  }
}
