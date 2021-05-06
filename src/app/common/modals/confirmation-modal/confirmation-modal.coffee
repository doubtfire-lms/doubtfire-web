angular.module("doubtfire.common.modals.confirmation-modal", [])

.factory("ConfirmationModal", ($modal) ->
  ConfirmationModal = {}

  #
  # Show a modal asking the user to confirm their indicated action.
  #
  ConfirmationModal.show = (title, message, action) ->
    modalInstance = $modal.open
      templateUrl: 'common/modals/confirmation-modal/confirmation-modal.tpl.html'
      controller: 'ConfirmationModalCtrl'
      resolve:
        title: -> title
        message: -> message
        action: -> action

  ConfirmationModal
)

#
# Controller for confirmation modal
#
.controller('ConfirmationModalCtrl', ($scope, $modalInstance, title, message, action, alertService) ->
  $scope.title = title
  $scope.message = message

  $scope.confirmAction = ->
    action()
    $modalInstance.dismiss()

  $scope.cancelAction = ->
    alertService.add 'info', "#{title} action cancelled", 3000
    $modalInstance.dismiss()
)
