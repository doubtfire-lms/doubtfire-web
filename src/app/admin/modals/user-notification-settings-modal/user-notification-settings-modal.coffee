angular.module("doubtfire.admin.modals.user-notification-settings-modal", [])

.factory('UserNotificationSettingsModal', ($modal) ->
  UserNotificationSettingsModal = {}

  #
  # Show notification settings for the provided user
  #
  UserNotificationSettingsModal.show = (user) ->
    $modal.open
      templateUrl: 'admin/modals/user-notification-settings-modal/user-notification-settings-modal.tpl.html'
      controller: 'UserNotificationSettingsModalCtrl'
      resolve:
        user: ->  user

  UserNotificationSettingsModal
)

.controller('UserNotificationSettingsModalCtrl', ($scope, $modalInstance, alertService, newUserService, user) ->
  $scope.user = user
  $scope.modalState = {}

  $scope.saveNotifications = ->
    newUserService.update( { id: $scope.user.id, user: $scope.user } ).subscribe(
      {
        next: (response) ->
          $modalInstance.close(response)
        error: (response) ->
          if response.data.error?
            alertService.add("danger", "Error: " + response.data.error, 6000)
      }
    )
)
