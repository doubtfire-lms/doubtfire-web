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
    $scope.$watch 'task', (newTask) ->
      return unless newTask?
      $scope.taskStillProcessing = newTask.processing_pdf
      $scope.taskUrl = TaskFeedback.getTaskUrl newTask
      $scope.notSubmitted = not newTask.has_pdf and (not newTask.processing_pdf)
)
