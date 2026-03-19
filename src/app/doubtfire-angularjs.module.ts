// #
// # Doubtfire - A lightweight, modern learning management system
// #
// # Doubtfire is modularised into many modules, as indicated by the directory
// # tree inside app/
// #

import {downgradeComponent, downgradeInjectable} from '@angular/upgrade/static';
import * as angular from 'angular';

// Here are the old angular node modules, previously loaded via grunt

//#region

// Ok... here is what we need to convert!

import 'build/assets/wav-worker.js';
import 'build/src/app/config/config.js';

//#endregion

import {HeaderComponent} from './common/header/header.component';
import {SplashScreenComponent} from './home/splash-screen/splash-screen.component';
import {TransitionHooksService} from './sessions/transition-hooks.service';

export const DoubtfireAngularJSModule = angular.module('doubtfire', ['doubtfire.config']).config([
  '$locationProvider',
  ($locationProvider) => {
    $locationProvider.html5Mode(true);
  },
]);

// Global configuration

// If the user enters a URL that doesn't match any known URL (state), send them to `/home`
const otherwiseConfigBlock = [
  '$urlRouterProvider',
  '$locationProvider',
  ($urlRouterProvider, $locationProvider) => {
    $locationProvider.hashPrefix('');
    $urlRouterProvider.otherwise('/home');
  },
];
DoubtfireAngularJSModule.config(otherwiseConfigBlock);

// Downgrade angular modules that we need...

DoubtfireAngularJSModule.directive('appHeader', downgradeComponent({component: HeaderComponent}));
DoubtfireAngularJSModule.directive(
  'splashScreen',
  downgradeComponent({component: SplashScreenComponent}),
);

// factory -> service

DoubtfireAngularJSModule.factory(
  'TransitionHooksService',
  downgradeInjectable(TransitionHooksService),
);
