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

.controller("HomeCtrl", ($scope, $state, $stateParams, $modal, User, UnitRole, Project, Unit, headerService, currentUser, unitService) ->
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

  firstTimeUser     = currentUser.profile.name.toLowerCase() is "first name surname"
  userHasNotOptedIn = currentUser.profile.opt_in_to_research is null

  UnitRole.query (roles) ->
    $scope.unitRoles = roles
    hasRoles = true
    testSingleProjectRole()

  Project.query (projects) ->
    $scope.projects = projects
    hasProjects = true
    testSingleProjectRole()

  if currentUser.role isnt 'Student'
    Unit.query (units) ->
      $scope.units = units

  $scope.unit = (unitId) ->
    _.findWhere($scope.units, {id: unitId})

  headerService.clearMenus()

  $scope.currentUser = currentUser

  if firstTimeUser
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
