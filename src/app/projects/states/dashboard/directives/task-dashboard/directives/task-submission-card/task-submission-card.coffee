angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-submission-card', [])
#
# Submission details of the task
#
.directive('taskSubmissionCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, listenerService, TaskFeedback, taskService, UploadSubmissionModal) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Evaluate changes to submission data
    reapplySubmissionData = ->
      $scope.task.getSubmissionDetails(->
        $scope.canReuploadEvidence = $scope.task.canReuploadEvidence()
        $scope.canRegeneratePdf = _.includes(taskService.pdfRegeneratableStatuses, $scope.task.status) && $scope.task.has_pdf
        $scope.submission = {
          isProcessing: $scope.task.processing_pdf
          isUploaded: $scope.task.has_pdf
        }
        $scope.urls = {
          pdf: TaskFeedback.getTaskUrl($scope.task, true)
          files: TaskFeedback.getTaskFilesUrl($scope.task)
        }
      )
    # Required changes when task changes
    listeners.push $scope.$watch('task.id', ->
      return unless $scope.task?
      reapplySubmissionData()
    )
    # Functions under action
    $scope.uploadAlternateFiles = ->
      taskService.presentTaskSubmissionModal($scope.task, $scope.task.status, true)
    $scope.regeneratePdf = ->
      $scope.task.recreateSubmissionPdf()

)
