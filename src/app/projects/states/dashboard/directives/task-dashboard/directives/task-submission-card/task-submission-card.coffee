angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-submission-card', [])
#
# Submission details of the task
#
.directive('taskSubmissionCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-submission-card/task-submission-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, listenerService, newTaskService, UploadSubmissionModal, fileDownloaderService, alertService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Evaluate changes to submission data
    reapplySubmissionData = ->
      $scope.task.getSubmissionDetails().subscribe(->
        $scope.canReuploadEvidence = $scope.task.inSubmittedState()
        $scope.canRegeneratePdf = _.includes(newTaskService.pdfRegeneratableStatuses, $scope.task.status) && $scope.task.hasPdf
        $scope.submission = {
          isProcessing: $scope.task.processingPdf
          isUploaded: $scope.task.hasPdf
        }
        $scope.urls = {
          pdf: $scope.task.submissionUrl(true)
          files: $scope.task.submittedFilesUrl()
        }
      )
    # Required changes when task changes
    listeners.push $scope.$watch('task.id', ->
      return unless $scope.task?
      reapplySubmissionData()
    )
    # Functions under action
    $scope.uploadAlternateFiles = ->
      $scope.task.presentTaskSubmissionModal($scope.task.status, true)
    $scope.regeneratePdf = ->
      $scope.task.recreateSubmissionPdf().subscribe(
        {
          next: (response) ->
            if response.result == "false"
              alertService.add("danger", "Request failed, cannot recreate PDF at this time.", 6000)
            else
              task.processingPdf = true
              alertService.add("success", "Task PDF will be recreated.", 2000)

          error: (response) ->
            alertService.add("danger", "Request failed, cannot recreate PDF at this time.", 6000)
        }
      )

    $scope.downloadSubmission = () ->
      fileDownloaderService.downloadFile($scope.urls.pdf, "#{$scope.task.definition.abbreviation}.pdf")

    $scope.downloadSubmissionFiles = () ->
      fileDownloaderService.downloadFile($scope.urls.files, "#{$scope.task.definition.abbreviation}.zip")

)
