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
    project: '='

  controller: ($scope, $filter, currentUser, Task) ->

    $scope.showTaskSheet = false

    $scope.$watch 'project.selectedTask.task_definition_id', (newTaskDefId) ->
      $scope.alignments = $filter('taskFilter')($scope.unit.task_outcome_alignments, newTaskDefId)

    $scope.hasPDF = () ->
      $scope.task.definition.has_task_pdf

    $scope.toggleTaskSheet = () ->
      $scope.showTaskSheet = ! $scope.showTaskSheet

    $scope.hasResources = () ->
      $scope.task.definition.has_task_resources

    $scope.taskPDFUrl = () ->
      Task.getTaskPDFUrl($scope.unit, $scope.task.definition)

    $scope.resourceUrl = () ->
      Task.getTaskResourcesUrl($scope.unit, $scope.task.definition)

)