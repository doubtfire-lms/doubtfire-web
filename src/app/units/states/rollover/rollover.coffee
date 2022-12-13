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
.controller("RolloverUnitState", ($scope, $state, $stateParams, newUnitService, alertService, GlobalStateService) ->
  unitId = +$stateParams.unitId
  return $state.go('home') unless unitId

  GlobalStateService.onLoad () ->
    # Load assessing unit role
    $scope.unitRole = GlobalStateService.loadedUnitRoles.currentValues.find((unitRole) -> unitRole.unit.id == unitId)

    if (! $scope.unitRole?) && ( newUserService.currentUser.role == "Admin" )
      $scope.unitRole = newUserService.adminRoleFor(unitId, newUserService.currentUser)

    # Go home if no unit role was found
    return $state.go('home') unless $scope.unitRole?

    GlobalStateService.setView("UNIT", $scope.unitRole)

    newUnitService.get(unitId).subscribe({
      next: (unit)-> $scope.unit = unit
      error: (err)->
        alertService.add("danger", "Error loading unit: " + err, 8000)
        setTimeout((()-> $state.go('home')), 5000)
    })

)
