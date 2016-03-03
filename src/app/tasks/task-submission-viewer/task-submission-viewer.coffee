angular.module('doubtfire.tasks.view-task-submission', [])

.directive('viewTaskSubmission', ->
  restrict: 'E'
  templateUrl: 'projects/tasks/view-task-submission/view-task-submission.tpl.html'
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
