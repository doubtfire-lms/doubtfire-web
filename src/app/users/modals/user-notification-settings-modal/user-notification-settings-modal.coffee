mod = angular.module("doubtfire.users.modals.user-notification-settings-modal", [])

.factory('UserNotificationSettingsModal', ($uibModal) ->
  UserNotificationSettingsModal = {}

  #
  # Show notification settings for the provided user
  #
  UserNotificationSettingsModal.show = (user) ->
    $uibModal.open
      template: require('./user-notification-settings-modal.tpl.html')
      controller: 'UserNotificationSettingsModalCtrl'
      resolve:
        user: ->  user

  UserNotificationSettingsModal
)

.controller('UserNotificationSettingsModalCtrl', ($scope, $uibModalInstance, alertService, currentUser, User, user, auth) ->
  $scope.user = user
  $scope.currentUser = currentUser
  $scope.modalState = {}

  $scope.saveNotifications = ->
    User.update( { id: $scope.user.id, user: $scope.user } ).$promise.then (
      (response) ->
        $uibModalInstance.close(response)
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

module.exports = mod.name
