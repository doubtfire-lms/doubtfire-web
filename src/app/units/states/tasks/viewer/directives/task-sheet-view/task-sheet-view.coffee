angular.module('doubtfire.units.states.tasks.viewer.directives.task-sheet-view', [])

.directive('taskSheetView', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/viewer/directives/task-sheet-view/task-sheet-view.tpl.html'
  scope:
    task: '='
    unit: '='
  controller: ($scope, $timeout, TaskFeedback, taskService, alertService, listenerService, Task, Unit) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)

    $scope.clearSelectedTask = -> $scope.task = null

    listeners.push $scope.$watch 'task', (newTask) ->
      setDetails = ->
        if newTask?
          $scope.hasPdf = newTask.has_task_pdf
          $scope.taskPdfUrl = Task.getTaskPDFUrl($scope.unit, $scope.task)
      setDetails()
)
      
