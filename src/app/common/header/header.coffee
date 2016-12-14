#
# Controllers and providers related to the header/nav bar
#
angular.module('doubtfire.common.header', [])

.controller("BasicHeaderCtrl", ($scope, $state, $modal, User, AboutDoubtfireModal, UserNotificationSettingsModal, UserSettingsModal, currentUser, headerService, unitService, projectService, dateService) ->
  $scope.menus = headerService.getMenus()
  $scope.currentUser = currentUser.profile

  $scope.openUserSettings = () ->
    UserSettingsModal.show $scope.currentUser

  $scope.openNotificationSettings = ->
    UserNotificationSettingsModal.show $scope.currentUser

  $scope.openAboutModal = ->
    AboutDoubtfireModal.show()
)

.controller("ErrorHeaderCtrl", ($scope, $state, $modal, currentUser, headerService) ->
  $scope.menus = headerService.getMenus()
  $scope.currentUser = currentUser.profile
)
