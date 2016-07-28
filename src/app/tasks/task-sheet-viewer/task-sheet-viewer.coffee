angular.module('doubtfire.tasks.task-sheet-viewer', [])

#
# Task sheet shows PDF and allows resources to be downloaded
#
.directive('taskSheetViewer', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-sheet-viewer/task-sheet-viewer.tpl.html'
  scope:
    task: '='
    unit: '='
    project: '='

  controller: ($scope, $filter, currentUser, Task, taskService, gradeService, analyticsService) ->

    $scope.showTaskSheet = false

    $scope.targetGrade  = gradeService.grades[$scope.project.target_grade]
    $scope.taskIsGraded = $scope.task.definition.is_graded
    $scope.qualityStars = $scope.task.definition.max_quality_pts

    $scope.shouldShowAssessmentPanel = $scope.taskIsGraded or $scope.qualityStars

    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded Task #{type}"

    $scope.$watch 'project.selectedTask.task_definition_id', (newTaskDefId) ->
      $scope.alignments = $filter('taskDefinitionFilter')($scope.unit.task_outcome_alignments, newTaskDefId)

    $scope.hasPDF = () ->
      $scope.task.definition.has_task_pdf

    $scope.toggleTaskSheet = () ->
      analyticsService.event('Task Sheet', "#{ if $scope.showTaskSheet then 'Hid' else 'Showed'} Task Sheet PDF Viewer")
      $scope.showTaskSheet = ! $scope.showTaskSheet

    $scope.hasResources = () ->
      $scope.task.definition.has_task_resources

    $scope.taskPDFUrl = () ->
      Task.getTaskPDFUrl($scope.unit, $scope.task.definition)

    $scope.resourceUrl = () ->
      Task.getTaskResourcesUrl($scope.unit, $scope.task.definition)

)
