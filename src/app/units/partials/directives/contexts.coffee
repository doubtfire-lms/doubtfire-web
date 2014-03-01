angular.module('doubtfire.units.partials.contexts', [])
.directive('studentUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/student-unit-context.tpl.html'
  controller: ($scope, $modal, Project) ->
    Project.query { unit_role_id: $scope.unitRole.id }, (projects) ->
      $scope.project  = projects[0]
      $scope.tasks    = $scope.project.tasks

    # TODO: Move to task list partial
    $scope.showAssessTaskModal = (task) ->
      $modal.open
        controller: 'AssessTaskModalCtrl'
        templateUrl: 'tasks/partials/templates/assess-task-modal.tpl.html'
        resolve:
          task: -> task
)
.directive('tutorUnitContext', ->
  replace: true
  restrict: 'E'
  templateUrl: 'units/partials/templates/tutor-unit-context.tpl.html'
  controller: ($scope) ->
)