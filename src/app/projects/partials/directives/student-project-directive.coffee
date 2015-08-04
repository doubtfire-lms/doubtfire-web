angular.module("doubtfire.projects.student-project-directive", [
  'doubtfire.units.partials'
  'doubtfire.projects.partials'
])
.directive("studentProject", ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/student-project-directive.tpl.html'
  scope:
    showTaskId: '=?' # pass in a task to initially show
    unitRole: '=?' # pass in a unitRole who is viewing this project
    project: '=?' # to bind project to outer-scope
    unit: '=?' # to bind unit to outer-scope
    assessingUnitRole: '=?' # to bind assessingUnitRole to outer-scope
  controller: ($scope, $state, Project, UnitRole, headerService, alertService, taskService, unitService, projectService) ->
    if $scope.unit?
      $scope.taskDefinition = taskService.taskDefinitionFn($scope.unit)

    $scope.showTaskView = (task) ->
      if not (task or $scope.selectedTask)
        task = _.find _.sortBy($scope.project.tasks, 'seq'), (t) -> $scope.taskDefinition(t).target_grade <= $scope.project.target_grade
      else if not task and $scope.selectedTask
        task = $scope.selectedTask

      $scope.activeTab[1] = true
      $scope.activeTab[0] = $scope.activeTab[2] = $scope.activeTab[3] = false
      $scope.selectedTask = task

    #
    # Switcher to task view
    #
    $scope.activeTab =
      progress:   ! $scope.assessingUnitRole?
      feedback:   $scope.assessingUnitRole?
      groups:     false
      lablist:    false
      portfolio:  false

    #
    # Get the project, which loads all subsequent views whenever the project
    # id changes
    #
    $scope.$watch 'project', (newId) ->
      # $scope.projectLoaded = false
      projectService.fetchDetailsForProject($scope.project, $scope.unit, (project) ->
        if project && ! $scope.unit?
          unitService.getUnit project.unit_id, false, false, (unit) ->
            console.log 2

            $scope.unit = unit # the unit related to the role
            unit.extendStudent project

            $scope.unitLoaded = true
            $scope.taskDefinition = taskService.taskDefinitionFn($scope.unit)
            showProjectTasks(project)
        else if $scope.unit?
          $scope.unitLoaded = true
          showProjectTasks(project)
      )

    showProjectTasks = (project) ->
      filteredTasks = _.select project.tasks, (t) -> $scope.taskDefinition(t).target_grade <= project.target_grade
      $scope.projectLoaded = true

      # no tasks so dont try to select a task
      if filteredTasks.length > 0
        $scope.showTaskView(filteredTasks[0])

        # Show task if in url
        if $scope.showTaskId?
          task = _.find filteredTasks, (task) -> task.id == $scope.showTaskId
          if task?
            return $scope.showTaskView(task)
        else
          # Show the first interesting task
          if $scope.assessingUnitRole?
            # Find first task that is Ready To Mark or Need Help
            t = _.find filteredTasks, (t) -> t.status == 'need_help' || t.status == 'ready_to_mark'
            return $scope.showTaskView(t)
      else
        selectedTask = null
      # end if filtered tasks



      #     if $scope.unitRole?
      #       UnitRole.get { id: $scope.unitRole }, (unitRole) ->
      #         if unitRole.unit_id == project.unit_id
      #           $scope.assessingUnitRole = unitRole

      #     $scope.project.burndown_chart_data = project.burndown_chart_data
      #     $scope.projectLoaded = true
    # end get project
)