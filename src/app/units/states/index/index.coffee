angular.module('doubtfire.units.states.index', [])

#
# Root state for units
#
.config(($stateProvider) ->
  $stateProvider.state 'units/index', {
    url: "/units/:unitId"
    abstract: true
    views:
      main:
        controller: "UnitsIndexStateCtrl"
        templateUrl: "units/states/index/index.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor']
  }
)

.controller("UnitsIndexStateCtrl", ($scope, $rootScope, $state, $stateParams, newUnitService, newProjectService, listenerService, globalStateService, newUserService, alertService) ->
  # Error - required unitId is missing!
  unitId = +$stateParams.unitId
  return $state.go('home') unless unitId

  globalStateService.onLoad () ->
    # Load assessing unit role
    $scope.unitRole = globalStateService.loadedUnitRoles.currentValues.find((unitRole) -> unitRole.unit.id == unitId)

    if (! $scope.unitRole?) && ( newUserService.currentUser.role == "Admin" || newUserService.currentUser.role == "Auditor" )
      $scope.unitRole = newUserService.adminOrAuditorRoleFor(newUserService.currentUser.role, unitId, newUserService.currentUser)

    # Go home if no unit role was found
    return $state.go('home') unless $scope.unitRole?

    globalStateService.setView("UNIT", $scope.unitRole)

    newUnitService.get(unitId).subscribe({
      next: (unit)->
        newProjectService.loadStudents(unit).subscribe({
          next: (students)->
            $scope.unit = unit
          error: (err)->
            alertService.error( "Error loading students: " + err, 8000)
            setTimeout((()-> $state.go('home')), 5000)
        })
      error: (err)->
        alertService.error( "Error loading unit: " + err, 8000)
        setTimeout((()-> $state.go('home')), 5000)
    })
)
