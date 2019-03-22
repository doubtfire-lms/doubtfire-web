// #
// # Doubtfire - A lightweight, modern learning management system
// #
// # Doubtfire is modularised into many modules, as indicated by the directory
// # tree inside app/
// #
import { downgradeInjectable } from '@angular/upgrade/static';

import { AboutDoubtfireModal } from 'src/app/common/modals/about-doubtfire-modal/about-doubtfire-modal.component'

var angular = window['angular'];

var m = angular.module('doubtfire', [
  'doubtfire.config',
  'doubtfire.api',
  'doubtfire.sessions',
  'doubtfire.common',
  'doubtfire.errors',
  'doubtfire.home',
  'doubtfire.admin',
  'doubtfire.units',
  'doubtfire.tasks',
  'doubtfire.projects',
  'doubtfire.groups',
  'doubtfire.visualisations']);

m.factory('AboutDoubtfireModal',
  downgradeInjectable(AboutDoubtfireModal)
);

export class DoubtfireAppModule {
  public static angularJS = angular;
}
