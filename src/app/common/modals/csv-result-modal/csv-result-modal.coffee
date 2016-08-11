mod = angular.module("doubtfire.common.modals.csv-result-modal", [])

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
      template: require('./csv-result-modal.tpl.html')
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

module.exports = mod.name
