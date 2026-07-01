import * as Sentry from '@sentry/angular';
import {enableProdMode, provideZoneChangeDetection} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {environment} from 'src/environments/environment';
import {DoubtfireAngularModule} from './app/doubtfire-angular.module';

if (environment.sentryDsn) {
  Sentry.init({
    dsn: environment.sentryDsn,
    tunnel: '/api/client-reports',
    release: environment.sentryRelease || undefined,
    dist: environment.sentryDist || undefined,
    integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
    tracesSampleRate: 1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1,
    enableLogs: true,
    sendDefaultPii: false,
  });
}

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(DoubtfireAngularModule, {
  applicationProviders: [provideZoneChangeDetection()],
});
