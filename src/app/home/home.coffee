angular.module("doubtfire.home", [])
.config((headerServiceProvider) ->
  homeStateData =
    url: "/home?notifications"
    views:
      main:
        controller: "HomeCtrl"
        templateUrl: "home/index.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  headerServiceProvider.state 'home', homeStateData
)

.controller("HomeCtrl", ($scope, $state, $stateParams, $modal, User, Unit, headerService, currentUser, unitService, projectService, $rootScope, analyticsService) ->
  analyticsService.event 'Home', 'Viewed Home page'

  hasRoles = false
  hasProjects = false

  testSingleProjectRole = () ->
    if not (hasRoles && hasProjects)
      return
    if $scope.unitRoles.length + $scope.projects.length == 1
      if $scope.projects.length == 1
        analyticsService.event 'Home', 'Switched to project on single unit'
        $state.go 'projects#show', {projectId: $scope.projects[0].project_id}
      else if $scope.unitRoles.length == 1
        analyticsService.event 'Home', 'Switched to unit on single unit'
        $state.go 'units#show', {unitRole: $scope.unitRoles[0].id}

  firstTimeUser     = currentUser.profile.has_run_first_time_setup is false
  userHasNotOptedIn = currentUser.profile.opt_in_to_research is null

  $scope.showNewUserWizard = firstTimeUser or userHasNotOptedIn
  $scope.userHasNotOptedIn = userHasNotOptedIn and not firstTimeUser

  if $scope.showNewUserWizard
    headerService.hideHeader()
  else
    headerService.showHeader()

  unitService.getUnitRoles (roles) ->
    $scope.unitRoles = roles
    hasRoles = true
    unless $scope.showNewUserWizard
      testSingleProjectRole()

  projectService.getProjects (projects) ->
    $scope.projects = projects
    hasProjects = true
    unless $scope.showNewUserWizard
      testSingleProjectRole()

  if currentUser.role isnt 'Student'
    Unit.query (units) ->
      $scope.units = units

  $scope.unit = (unitId) ->
    _.find($scope.units, {id: unitId})

  headerService.clearMenus()

  $scope.currentUser = currentUser
  #
  # Filter functions to separate units in repeater
  #
  $scope.isTutor = (unitRole) ->
    unitRole.role == "Tutor"
  $scope.isConvenor = (unitRole) ->
    unitRole.role == "Convenor"

  monthNames = [
    "Jan", "Feb", "Mar",
    "Apr", "May", "Jun", "Jul",
    "Aug", "Sep", "Oct",
    "Nov", "Dec"
  ]

  $scope.showDate = (dateValue) ->
    date = new Date(dateValue)
    "#{monthNames[date.getMonth()]} #{date.getFullYear()}"
)
.directive('newUserWizard', ->
  restrict: 'E'
  templateUrl: 'home/new-user-wizard.tpl.html'
  scope:
    optInOnly: '=?'
  controller: ($scope, $state, $q, User, Project, projectService, gradeService, currentUser, alertService, analyticsService, auth) ->
    # Get projects for target grades
    projectService.getProjects (projects) ->
      $scope.projects = projects
    # Define steps for wizard
    $scope.steps = {
      nameStep: {
        title:    "What's your name?"
        subtitle: "We will need a name to help identify you on Doubtfire."
        icon:     'fa-pencil-square-o'
        seq:      0
      },
      nicknameStep: {
        title:    "Do you have a preferred name or nickname?"
        subtitle: "If you'll find it easier for your tutor to call you another name please let us know!"
        icon:     'fa-smile-o'
        seq:      1
      },
      emailStep: {
        title:    "How would you like us to email you?"
        subtitle: "Based on your preferences, we will email you as frequently as you'd like us to."
        icon:     'fa-envelope'
        seq:      2
      },
      targetGradeStep: {
        title:    "What grades are you aiming for?"
        subtitle: "We noticed you are enrolled in the following subject(s). Select your target grade for each."
        icon:     'fa-trophy'
        seq:      3
      },
      optInToResearchStep: {
        title:    "Would you like to help us make Doubtfire better?"
        subtitle: "We would like to anonymously use your Doubtfire usage for research in making Doubtfire better."
        icon:     'fa-line-chart'
        seq:      4
      }
    }
    # Alises to first and last step
    $scope.firstStep = _.find $scope.steps, { seq: 0 }
    $scope.lastStep  = _.find $scope.steps, { seq: _.keys($scope.steps).length - 1 }
    # Skip to opt in if opt in step only
    $scope.currentStep = if $scope.optInOnly then $scope.steps.optInToResearchStep else $scope.firstStep
    # If using opt in, we don't need a blank slate user, except ensure that
    # opt in is null
    if $scope.optInOnly
      $scope.user = currentUser.profile
      $scope.user.opt_in_to_research = null
    else
      firstName = null
      lastName = null
      email = null
      unless currentUser.profile.first_name.toLowerCase() is 'first name' or currentUser.profile.last_name.toLowerCase() is 'last name'
        firstName = currentUser.profile.first_name
        lastName = currentUser.profile.last_name
        email = currentUser.profile.email
      $scope.user = {
        first_name: firstName
        last_name: lastName
        nickname: null
        email: email
        receive_feedback_notifications: null
        receive_portfolio_notifications: null
        receive_task_notifications: null
        opt_in_to_research: null
        has_run_first_time_setup: true
      }
    # Progress through wizard
    $scope.moveStep = (skip) ->
      # if about to enter grade step and no grades? skip twice
      if $scope.projects.length is 0
        stepBeforeTargetStep = _.find $scope.steps, { seq: $scope.steps.targetGradeStep.seq - 1 }
        stepAfterTargetStep = _.find $scope.steps, { seq: $scope.steps.targetGradeStep.seq + 1 }
        if skip is 1 and $scope.currentStep is stepBeforeTargetStep
          skip += 1
        else if skip is -1 and $scope.currentStep is stepAfterTargetStep
          skip -= 1
      $scope.currentStep = _.find $scope.steps, { seq: $scope.currentStep.seq + skip }
    # Alises for grade step
    $scope.gradeAcronyms = gradeService.gradeAcronyms
    $scope.grades        = gradeService.grades
    # Determine if 'next' is disabled (i.e., validity for each step)
    $scope.determineDisabledForCurrentStep = ->
      switch $scope.currentStep
        when $scope.steps.nameStep
          state = $scope.user.first_name?.trim().length > 0 and $scope.user.last_name?.trim().length > 0
        when $scope.steps.nicknameStep, $scope.steps.targetGradeStep
          state = true
        when $scope.steps.emailStep
          state =
            $scope.user.email?.trim().length > 0 and
            _.isBoolean($scope.user.receive_feedback_notifications) and
            _.isBoolean($scope.user.receive_portfolio_notifications) and
            _.isBoolean($scope.user.receive_task_notifications)
        when $scope.steps.optInToResearchStep
          state = _.isBoolean($scope.user.opt_in_to_research)
      not state
    # POST changes to API
    $scope.done = (user) ->
      user = if user? then user else $scope.user
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
        analyticsService.event "Doubtfire Analytics", "User opted in research" if $scope.user.opt_in_to_research
        auth.saveCurrentUser()
        $state.go('home', {}, { reload: true })
)
