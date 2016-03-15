angular.module("doubtfire.common.modals.progress-modal", [])

#
# Services for making new modals
#
.factory("ProgressModal", ($modal, $rootScope) ->
  ProgressModal = {}
  sharedData = { closed: false }
  #
  # Show a progress modal for long running tasks.
  #
  ProgressModal.show = (title, message) ->
    sharedData.closed = false
    $modal.open
      templateUrl: 'common/modals/progress-modal/progress-modal.tpl.html'
      controller: 'ProgressModalCtrl'
      resolve:
        title: -> title
        message: -> message
        sharedData: -> sharedData
  
  ProgressModal.close = () ->
    sharedData.closed = true
  
  ProgressModal
)

#
# Controller for CSV result modal
#
.controller('ProgressModalCtrl', ($scope, $modalInstance, title, message, sharedData) ->
  $scope.title = title
  $scope.message = message
  $scope.sharedData = sharedData
  
  $scope.$watch "sharedData.closed", () ->
    if $scope.sharedData.closed
      $modalInstance.dismiss()
  
  $scope.close = ->
    $modalInstance.dismiss()
)
