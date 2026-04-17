// Use this module to define all third-party dependencies
// that are used in Doubtfire

import * as angular from 'angular';

export const vendorDependencies = angular.module('doubtfire.config.vendor-dependencies', [
  // ng*
  'ngCsv',
  'ngSanitize',

  // templates
  'templates-app',

  // ui.*
  'ui.router',
  'ui.router.upgrade',
  'ui.bootstrap',
  'ui.codemirror',

  // other libraries
  'angular.filter',
  'localization',
  'markdown',
  'nvd3',
  'xeditable',
  'angular-md5',

  // analytics
  'angulartics',
  'angulartics.google.analytics',
]);
