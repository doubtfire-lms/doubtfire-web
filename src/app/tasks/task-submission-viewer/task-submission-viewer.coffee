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
    $scope.notSubmitted = (task) ->
      not task.has_pdf and (not task.processing_pdf)

    $scope.loadingDetails = (task) ->
      task.needsSubmissionDetails()

    $scope.$watch 'task', (newTask) ->
      return unless newTask?
      newTask.getSubmissionDetails()
      $scope.taskUrl = TaskFeedback.getTaskUrl newTask
      $scope.taskFilesURL = TaskFeedback.getTaskFilesUrl newTask
)
