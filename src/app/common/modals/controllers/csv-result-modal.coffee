angular.module("doubtfire.common.csv-result-modal", [])

#
# Services for making alerts
#
.factory("csvResultService", ($modal) ->
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