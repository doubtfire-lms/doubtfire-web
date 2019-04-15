import { InjectionToken } from '@angular/core';

// Define an injection token for injecting globally into components.
// Use the name of the angularjs service as the injection token string
export const Unit = new InjectionToken('Unit');

// Define a provider for the above injection token...
// It will get the service from AngularJS via the factory
export const unitProvider = {
  provide: Unit,                          // When you need 'Unit' you
  useFactory: (i: any) => i.get('Unit'),  // get the AngularJS module
  deps: ['$injector']                     // using the upgrade injector.
};