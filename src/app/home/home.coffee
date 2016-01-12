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

.controller("HomeCtrl", ($scope, $state, $stateParams, $modal, User, UnitRole, Project, Unit, headerService, currentUser, unitService, $rootScope) ->
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

  firstTimeUser     = currentUser.profile.first_name.toLowerCase() is "first name"
  userHasNotOptedIn = currentUser.profile.opt_in_to_research is null

  $scope.showNewUserWizard = firstTimeUser or userHasNotOptedIn
  $scope.userHasNotOptedIn = userHasNotOptedIn and not firstTimeUser

  if $scope.showNewUserWizard
    headerService.hideNav()
  else
    headerService.showNav()

  UnitRole.query (roles) ->
    $scope.unitRoles = roles
    hasRoles = true
    unless $scope.showNewUserWizard
      testSingleProjectRole()

  Project.query (projects) ->
    $scope.projects = projects
    hasProjects = true
    unless $scope.showNewUserWizard
      testSingleProjectRole()

  if currentUser.role isnt 'Student'
    Unit.query (units) ->
      $scope.units = units

  $scope.unit = (unitId) ->
    _.findWhere($scope.units, {id: unitId})

  headerService.clearMenus()

  $scope.currentUser = currentUser
  #
  # Filter functions to separate units in repeater
  #
  $scope.isTutor = (unitRole) ->
    unitRole.role == "Tutor"
  $scope.isConvenor = (unitRole) ->
    unitRole.role == "Convenor"
)
.directive('newUserWizard', ->
  restrict: 'E'
  templateUrl: 'home/new-user-wizard.tpl.html'
  scope:
    optInOnly: '=?'
  controller: ($scope, $state, $q, User, Project, gradeService, currentUser, alertService, auth) ->
    Project.query (projects) ->
      $scope.projects = projects
    $scope.currentStep = if $scope.optInOnly then 4 else 0
    $scope.user = {
      first_name: if $scope.optInOnly then currentUser.profile.first_name,
      last_name: if $scope.optInOnly then currentUser.profile.last_name,
      nickname: if $scope.optInOnly then currentUser.profile.nickname,
      email: if $scope.optInOnly then currentUser.profile.email,
      receive_feedback_notifications: if $scope.optInOnly then currentUser.profile.receive_feedback_notifications,
      receive_portfolio_notifications: if $scope.optInOnly then currentUser.profile.receive_portfolio_notifications,
      receive_task_notifications: if $scope.optInOnly then currentUser.profile.receive_task_notifications,
      opt_in_to_research: if $scope.optInOnly then currentUser.profile.opt_in_to_research
    }
    $scope.moveStep = (skip) ->
      # if about to enter grade step and no grades? skip twice
      if $scope.projects.length is 0
        if skip is 1 and $scope.currentStep is 2
          skip += 1
        else if skip is -1 and $scope.currentStep is 4
          skip -= 1
      $scope.currentStep += skip

    $scope.gradeAcronyms = gradeService.gradeAcronyms
    $scope.grades        = gradeService.grades

    $scope.steps = [
      {
        title:    "What's your name?"
        subtitle: "We will need a name to help identify you on Doubtfire."
        icon:     'fa-pencil-square-o'
      },
      {
        title:    "Do you have a preferred name or nickname?"
        subtitle: "If you'll find it easier for your tutor to call you another name please let us know!"
        icon:     'fa-smile-o'
      },
      {
        title:    "How would you like us to email you?"
        subtitle: "Based on your preferences, we will email you as frequently as you'd like us to."
        icon:     'fa-envelope'
      },
      {
        title:    "What grades are you aiming for?"
        subtitle: "We noticed you are enrolled in the following subject(s). Select your target grade for each."
        icon:     'fa-trophy'
      },
      {
        title:    "Would you like to help us make Doubtfire better?"
        subtitle: "We would like to anonymously use your Doubtfire usage for research in making Doubtfire better."
        icon:     'fa-line-chart'
      }
    ]

    $scope.determineDisabledForCurrentStep = ->
      switch $scope.currentStep
        when 0
          state = $scope.user.first_name?.trim().length > 0 and $scope.user.last_name?.trim().length > 0
        when 1
          state = true
        when 2
          state =
            $scope.user.email?.trim().length > 0 and
            _.isBoolean($scope.user.receive_feedback_notifications) and
            _.isBoolean($scope.user.receive_portfolio_notifications) and
            _.isBoolean($scope.user.receive_task_notifications)
        when 3
          state = true
        when 4
          state = _.isBoolean($scope.user.opt_in_to_research)
      not state

    $scope.done = ->
      promises = []
      errorFn = (response) ->
        console.log response
        alertService.add("danger", "Error: " + response.data.error, 6000)
      # update projects
      for project in $scope.projects
        promises.push Project.update(null, { id: project.project_id, target_grade: project.target_grade }, null, errorFn).$promise
      # user update
      promises.push User.update(null, { id: currentUser.id, user: $scope.user }, ((user) -> currentUser.profile = user), errorFn).$promise
      $q.all(promises).then ->
        auth.saveCurrentUser()
        $state.go('home', {}, { reload: true })
)
