angular.module("doubtfire.common.modals.csv-result-modal", [])

#
# Services for making new modals
#
.factory("CsvResultModal", ($modal, alertService) ->
  CsvResultModal = {}

  #
  # Show the results from a CSV upload with the provided title.
  #
  # Response should be a hash with the following data:
  #
  #   {
  #     success: [ {row: ..., message:""}, ... ],
  #     errors: [ {row: ..., message:""}, ... ],
  #     ignored: [ {row: ..., message:""}, ... ]
  #   }
  #
  CsvResultModal.show = (title, response) ->
    if response.errors.length == 0
      alertService.add("success", "Data uploaded. Success with #{response.success.length} items.", 2000)
    else if response.success.length > 0
      alertService.add("warning", "Data uploaded, success with #{response.success.length} items, but #{response.errors.length} errors.", 6000)
    else
      alertService.add("danger", "Data uploaded but #{response.errors.length} errors", 6000)

    $modal.open
      templateUrl: 'common/modals/csv-result-modal/csv-result-modal.tpl.html'
      controller: 'CsvResultModalCtrl'
      resolve:
        title: -> title
        response: -> response

  CsvResultModal
)

#
# Controller for CSV result modal
#
.controller('CsvResultModalCtrl', ($scope, $modalInstance, title, response) ->
  $scope.title = title
  $scope.response = response

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 5

  if response.errors.length > 0
    $scope.activeCsvResponseSelection = 'errors'
  else if response.success.length > 0
    $scope.activeCsvResponseSelection = 'success'
  else
    $scope.activeCsvResponseSelection = 'ignored'

  $scope.itemData = (selector) ->
    $scope.response[selector]

  $scope.close = ->
    $modalInstance.dismiss()
)


.factory("CsvUploadModal", ($modal, alertService) ->
  CsvUploadModal = {}

  #
  # Shows a dialog to allow people to upload a CSV.
  #
  CsvUploadModal.show = (title, message, batchFiles, url, onSuccess) ->
    $modal.open
      templateUrl: 'common/modals/csv-result-modal/csv-upload-modal.tpl.html'
      controller: 'CsvUploadModalCtrl'
      resolve:
        title: -> title
        message: -> message
        batchFiles: -> batchFiles
        url: -> url
        onSuccess: -> onSuccess

  CsvUploadModal
)

#
# Controller for CSV result modal
#
.controller('CsvUploadModalCtrl', ($scope, $modalInstance, title, message, batchFiles, url, onSuccess) ->

  wrapSuccess = (response) ->
    $modalInstance.dismiss()
    onSuccess(response)

  $scope.title = title
  $scope.message = message
  $scope.batchFiles = batchFiles
  $scope.url = url
  $scope.onSuccess = wrapSuccess



  $scope.close = ->
    $modalInstance.dismiss()
)

