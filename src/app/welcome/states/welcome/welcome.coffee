angular.module('doubtfire.welcome.states.welcome', [])

.config(($stateProvider) ->
  welcomeStateData =
    url: "/welcome?optInOnly"
    views:
      main:
        controller: "WelcomeCtrl"
        templateUrl: "welcome/states/welcome/welcome.tpl.html"
    data:
      pageTitle: "_Welcome to Doubtfire_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  $stateProvider.state 'welcome', welcomeStateData
)

.controller('WelcomeCtrl', ($scope, $state, $stateParams, $q, DoubtfireConstants, User, Project, projectService, gradeService, alertService, analyticsService, GlobalStateService, newUserService) ->

  GlobalStateService.setView('OTHER')
  # Define steps for wizard
  # MUST ADD TO ABOVE NOTE!
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
    studentIdStep: {
      title:    "What is your Student ID?"
      subtitle: "Please enter your Student ID number that is allocated by your institution."
      seq:      2
    }
    avatarStep: {
      title:    "Give yourself an avatar"
      subtitle: "Set your avatar using Gravatar to help you be identified on Doubtfire."
      seq:      3
    }
    emailStep: {
      title:    "How would you like us to email you?"
      subtitle: "Based on your preferences, we will email you as frequently as you'd like us to."
      seq:      4
    },
    targetGradeStep: {
      title:    "What grades are you aiming for?"
      subtitle: "We noticed you are enrolled in the following subject(s)."
      seq:      5
    },
    optInToResearchStep: {
      title:    "Would you like to help us make Doubtfire better?"
      subtitle: "We would like to anonymously use your Doubtfire usage for research in making Doubtfire better."
      seq:      6
    }
  }
  # Alises to first and last step
  $scope.firstStep = _.find $scope.steps, { seq: 0 }
  $scope.lastStep  = _.find $scope.steps, { seq: _.keys($scope.steps).length - 1 }
  # Skip to opt in if opt in step only
  $scope.currentStep = if $scope.optInOnly then $scope.steps.optInToResearchStep else $scope.firstStep

  $scope.user = newUserService.currentUser

  # If using opt in, we don't need a blank slate user, except ensure that
  # opt in is null
  if $scope.optInOnly
    $scope.user.optInToResearch = null

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
        state = $scope.user.firstName?.trim().length > 0 and $scope.user.lastName?.trim().length > 0
      when $scope.steps.nicknameStep, $scope.steps.targetGradeStep, $scope.steps.avatarStep
        state = true
      when $scope.steps.studentIdStep
        state = $scope.user.student_id?.trim().length > 0
      when $scope.steps.emailStep
        state = $scope.user.email?.trim().length > 0
        state =
          state &&
          _.isBoolean($scope.user.receiveFeedbackNotifications) &&
          _.isBoolean($scope.user.receivePortfolioNotifications) &&
          _.isBoolean($scope.user.receiveTaskNotifications)
      when $scope.steps.optInToResearchStep
        state = _.isBoolean($scope.user.optInToResearch)
    not state

  # POST changes to API
  $scope.done = (user) ->
    user = if user? then user else $scope.user
    promises = []
    errorFn = (response) ->
      alertService.add("danger", "Error: " + response.data.error, 6000)
    # update projects
    for project in $scope.projects
      promises.push Project.update(null, { id: project.id, targetGrade: project.targetGrade }, null, errorFn).$promise
    # user update
    user.hasRunFirstTimeSetup = true
    promises.push newUserService.update(user, ((user) -> ), errorFn).$promise
    $q.all(promises).then ->
      $state.go('home')

  $scope.userFirstName = $scope.user.firstName

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

    # Get projects for target grades
  projectService.getProjects false, (projects) ->
    $scope.projects = projects
    # Only ask for student ID if learning subjects!
    if projects.length == 0 && $scope.user.role != 'Student'
      $scope.isStaff = true
      $scope.user.studentId = null
      delete $scope.steps.studentIdStep
      # NOTE: Must add step to below
      for step in ['emailStep', 'targetGradeStep', 'avatarStep', 'optInToResearchStep']
        $scope.steps[step].seq -= 1
      $scope.steps.nicknameStep.subtitle = $scope.steps.nicknameStep.subtitle.replace('tutor', 'students')
)
