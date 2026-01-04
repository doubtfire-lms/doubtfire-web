import angular from 'angular';

/**

 *
 * i have kept the module name so AngularJS dependency loading does not crash,
 * but the actual state is now defined in Angular (see index.state.ts).
 */
export const UnitsIndexAjsModule = angular.module('doubtfire.units.states.index', []);
