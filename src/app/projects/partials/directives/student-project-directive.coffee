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
    fullscreen: '=?'
  controller: ($scope, $state, Project, UnitRole, headerService, alertService, taskService, unitService, projectService) ->
    if $scope.unit?
      $scope.taskDefinition = taskService.taskDefinitionFn($scope.unit)

    $scope.showTaskView = (task) ->
      if not (task or $scope.project.selectedTask)
        task = _.find _.sortBy($scope.project.tasks, 'seq'), (t) -> $scope.taskDefinition(t).target_grade <= $scope.project.target_grade
      else if not task and $scope.project.selectedTask
        task = $scope.project.selectedTask

      $scope.activeTab[1] = true
      $scope.activeTab[0] = $scope.activeTab[2] = $scope.activeTab[3] = false
      $scope.project.selectedTask = task

    #
    # Switcher to task view
    #
    $scope.activeTab =
      0:   ! $scope.unitRole? #progress
      1:   $scope.unitRole?   #feedback
      2:   false              #tutorial
      3:   false              #group
      4:   false              #portfolio

    #
    # Get the project, which loads all subsequent views whenever the project
    # id changes
    #
    $scope.$watch 'project', (newId) ->
      # $scope.projectLoaded = false
      projectService.fetchDetailsForProject($scope.project, $scope.unit, (project) ->
        if project && ! $scope.unit?
          unitService.getUnit project.unit_id, false, false, (unit) ->
            $scope.unit = unit # the unit related to the role
            unit.extendStudent project

            $scope.taskDefinition = taskService.taskDefinitionFn($scope.unit)
            selectProjectTask(project)
            $scope.unitLoaded = true
        else if $scope.unit?
          $scope.unitLoaded = true
          selectProjectTask(project)
      )

    selectProjectTask = (project) ->
      filteredTasks = _.select project.tasks, (t) -> $scope.taskDefinition(t).target_grade <= project.target_grade
      filteredTasks = _.sortBy filteredTasks, (t) -> t.definition.seq

      $scope.projectLoaded = true

      # no tasks so dont try to select a task
      if filteredTasks.length > 0
        # Show task if in url
        if $scope.showTaskId?
          task = _.find filteredTasks, (task) -> task.id == $scope.showTaskId
          if task?
            $scope.project.selectedTask = task
        else
          # Show the first interesting task
          if $scope.assessingUnitRole?
            # Find first task that is Ready To Mark or Need Help
            t = _.find filteredTasks, (t) -> t.status == 'need_help' || t.status == 'ready_to_mark'
            if not t? # else find discuss
              t = _.find filteredTasks, (t) -> t.status == 'discuss'
            if not t? # else find resubmit or redo
              t = _.find filteredTasks, (t) -> t.status == 'redo' || t.status == 'fix_and_resubmit' || t.status == 'fix_and_include'
            if not t? # else find working on it
              t = _.find filteredTasks, (t) -> t.status == 'working_on_it'
            if not t? # else find not_submitted
              t = _.find filteredTasks, (t) -> t.status == 'not_submitted'
            $scope.project.selectedTask = t
          else # student... go to task they are working on
            t = _.find filteredTasks, (t) -> t.status == 'working_on_it'
            if not t? # else find resubmit or redo
              t = _.find filteredTasks, (t) -> t.status == 'redo' || t.status == 'fix_and_resubmit'
            if not t? # else find not_submitted
              t = _.find filteredTasks, (t) -> t.status == 'not_submitted'
            $scope.project.selectedTask = t

        if not $scope.project.selectedTask?
          $scope.project.selectedTask = filteredTasks[0]
      else # no tasks for student!
        $scope.project.selectedTask = null
      # end if filtered tasks
)