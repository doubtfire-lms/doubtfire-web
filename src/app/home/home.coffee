angular.module("doubtfire.home", [])
.config(($stateProvider) ->
  $stateProvider.state("home",
    url: "/home"
    views:
      main:
        controller: "HomeCtrl"
        templateUrl: "home/index.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/header.tpl.html"
        
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  )
)

.controller("HomeCtrl", ($scope, $state, $modal, User, UnitRole, Project, headerService, currentUser) ->
  $scope.unitRoles = UnitRole.query()
  $scope.projects = Project.query()
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

  #
  # Filter functions to separate units in repeater
  #
  $scope.isTutor = (unitRole) ->
    unitRole.role == "Tutor"
  $scope.isConvenor = (unitRole) ->
    unitRole.role == "Convenor"
)
