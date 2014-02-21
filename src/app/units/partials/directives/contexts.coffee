angular.module('doubtfire.units.partials.contexts', [])
.directive('studentUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/student-unit-context.tpl.html'
  controller: ($scope, Project) ->
    Project.query { unit_role_id: $scope.unitRole.id }, (projects) ->
      $scope.project  = projects[0]
      $scope.tasks    = $scope.project.tasks
)
.directive('tutorUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/tutor-unit-context.tpl.html'
  controller: ($scope) ->
)