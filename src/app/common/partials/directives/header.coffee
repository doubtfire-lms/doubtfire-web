angular.module("doubtfire.common.header", [])

.controller("BasicHeaderCtrl", ($scope, $state, $modal, currentUser, headerService, User, aboutModalService, unitService, projectService) ->
  # $scope.currentUser = {}
  # $scope.currentUser.nickname = currentUser.profile.nickname
  # $scope.currentUser.name = currentUser.profile.name
  $scope.menus = headerService.menus()
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
    $modal.open
      templateUrl: 'users/partials/templates/user-modal-context.tpl.html'
      controller: 'UserModalCtrl'
      resolve:
        # Actually load in all current user info when we request the user settings
        user: ->  $scope.currentUser
        isNew: -> false
        users: -> false

  $scope.openNotificationSettings = () ->
    $modal.open
      templateUrl: 'users/partials/templates/user-notification-settings.tpl.html'
      controller: 'UserNotificationSettingsModalCtrl'
      resolve:
        # Actually load in all current user info when we request the user settings
        user: ->  $scope.currentUser

  $scope.openAboutModal = ->
    aboutModalService.show()
)

.controller("ErrorHeaderCtrl", ($scope, $state, $modal, currentUser, headerService) ->
  $scope.menus = headerService.menus()
  $scope.currentUser = currentUser.profile
)