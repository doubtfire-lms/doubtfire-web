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
  controller: ($scope) ->
    $scope.notSubmitted = (task) ->
      not task.hasPdf and (not task.processingPdf)

    $scope.loadingDetails = (task) ->
      task.needsSubmissionDetails()

    $scope.$watch 'task', (newTask) ->
      return unless newTask?
      newTask.getSubmissionDetails().subscribe(() -> )
      $scope.taskUrl = newTask.submissionUrl()
      $scope.taskFilesURL = newTask.submittedFilesUrl()
)
