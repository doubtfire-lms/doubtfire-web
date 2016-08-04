mod = angular.module("doubtfire.common.modals.confirmation-modal", [])

.factory("ConfirmationModal", ($uibModal) ->
  ConfirmationModal = {}

  #
  # Show a modal asking the user to confirm their indicated action.
  #
  ConfirmationModal.show = (title, message, action) ->
    modalInstance = $uibModal.open
      template: require('./confirmation-modal.tpl.html')
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
.controller('ConfirmationModalCtrl', ($scope, $uibModalInstance, title, message, action, alertService) ->
  $scope.title = title
  $scope.message = message

  $scope.confirmAction = () ->
    action()
    $uibModalInstance.dismiss()

  $scope.cancelAction = () ->
    alertService.add 'info', "#{title} action cancelled", 3000
    $uibModalInstance.dismiss()
)

module.exports = mod.name
