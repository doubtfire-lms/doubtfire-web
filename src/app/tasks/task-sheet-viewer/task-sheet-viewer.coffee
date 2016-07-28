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
    # Default for showing the task sheet
    $scope.showTaskSheet = false

    # Alias for textual target project grade
    $scope.targetGrade  = gradeService.grades[$scope.project.target_grade]

    #
    # Watch task for new changes
    #
    $scope.$watch 'task', (task) ->
      return unless task?
      $scope.taskIsGraded = task.definition.is_graded
      $scope.qualityStars = task.definition.max_quality_pts
      $scope.shouldShowAssessmentPanel = $scope.taskIsGraded or $scope.qualityStars
      $scope.hasPDF = task.definition.has_task_pdf
      $scope.hasResources = task.definition.has_task_resources
      $scope.taskPDFUrl = Task.getTaskPDFUrl($scope.unit, task.definition)
      $scope.resourceUrl = Task.getTaskResourcesUrl($scope.unit, task.definition)

    #
    # Watch task defintiion for realignment visualisation
    #
    $scope.$watch 'project.selectedTask.task_definition_id', (newTaskDefId) ->
      $scope.alignments = $filter('taskDefinitionFilter')($scope.unit.task_outcome_alignments, newTaskDefId)

    #
    # Download event for analytics
    #
    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded Task #{type}"

    #
    # Toggles the task sheet PDF viewer
    #
    $scope.toggleTaskSheet = () ->
      analyticsService.event('Task Sheet', "#{ if $scope.showTaskSheet then 'Hid' else 'Showed'} Task Sheet PDF Viewer")
      $scope.showTaskSheet = ! $scope.showTaskSheet

)
