import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration, withEventReplay, withIncrementalHydration } from '@angular/platform-browser';
import { provideRouter, withInMemoryScrolling, withViewTransitions } from '@angular/router';
import { LocationStrategy } from '@angular/common';
import { environment } from '../environments/environment';
import { InMemoryLocationStrategy } from './core/in-memory-location.strategy';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }),
      withViewTransitions(),
    ),
    provideClientHydration(withEventReplay(), withIncrementalHydration()),
    ...(environment.preview ? [{ provide: LocationStrategy, useClass: InMemoryLocationStrategy }] : []),
  ],
};
