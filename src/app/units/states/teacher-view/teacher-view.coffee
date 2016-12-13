angular.module('doubtfire.units.states.teacher-view', [])

#
# View for teachers of a unit. They can see everything related
# to multiple students in the entire unit provided
#
.config((headerServiceProvider) ->
  teacherViewStateData =
    url: "/units/:unitCode"
    views:
      main:
        controller: "TeacherViewCtrl"
        templateUrl: "units/states/teacher-view/teacher-view.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  headerServiceProvider.state 'units#teacher-view', teacherViewStateData
)

.controller("TeacherViewCtrl", ($scope, $state, $stateParams, UnitRole, Visualisation, alertService, unitService, analyticsService) ->
  #
  # Returns the state back home
  #
  goHome = -> $state.go 'home'

  # Error - required unitCode is missing!
  goHome() unless $state.params.unitCode?

  # Unit roles aliases unitService.loadedUnitRoles
  $scope.unitRoles = unitService.loadedUnitRoles

  # Wait for update in unitRoles
  $scope.$watch 'unitRoles.length', ->
    $scope.selectedUnitRole = _.find($scope.unitRoles, { unit_code: $state.params.unitCode })

  # Load the unit role details whenever the ID changes
  $scope.$watch 'selectedUnitRole.id', ->
    return unless $scope.selectedUnitRole?
    # Load the unit details
    unitService.getUnit $scope.selectedUnitRole.unit_id, true, false, (unit)->
      $scope.unit = unit
      # Unit is only "loaded" if all the students were loaded
      $scope.$watch 'unit.students', (newValue) ->
        $scope.unitLoaded = true if _.isArray(newValue)
)
