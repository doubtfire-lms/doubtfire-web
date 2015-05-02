angular.module("doubtfire.projects", [
  'doubtfire.units.partials'
  'doubtfire.projects.partials'
]
).config(($stateProvider) ->

  $stateProvider.state("projects#show",
    url: "/projects/:projectId?unitRole"
    views:
      main:
        controller: "ProjectsShowCtrl"
        templateUrl: "projects/projects-show.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/header.tpl.html"

    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  )
  $stateProvider.state("projects#progress",
    url: "/projects/:projectId/progress?authToken"
    views:
      main:
        controller: "ProjectsShowCtrl"
        templateUrl: "projects/projects-progress.tpl.html"
    data:
      pageTitle: "_Home_"
      # roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  )
  $stateProvider.state("projects#feedback",
    url: "/projects/:projectId/:viewing/:showTaskId"
    views:
      main:
        controller: "ProjectsShowCtrl"
        templateUrl: "projects/projects-show.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/header.tpl.html"
    data:
      pageTitle: "_Home_"
      # roleWhitelist: ['Student', 'Tutor', 'Convenor', 'Admin']
  )
)
.controller("ProjectsShowCtrl", ($scope, $state, $stateParams, Project, UnitRole, headerService, alertService, taskService, unitService, currentUser) ->
  if $stateParams.authToken?
    $scope.message = $stateParams.authToken
    currentUser.authenticationToken = $stateParams.authToken

  $scope.unitLoaded = false
  $scope.studentProjectId = $stateParams.projectId
  $scope.projectLoaded = false

  Project.get { id: $scope.studentProjectId }, (project) ->
    # Clear any page-specific menus
    headerService.clearMenus()

    # Provide access to the Project's details
    $scope.project = project # the selected unit role

    $scope.submittedTasks = []

    if project
      unitService.getUnit project.unit_id, false, false, (unit) ->
        $scope.unit = unit # the unit related to the role
        unit.extendStudent project
        $scope.tasks = project.tasks

        # $scope.submittedTasks = _.filter($scope.tasks, (task) -> _.contains(['ready_to_mark', 'discuss', 'complete', 'fix_and_resubmit', 'fix_and_include', 'redo'], task.status))
        # $scope.submittedTasks = _.filter($scope.tasks, (task) -> task.has_pdf )
        $scope.submittedTasks = _.sortBy($scope.tasks, (t) -> t.task_abbr).reverse()
        $scope.unitLoaded = true

      if $stateParams.unitRole?
        UnitRole.get { id: $stateParams.unitRole }, (unitRole) ->
          if unitRole.unit_id == project.unit_id
            $scope.assessingUnitRole = unitRole

      $scope.burndownData = project.burndown_chart_data
      $scope.projectLoaded = true
  # end get project

  #
  # Switcher to task view
  #
  $scope.activeTab =
    progress: true
    feedback: false
    lablist: false
    portfolio: false
  $scope.showTaskView = (task) ->
    if not (task or $scope.selectedTask)
      task = $scope.submittedTasks[0]
    else if not task and $scope.selectedTask
      task = $scope.selectedTask

    $scope.activeTab[1] = true
    $scope.activeTab[0] = $scope.activeTab[2] = $scope.activeTab[3] = false
    $scope.selectedTask = task
)