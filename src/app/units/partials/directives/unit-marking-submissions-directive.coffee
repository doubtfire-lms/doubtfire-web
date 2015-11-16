angular.module('doubtfire.units.partials.unit-marking-submissions-directive', [])

#
# Marking submissions context
#

.directive('submissionMarkingContext', ->
  restrict: 'E'
  templateUrl: 'units/partials/templates/submission-marking-context.tpl.html'
  controller: ($scope, alertService, Task, csvResultService) ->
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
)