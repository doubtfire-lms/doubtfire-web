import {enableProdMode, provideZoneChangeDetection} from '@angular/core';
import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';
import {environment} from 'src/environments/environment';
import {DoubtfireAngularModule} from './app/doubtfire-angular.module';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(DoubtfireAngularModule, {
  applicationProviders: [provideZoneChangeDetection()],
});
