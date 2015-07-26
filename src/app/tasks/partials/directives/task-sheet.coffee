angular.module('doubtfire.tasks.partials.task-sheet', [])

#
# Task sheet shows PDF and allows resources to be downloaded
#
.directive('taskSheet', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-sheet.tpl.html'
  scope:
    task: '='
    unit: '='

  controller: ($scope, currentUser, Task) ->
    $scope.hasPDF = () ->
      $scope.task.definition.has_task_pdf

    $scope.hasResources = () ->
      $scope.task.definition.has_task_resources

    $scope.taskPDFUrl = () ->
      Task.getTaskPDFUrl($scope.unit, $scope.task.definition)

    $scope.resourceUrl = () ->
      Task.getTaskResourcesUrl($scope.unit, $scope.task.definition)

)