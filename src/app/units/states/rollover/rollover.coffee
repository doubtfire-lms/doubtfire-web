angular.module('doubtfire.units.states.rollover', [
  'doubtfire.units.states.rollover.directives'
])

.config(($stateProvider) ->
  $stateProvider.state 'units/rollover', {
    parent: 'units/index'
    url: '/rollover'
    controller: 'RolloverUnitState'
    templateUrl: 'units/states/rollover/rollover.tpl.html'
    data:
      task: 'Unit Rollover'
      pageTitle: "_Unit Rollover_"
      roleWhitelist: ['Convenor', 'Admin']
   }
)
.controller("RolloverUnitState", ($scope, $state, $stateParams, Convenor, unitService, alertService, analyticsService) ->
  analyticsService.event 'Unit Rollover View', "Started Unit Rollover View"
  unitService.getUnit $state.params.unitId, (unit) ->
    $scope.unit = unit

)