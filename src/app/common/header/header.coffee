#
# Controllers and providers related to the header/nav bar
#
angular.module('doubtfire.common.header', [])
.controller("BasicHeaderCtrl", ($scope, $state, $modal, User, AboutDoubtfireModal, UserNotificationSettingsModal, UserSettingsModal, currentUser, headerService, unitService, projectService, dateService) ->
  $scope.currentUser = currentUser.profile

  #
  # Opens the user settings modal
  #
  $scope.openUserSettings = () ->
    UserSettingsModal.show $scope.currentUser

  #
  # Opens the notification settings modal
  #
  $scope.openNotificationSettings = ->
    UserNotificationSettingsModal.show $scope.currentUser

  #
  # Opens the about DF modal
  #
  $scope.openAboutModal = ->
    AboutDoubtfireModal.show()
)
