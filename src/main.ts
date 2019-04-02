import { enableProdMode, NgZone } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import { DoubtfireAppModule } from './app/app'

import { UIRouter, UrlService } from '@uirouter/core';

if (environment.production) {
  enableProdMode();
}

// Using AngularJS config block, call `deferIntercept()`.
// This tells UI-Router to delay the initial URL sync (until all bootstrapping is complete)
DoubtfireAppModule.angularJSModule.config([ '$urlServiceProvider', ($urlService: UrlService) => $urlService.deferIntercept() ]);

// Manually bootstrap the Angular app
platformBrowserDynamic().bootstrapModule(AppModule).then(platformRef => {
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

// platformBrowserDynamic().bootstrapModule(AppModule)
//   .catch(err => console.log(err));

console.log(DoubtfireAppModule.angularJS.version)
