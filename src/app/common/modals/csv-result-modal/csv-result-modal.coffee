angular.module("doubtfire.common.modals.csv-result-modal", [])

#
# Services for making new modals
#
.factory("CSVResultModal", ($modal, alertService) ->
  CSVResultModal = {}

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
  CSVResultModal.show = (title, response) ->
    if response.errors.length == 0
      alertService.add("success", "CSV uploaded. Success with #{response.success.length} rows.", 2000)
    else if response.success.length > 0
      alertService.add("warning", "CSV uploaded, success with #{response.success.length} rows, but #{response.errors.length} errors.", 6000)
    else
      alertService.add("danger", "CSV uploaded but #{response.errors.length} errors", 6000)

    $modal.open
      templateUrl: 'common/modals/csv-result-modal/csv-result-modal.tpl.html'
      controller: 'CSVResultModalCtrl'
      resolve:
        title: -> title
        response: -> response

  CSVResultModal
)

#
# Controller for CSV result modal
#
.controller('CSVResultModalCtrl', ($scope, $modalInstance, title, response) ->
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
