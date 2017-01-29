angular.module('doubtfire.tasks.modals.upload-submission-modal', [])

#
# A modal to run through uploading a submission
#
.factory('UploadSubmissionModal', ($modal) ->
  UploadSubmissionModal = {}

  #
  # Open a grade task modal with the provided task
  #
  UploadSubmissionModal.show = (task) ->
    $modal.open
      templateUrl: 'tasks/modals/upload-submission-modal/upload-submission-modal.tpl.html'
      controller: 'UploadSubmissionModalCtrl'
      size: 'lg'
      resolve:
        task: -> task
        reuploadEvidence: -> if reuploadEvidence? then reuploadEvidence else false

  UploadSubmissionModal
)
.controller('UploadSubmissionModalCtrl', ($scope, $modalInstance, taskService, task, reuploadEvidence) ->
  # Expose task to scope
  $scope.task = task

  # Set up submission types
  submissionTypes = _.map(taskService.submittableStatuses, (status) ->
    { id: status, label: taskService.statusLabels[status] }
  )
  if $scope.task.canReuploadEvidence()
    submissionTypes.concat({ id: 'reupload_evidence', label: 'New Evidence' })
  $scope.submissionTypes = submissionTypes

  # Load in submission type
  idToLoad = if reuploadEvidence then 'reupload_evidence' else $scope.task.status
  $scope.submissionType = _.find(submissionTypes, { id: idToLoad }).id
)
