// Make sure that angular is loaded before anything else!
import 'node_modules/angular/angular.js';

import { enableProdMode, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { environment } from 'src/environments/environment';

import { DoubtfireAngularJSModule } from './app/doubtfire-angularjs.module';
import { DoubtfireAngularModule }   from './app/doubtfire-angular.module';

import { UIRouter, UrlService } from '@uirouter/core';

if (environment.production) {
  enableProdMode();
}

// Using AngularJS config block, call `deferIntercept()`.
// This tells UI-Router to delay the initial URL sync (until all bootstrapping is complete)
DoubtfireAngularJSModule.config(['$urlServiceProvider', ($urlService: UrlService) => $urlService.deferIntercept()]);

// Manually bootstrap the Angular app
platformBrowserDynamic()
  .bootstrapModule(DoubtfireAngularModule)
  .then(platformRef => {
  // Intialize the Angular Module
  // get() the UIRouter instance from DI to initialize the router
  const urlService: UrlService = platformRef.injector.get(UIRouter).urlService;

  // Instruct UIRouter to listen to URL changes
  function startUIRouter() {
    urlService.listen();
    urlService.sync();
  }

  platformRef.injector.get<NgZone>(NgZone).run(startUIRouter);
});

