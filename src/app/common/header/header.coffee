#
# Controllers and providers related to the header/nav bar
#
angular.module('doubtfire.common.header', [])

.constant('headerTemplateUrl',
  'common/header/header.tpl.html'
)

.controller("BasicHeaderCtrl", ($scope, $state, $modal, User, AboutDoubtfireModal, UserNotificationSettingsModal, UserSettingsModal, currentUser, headerService, unitService, projectService) ->
  $scope.menus = headerService.getMenus()
  $scope.currentUser = currentUser.profile

  # Global Units Menu
  unitService.getUnitRoles (roles) ->
    $scope.unitRoles = roles
  projectService.getProjects (projects) ->
    $scope.projects = projects

  $scope.isUniqueUnitRole = (unit) ->
    units = (item for item in $scope.unitRoles when item.unit_id is unit.unit_id)
    # teaching userRoles will default to tutor role if both convenor and tutor
    units.length == 1 || unit.role == "Tutor"

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
