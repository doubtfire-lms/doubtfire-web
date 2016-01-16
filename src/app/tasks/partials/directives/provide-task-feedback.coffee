angular.module('doubtfire.tasks.partials.provide-task-feedback',[])

.directive('provideTaskFeedback', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/provide-task-feedback.tpl.html'
  scope:
    task: "=task"
    unit: "=unit"
    assessingUnitRole: "=assessingUnitRole"
    unitRole: "=unitRole"
    onStatusUpdate: "=onStatusUpdate"
    viewOptions: "="
  controller: ($scope, taskService) ->

    $scope.triggerTransition = (status) ->
      taskService.updateTaskStatus($scope.unit, $scope.task.project(), $scope.task, status)
      if $scope.onStatusUpdate? && _.isFunction($scope.onStatusUpdate)
        $scope.onStatusUpdate(status)
)
