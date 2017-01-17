angular.module('doubtfire.units.states.index', [
  'doubtfire.units.states.tasks'
])

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

.controller("UnitsIndexStateCtrl", ($scope, $rootScope, $state, $stateParams, UnitRole, unitService, projectService, listenerService) ->
  # Cleanup
  listeners = listenerService.listenTo($scope)

  #
  # Returns the state back home
  #
  goHome = -> $state.go 'home'

  # Error - required unitId is missing!
  $scope.unitId = +$stateParams.unitId
  goHome() unless $scope.unitId

  #
  # Fire whenever the unit code changes
  #
  listeners.push $scope.$watch 'unitId', (newId) ->
    # Check if switching to teaching unit
    unitService.getUnitRoles (unitRoles) ->
      $scope.unitRole = _.find(unitRoles, { unit_id: newId })
      $rootScope.$broadcast 'UnitRoleChanged', { context: $scope.unitRole }
    # Check if switching to studying unit
    projectService.getProjects (projects) ->
      $scope.project = _.find(projects, { unit_id: newId })
      $rootScope.$broadcast 'ProjectChanged', { context: $scope.project }

  # Loads required data for a selected unit role or project
  loadRequiredData = ->
    unitService.getUnit ($scope.unitRole?.unit_id || $scope.unitId), true, false, (unit)->
      $scope.unit = unit
      # Unit is only "loaded" if all the students were loaded
      $scope.$watch 'unit.students', (newValue) ->
        $scope.unitLoaded = _.isArray(newValue)

  # Load the unit role details whenever the ID changes
  listeners.push $scope.$watch 'unitRole.id', loadRequiredData
  listeners.push $scope.$watch 'project.id', loadRequiredData
)
