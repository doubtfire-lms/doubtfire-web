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

  controller: ($scope, $filter, $timeout, currentUser, Task, taskService, gradeService, analyticsService) ->
    # Default for showing the task sheet
    $scope.showTaskSheet = false

    # Alias to grades
    $scope.gradeName = gradeService.grades

    #
    # Evaluates changes to be made to the assessment panels
    #
    evaluateAssessmentPanels = ->
      $scope.assessmentPanels =
        feedback:
          show: $scope.task.status in taskService.switchableStates.tutor
          active: true
        graded:
          show: $scope.task.definition.is_graded
          active: _.isNumber($scope.task.grade)
        quality:
          show: $scope.qualityPoints.max? && $scope.qualityPoints.max > 0
          active: $scope.qualityPoints.assigned > 0 || ($scope.task.status in taskService.markedStatuses)
      $scope.showAssessmentPanel = _.chain($scope.assessmentPanels)
                                    .map('show')
                                    .compact()
                                    .value()
                                    .length > 0

    #
    # Evaluates changes in the quality points of a task
    #
    evaluateQualityPoints = ->
      $scope.qualityPoints =
        max: $scope.task.definition.max_quality_pts
        assigned: $scope.task.quality_pts

    #
    # Watch task for new changes
    #
    $scope.$watch 'task', (task) ->
      return unless task?
      # don't switch the ordering
      evaluateQualityPoints()
      evaluateAssessmentPanels()
      $scope.hasPDF = task.definition.has_task_sheet
      $scope.hasResources = task.definition.has_task_resources
      $scope.taskPDFUrl = Task.getTaskPDFUrl($scope.unit, task.definition)
      $scope.resourceUrl = Task.getTaskResourcesUrl($scope.unit, task.definition)

    #
    # Watch for changes when the active task status changes
    #
    $scope.$watch 'task.status', (newStatus) ->
      $scope.activeStatusData = taskService.statusData(newStatus)
      evaluateAssessmentPanels()

    #
    # Watch grade for changes after modal asssmeent
    #
    $scope.$watch 'task.grade', (grade) ->
      evaluateAssessmentPanels()

    #
    # Watch quality rating for changes after modal assessment
    #
    $scope.$watch 'task.quality_pts', ->
      evaluateQualityPoints()
      evaluateAssessmentPanels()

    #
    # Watch task definition's max_quality_pts. UI bootstrap doesn't allow for
    # a watch'ed evaluation on the `max` value. So, to recompile the rating and,
    # therefore update the rating we must destroy it with an `ng-if` and then
    # recompile it again :(
    #
    $scope.$watch 'task.definition.max_quality_pts', (newPts, oldPts) ->
      if newPts isnt oldPts
        $scope.assessmentPanels.quality.show = false
        $timeout ->
          $scope.assessmentPanels.quality.show = true

    #
    # Watch task defintiion for realignment visualisation
    #
    $scope.$watch 'task.task_definition_id', (newTaskDefId) ->
      $scope.alignments = $filter('taskDefinitionFilter')($scope.unit.task_outcome_alignments, newTaskDefId)

    #
    # Download event for analytics
    #
    $scope.downloadEvent = (type) ->
      analyticsService.event 'Task Sheet', "Downloaded Task #{type}"

    #
    # Toggles the task sheet PDF viewer
    #
    $scope.toggleTaskSheet = ->
      analyticsService.event('Task Sheet', "#{ if $scope.showTaskSheet then 'Hid' else 'Showed'} Task Sheet PDF Viewer")
      $scope.showTaskSheet = ! $scope.showTaskSheet

)
