_ = require('lodash')

mod = angular.module('doubtfire.home.states.home', [])

.config((headerServiceProvider) ->
  homeStateData =
    url: "/home"
    views:
      main:
        controller: "HomeCtrl"
        template: require('./home.tpl.html')
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  headerServiceProvider.state 'home', homeStateData
)

.controller("HomeCtrl", ($scope, $state, User, Unit, headerService, currentUser, unitService, projectService, $rootScope, analyticsService, dateService) ->
  analyticsService.event 'Home', 'Viewed Home page'

  $scope.userFirstName = currentUser.profile.nickname or currentUser.profile.first_name
  $scope.showDate = dateService.showDate

  hasRoles = false
  hasProjects = false

  #
  # If this is a new wizard show the new user wizard
  # state instead
  #
  testForNewUserWizard = ->
    firstTimeUser     = currentUser.profile.has_run_first_time_setup is false
    userHasNotOptedIn = currentUser.profile.opt_in_to_research is null

    showNewUserWizard = firstTimeUser or userHasNotOptedIn
    userHasNotOptedIn = userHasNotOptedIn and not firstTimeUser

    if showNewUserWizard
      $state.go 'new-user-wizard', { optInOnly: userHasNotOptedIn }

  #
  # If there is a single project role, then automatically
  # switch the user to the project view for that role
  #
  testSingleProjectRole = ->
    if not (hasRoles && hasProjects)
      return
    if $scope.unitRoles.length + $scope.projects.length == 1
      if $scope.projects.length == 1
        analyticsService.event 'Home', 'Switched to project on single unit'
        $state.go 'projects#show', {projectId: $scope.projects[0].project_id}
      else if $scope.unitRoles.length == 1
        analyticsService.event 'Home', 'Switched to unit on single unit'
        $state.go 'units#show', {unitRole: $scope.unitRoles[0].id}

  testForStateChanges = ->
    testForNewUserWizard()
    testSingleProjectRole()

  unitService.getUnitRoles (roles) ->
    $scope.unitRoles = roles
    hasRoles = true
    testForStateChanges()

  projectService.getProjects (projects) ->
    $scope.projects = projects
    hasProjects = true
    testForStateChanges()

  checkEnrolled = ->
    $scope.notEnrolled = ->
      # Not enrolled if a tutor and no unitRoles
      ($scope.unitRoles.length is 0 and currentUser.role is 'Tutor') or
      # Not enrolled if a student and no projects
      ($scope.projects.length is 0 and currentUser.role is 'Student')

  $scope.$watch 'projects', checkEnrolled
  $scope.$watch 'unitRoles', checkEnrolled

  if currentUser.role isnt 'Student'
    Unit.query (units) ->
      $scope.units = units

  $scope.unit = (unitId) ->
    _.find($scope.units, {id: unitId})

  headerService.clearMenus()

  $scope.currentUser = currentUser

)

module.exports = mod.name
