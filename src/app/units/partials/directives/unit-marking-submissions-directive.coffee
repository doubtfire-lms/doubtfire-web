angular.module('doubtfire.units.partials.unit-marking-submissions-directive', [])

#
# Marking submissions context
#

.directive('submissionMarkingContext', ->
  restrict: 'E'
  templateUrl: 'units/partials/templates/submission-marking-context.tpl.html'
  controller: ($scope, alertService, Task) ->
    $scope.zipMarkingFiles = { file: { name: 'Re-Zipped Marked Files', type: 'zip' } }
    $scope.csvMarkingFiles = { file: { name: 'Marks.csv', type: 'csv' } }
    $scope.uploadSubmissionUrl = $scope.readyToMarkSubmissionsUrl =
      Task.getTaskMarkingUrl($scope.unit)
    $scope.isUploading = null
    $scope.isReady =
      csv: null
      zip: null
    $scope.taskUploadResults = null
    $scope.onMarkingUploadSuccess = (response) ->
      alertService.add("success", "Uploaded marked tasks.", 2000)
      $scope.taskUploadResults = response
    $scope.dismissResults = ->
      $scope.taskUploadResults = null
)