angular.module('doubtfire.units.states.index', [])

#
# Root state for units
#
.config((headerServiceProvider) ->
  headerServiceProvider.state 'units/index', {
    url: "/units/:unitId"
    abstract: true
    views:
      main:
        controller: "UnitsIndexStateCtrl"
        templateUrl: "units/states/index/index.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  }
)

.controller("UnitsIndexStateCtrl", ($scope, $rootScope, $state, $stateParams, newUnitService, projectService, listenerService, GlobalStateService, newUserService) ->
  # Error - required unitId is missing!
  unitId = +$stateParams.unitId
  return $state.go('home') unless unitId

  GlobalStateService.onLoad () ->
    # Load assessing unit role
    $scope.unitRole = GlobalStateService.loadedUnitRoles.currentValues.find((unitRole) -> unitRole.unit.id == unitId)

    if (! $scope.unitRole?) && ( newUserService.currentUser.role == "Admin" )
      $scope.unitRole = {
        role: 'Admin',
        unit_id: unitId,
        name: newUserService.currentUser.Name,
        unit_name: 'Unit admin mode',
        unit_code: '---'
      }

    # Go home if no unit role was found
    return $state.go('home') unless $scope.unitRole?

    GlobalStateService.setView("UNIT", $scope.unitRole)

    newUnitService.fetch(unitId, {params: {loadOnlyEnrolledStudents: true}}).subscribe(
      (unit)->
        $scope.unit = unit
    )
)
