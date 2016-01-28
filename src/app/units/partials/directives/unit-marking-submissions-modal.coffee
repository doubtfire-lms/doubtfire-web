angular.module('doubtfire.units.partials.unit-marking-submissions-modal', [])

#
# Marking submissions context
#

.controller('SubmissionMarkingModal', ($scope, $modalInstance, alertService, unit, Task, csvResultService) ->
  $scope.unit = unit
  $scope.zipMarkingFiles = { file: { name: 'Zipped Feedback Files', type: 'zip' } }
  $scope.csvMarkingFiles = { file: { name: 'Marks.csv', type: 'csv' } }
  $scope.uploadSubmissionUrl = $scope.readyToMarkSubmissionsUrl =
    Task.getTaskMarkingUrl($scope.unit)
  $scope.isUploading = null
  $scope.isReady =
    csv: null
    zip: null
  $scope.onMarkingUploadSuccess = (response) ->
    csvResultService.show "Marking CSV and ZIP upload", response
    $scope.unit.refreshStudents()
  $scope.closeModal = $modalInstance.dismiss
)
