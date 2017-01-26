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

.controller('UserNotificationSettingsModalCtrl', ($scope, $modalInstance, alertService, currentUser, User, user, auth) ->
  $scope.user = user
  $scope.currentUser = currentUser
  $scope.modalState = {}

  $scope.saveNotifications = ->
    User.update( { id: $scope.user.id, user: $scope.user } ).$promise.then (
      (response) ->
        $modalInstance.close(response)
        user.name = user.first_name + " " + user.last_name
        if user == currentUser.profile
          auth.saveCurrentUser()
    ),
    (
      (response) ->
        if response.data.error?
          alertService.add("danger", "Error: " + response.data.error, 6000)
    )
)
