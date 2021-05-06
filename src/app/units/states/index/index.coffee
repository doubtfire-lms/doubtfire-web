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

.controller("UnitsIndexStateCtrl", ($scope, $rootScope, $state, $stateParams, UnitRole, unitService, projectService, listenerService, currentUser) ->
  # Error - required unitId is missing!
  unitId = +$stateParams.unitId
  return $state.go('home') unless unitId

  # Load assessing unit role
  unitService.getUnitRoles (unitRoles) ->
    $scope.unitRole = _.find(unitRoles, { unit_id: unitId })
    if (! $scope.unitRole?) && ( currentUser.role == "Admin" )
      $scope.unitRole = {
        role: 'Admin',
        unit_id: unitId,
        name: currentUser.Name,
        unit_name: 'Unit admin mode',
        unit_code: '---'
      }
    # Go home if no unit role was found
    return $state.go('home') unless $scope.unitRole?
    $rootScope.$broadcast('UnitRoleChanged', { context: $scope.unitRole })
    unitService.getUnit(unitId, {loadOnlyEnrolledStudents: true}, (unit)->
      $scope.unit = unit
    )
)
