angular.module('doubtfire.units.states.tasks.viewer.directives.task-sheet-view', [])

.directive('taskSheetView', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/viewer/directives/task-sheet-view/task-sheet-view.tpl.html'
  scope:
    taskDef: '='
    unit: '='
  controller: ($scope, $timeout, alertService, listenerService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)

    $scope.clearSelectedTask = -> $scope.taskDef = null
    $scope.urls = {
      taskPdfUrl: ""
    }

    listeners.push $scope.$watch 'taskDef', (newTask) ->
      setDetails = ->
        if newTask?
          $scope.hasPdf = newTask.hasTaskSheet
          $scope.urls.taskPdfUrl = $scope.taskDef.getTaskPDFUrl()
      setDetails()
)

