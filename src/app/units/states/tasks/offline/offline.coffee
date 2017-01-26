angular.module('doubtfire.units.states.tasks.offline', [])

#
# Marking context for offline batch download
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/offline', {
    parent: 'units/tasks'
    url: '/offline'
    templateUrl: "units/states/tasks/offline/offline.tpl.html"
    controller: "OfflineMarkingStateCtrl"
    data:
      task: "Mark Tasks Offline"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)
.controller('OfflineMarkingStateCtrl', ($scope, alertService, Task, CsvResultModal) ->
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
  $scope.activeTab = 'download'
  $scope.setActiveTab = (newTab) ->
    $scope.activeTab = newTab
)
