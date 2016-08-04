mod = angular.module('doubtfire.home.states.new-user-wizard', [])

.config(($stateProvider) ->
  newUserWizardStateData =
    url: "/home#new-user-wizard?optInOnly"
    views:
      main:
        controller: "NewUserWizardCtrl"
        template: require('./new-user-wizard.tpl.html')
    data:
      pageTitle: "_Welcome to Doubtfire_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  $stateProvider.state 'new-user-wizard', newUserWizardStateData
)

.controller('NewUserWizardCtrl', ($scope, $state, $stateParams, $q, User, Project, projectService, gradeService, currentUser, alertService, analyticsService, auth) ->
  # Get projects for target grades
  projectService.getProjects (projects) ->
    $scope.projects = projects
  # Define steps for wizard
  $scope.steps = {
    nameStep: {
      title:    "What's your name?"
      subtitle: "We will need a name to help identify you on Doubtfire."
      seq:      0
    },
    nicknameStep: {
      title:    "Do you have a preferred name or nickname?"
      subtitle: "If you'll find it easier for your tutor to call you another name please let us know!"
      seq:      1
    },
    emailStep: {
      title:    "How would you like us to email you?"
      subtitle: "Based on your preferences, we will email you as frequently as you'd like us to."
      seq:      2
    },
    targetGradeStep: {
      title:    "What grades are you aiming for?"
      subtitle: "We noticed you are enrolled in the following subject(s)."
      seq:      3
    },
    optInToResearchStep: {
      title:    "Would you like to help us make Doubtfire better?"
      subtitle: "We would like to anonymously use your Doubtfire usage for research in making Doubtfire better."
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
      $state.go('home')

  $scope.userFirstName = currentUser.profile.first_name
)

module.exports = mod.name
