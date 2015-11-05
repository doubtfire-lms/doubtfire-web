angular.module("doubtfire.home", [])
.config(($stateProvider) ->
  $stateProvider.state("home",
    url: "/home?notifications"
    views:
      main:
        controller: "HomeCtrl"
        templateUrl: "home/index.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/partials/templates/header.tpl.html"

    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  )
)

.controller("HomeCtrl", ($scope, $state, $stateParams, $modal, User, UnitRole, Project, headerService, currentUser) ->
  hasRoles = false
  hasProjects = false

  testSingleProjectRole = () ->
    if not (hasRoles && hasProjects)
      return
    if $scope.unitRoles.length + $scope.projects.length == 1
      if $scope.projects.length == 1
        $state.go 'projects#show', {projectId: $scope.projects[0].project_id}
      else if $scope.unitRoles.length == 1
        $state.go 'units#show', {unitRole: $scope.unitRoles[0].id}

  UnitRole.query (roles) ->
    $scope.unitRoles = roles
    hasRoles = true
    testSingleProjectRole()


  Project.query (projects) ->
    $scope.projects = projects
    hasProjects = true
    testSingleProjectRole()

  headerService.clearMenus()

  if currentUser.profile.name.toLowerCase() == "first name surname"
    $modal.open
      templateUrl: 'users/partials/templates/user-modal-context.tpl.html'
      controller: 'UserModalCtrl'
      resolve:
        # Actually load in all current user info when we request the user settings
        user: ->  currentUser.profile
        isNew: -> false
        users: -> false
  else if $stateParams['notifications']
    $modal.open
      templateUrl: 'users/partials/templates/user-notification-settings.tpl.html'
      controller: 'UserNotificationSettingsModalCtrl'
      resolve:
        # Actually load in all current user info when we request the user settings
        user: ->  currentUser.profile
  #
  # Filter functions to separate units in repeater
  #
  $scope.isTutor = (unitRole) ->
    unitRole.role == "Tutor"
  $scope.isConvenor = (unitRole) ->
    unitRole.role == "Convenor"
)
