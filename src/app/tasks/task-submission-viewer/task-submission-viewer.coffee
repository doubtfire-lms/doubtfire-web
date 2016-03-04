angular.module('doubtfire.tasks.task-submission-viewer', [])

#
# Viewer for an uploaded task submission
#
.directive('taskSubmissionViewer', ->
  restrict: 'E'
  templateUrl: 'tasks/task-submission-viewer/task-submission-viewer.tpl.html'
  scope:
    project: "=project"
    task: "=task"
  controller: ($scope, TaskFeedback) ->
    $scope.taskUrl = ->
      TaskFeedback.getTaskUrl($scope.task)

    #
    # Exceptional scenarios
    #
    $scope.taskStillProcessing = () ->
      $scope.task.processing_pdf
    $scope.notSubmitted = () ->
      not $scope.task.has_pdf and (not $scope.taskStillProcessing())
)
