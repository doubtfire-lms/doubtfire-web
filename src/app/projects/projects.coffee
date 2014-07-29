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
)
.controller("ProjectsShowCtrl", ($scope, $state, $stateParams, Project, Unit, UnitRole, headerService, alertService) ->
  $scope.unitLoaded = false
  $scope.studentProjectId = $stateParams.projectId
  $scope.projectLoaded = false
      
  #
  # Allow the caller to fetch a task definition from the unit based on its id
  #
  $scope.taskDef = (taskDefId) ->
    _.where $scope.unit.task_definitions, {id: taskDefId}

  Project.get { id: $scope.studentProjectId }, (project) ->
    
    # Clear any page-specific menus
    headerService.clearMenus()
    
    # Provide access to the Project's details
    $scope.project = project # the selected unit role
    
    # Set the roles in the header
    # links = []
    # if project
    #   links.push { class: "active", url: "#/projects/?unitRole=" + unitRole.id, name: unitRole.role }
      
    #   for other_role in unitRole.other_roles
    #     links.push { class: "", url: "#/units?unitRole=" + other_role.id, name: other_role.role }

    # headerService.setLinks( links )
    $scope.submittedTasks = []
    
    if project
      Unit.get { id: project.unit_id }, (unit) ->
        $scope.unit = unit # the unit related to the role
        #
        # NOTE This must be used AFTER we have loaded the unit...
        # otherwise we don't have access to the task definitions
        # as we haven't loaded in the unit yet!
        # Extend the tasks with the task definitions
        # - add in task abbreviation, description, name, and status
        #
        $scope.tasks = $scope.project.tasks.map (task) ->
          td = $scope.taskDef(task.task_definition_id)[0]
          task.task_abbr = td.abbr
          task.task_desc = td.desc
          task.task_name = td.name
          task.task_upload_requirements = td.upload_requirements
          task.status_txt = statusLabels[task.status]
          task
        $scope.submittedTasks = _.filter($scope.tasks, (task) -> _.contains(['ready_to_mark', 'discuss', 'complete', 'fix_and_resubmit', 'fix_and_include', 'redo'], task.status))
        $scope.submittedTasks = _.sortBy($scope.submittedTasks, (t) -> t.task_abbr).reverse()
        $scope.unitLoaded = true


      if $stateParams.unitRole?
        UnitRole.get { id: $stateParams.unitRole }, (unitRole) ->
          if unitRole.unit_id == $scope.unit.id
            $scope.assessingUnitRole = unitRole
      
      $scope.burndownData = project.burndown_chart_data
      $scope.projectLoaded = true

  # end get project
)