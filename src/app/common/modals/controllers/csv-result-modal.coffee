angular.module("doubtfire.common.csv-result-modal", [])

#
# Services for making alerts
#
.factory("csvResultService", ($modal, alertService) ->
  csvResultSvc =
    #
    # Show the details from the response.
    # Expect response =
    # {
    #   success: [ {row: ..., message:""}, ... ],
    #   errors: [ {row: ..., message:""}, ... ],
    #   ignored: [ {row: ..., message:""}, ... ]
    # }
    #
    show: (title, response) ->
      if response.errors.length == 0
        alertService.add("success", "CSV uploaded. Success with #{response.success.length} rows.", 2000)
      else if response.success.length > 0
        alertService.add("warning", "CSV uploaded, success with #{response.success.length} rows, but #{response.errors.length} errors.", 6000)
      else
        alertService.add("danger", "CSV uploaded but #{response.errors.length} errors", 6000)

      $modal.open
        templateUrl: 'common/modals/templates/csv-result-modal.tpl.html'
        controller: 'CsvResultModal'
        resolve:
          title: -> title
          response: -> response
) # end factory

#
#
#
.controller('CsvResultModal', ($scope, $modalInstance, title, response) ->
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