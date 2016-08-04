mod = angular.module('doubtfire.units.modals.unit-mark-submissions-offline-modal', [])
#
# Modal to show marking context for offline batch download
#
.factory('UnitMarkSubmissionsOfflineModal', ($uibModal) ->
  UnitMarkSubmissionsOfflineModal = {}

  # Must provide unit
  UnitMarkSubmissionsOfflineModal.show = (unit) ->
    $uibModal.open
      controller: 'UnitMarkSubmissionsOfflineModalCtrl'
      template: require('./unit-mark-submissions-offline-modal.tpl.html')
      resolve: {
        unit: -> unit
      }

  UnitMarkSubmissionsOfflineModal
)
.controller('UnitMarkSubmissionsOfflineModalCtrl', ($scope, $uibModalInstance, alertService, unit, Task, CsvResultModal) ->
  $scope.unit = unit
  $scope.zipMarkingFiles = { file: { name: 'Zip of annotated task PDFs and marks.csv', type: 'zip' } }
  $scope.csvMarkingFiles = { file: { name: 'Modified marks.csv', type: 'csv' } }
  $scope.uploadSubmissionUrl = $scope.readyToMarkSubmissionsUrl =
    Task.getTaskMarkingUrl($scope.unit)
  $scope.isUploading = null
  $scope.isReady =
    csv: null
    zip: null
  $scope.onMarkingUploadSuccess = (response) ->
    CsvResultModal.show "Marking CSV and ZIP upload", response
    $scope.unit.refreshStudents()
  $scope.closeModal = $uibModalInstance.dismiss
)

module.exports = mod.name
