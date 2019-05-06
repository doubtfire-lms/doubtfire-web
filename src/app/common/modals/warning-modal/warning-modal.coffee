angular.module("doubtfire.common.modals.warning-modal", [])

.factory("WarningModal", ($modal) ->
  WarningModal = {}

  #
  # Show a modal asking the user to confirm their indicated action.
  #
  WarningModal.show = (title, message) ->
    modalInstance = $modal.open
      templateUrl: 'common/modals/warning-modal/warning-modal.tpl.html'
      controller: 'WarningModalCtrl'
      resolve:
        title: -> title
        message: -> message

  WarningModal
)

#
# Controller for confirmation modal
#
.controller('WarningModalCtrl', ($scope, $modalInstance, title, message, alertService) ->
  $scope.title = title
  $scope.message = message

  $scope.cancelAction = ->
    $modalInstance.dismiss()
)
