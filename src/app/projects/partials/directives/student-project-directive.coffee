angular.module("doubtfire.projects.student-project-directive", [
  'doubtfire.units.partials'
  'doubtfire.projects.partials'
])
.directive("studentProject", ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/student-project-directive.tpl.html'
  scope:
    projectId: '='
    showTaskId: '=?' # pass in a task to initially show
    unitRole: '=?' # pass in a unitRole who is viewing this project
    project: '=?' # to bind project to outer-scope
    unit: '=?' # to bind unit to outer-scope
    assessingUnitRole: '=?' # to bind assessingUnitRole to outer-scope
  controller: ($scope, $state, Project, UnitRole, headerService, alertService, taskService, unitService, projectService) ->

    $scope.showTaskView = (task) ->
      if not (task or $scope.selectedTask)
        task = _.find _.sortBy($scope.submittedTasks, 'seq'), (t) -> t.definition.target_grade <= $scope.project.target_grade
      else if not task and $scope.selectedTask
        task = $scope.selectedTask

      $scope.activeTab[1] = true
      $scope.activeTab[0] = $scope.activeTab[2] = $scope.activeTab[3] = false
      $scope.selectedTask = task


    #
    # Get the project, which loads all subsequent views whenever the project
    # id changes
    #
    $scope.$watch 'projectId', (newId) ->
      $scope.unitLoaded = false
      $scope.projectLoaded = false

      #
      # Switcher to task view
      #
      $scope.activeTab =
        progress:   true
        feedback:   false
        groups:     false
        lablist:    false
        portfolio:  false

      Project.get { id: newId }, (project) ->
        # Clear any page-specific menus
        headerService.clearMenus()

        # Provide access to the Project's details
        $scope.project = project # the selected unit role

        $scope.submittedTasks = []

        console.log 1

        if project
          unitService.getUnit project.unit_id, false, false, (unit) ->

            console.log 2

            $scope.unit = unit # the unit related to the role
            unit.extendStudent project
            $scope.tasks = project.tasks
            $scope.submittedTasks = _.sortBy($scope.tasks, (t) -> t.task_abbr).reverse()

            console.log 3

            #
            # Show task if in url
            #
            if $scope.showTaskId?
              task = _.find $scope.submittedTasks, (task) -> task.id == $scope.showTaskId
              $scope.showTaskView(task)

            console.log 4

            $scope.unitLoaded = true

          if $scope.unitRole?
            UnitRole.get { id: $scope.unitRole }, (unitRole) ->
              if unitRole.unit_id == project.unit_id
                $scope.assessingUnitRole = unitRole

          $scope.burndownData = project.burndown_chart_data
          $scope.projectLoaded = true
    # end get project
)