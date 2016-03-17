angular.module("doubtfire.common.modals.progress-modal", [])

#
# Services for making new modals
#
.factory("ProgressModal", ($modal, $rootScope) ->
  ProgressModal = {}

  #
  # Show a progress modal for long running tasks.
  #
  # Provide an angular resource $promise and the
  # modal will automatically close itself when the XHR
  # request is complete
  #
  ProgressModal.show = (title, message, promise) ->
    modalInstance = $modal.open
      templateUrl: 'common/modals/progress-modal/progress-modal.tpl.html'
      controller: 'ProgressModalCtrl'
      resolve:
        title: -> title
        message: -> message
    # If a promise was provided, then when the finally block is reached
    # close the modal instance created
    promise?.finally ->
      modalInstance.close()

  ProgressModal
)

#
# Controller for progress modal
#
.controller('ProgressModalCtrl', ($scope, $modalInstance, title, message) ->
  $scope.title = title
  $scope.message = message

  $scope.close = ->
    $modalInstance.dismiss()
)
