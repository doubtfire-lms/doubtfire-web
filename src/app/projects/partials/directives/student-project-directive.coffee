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
  controller: ($scope, $state, Visualisation, Project, UnitRole, headerService, alertService, taskService, unitService, projectService, analyticsService) ->
    if $scope.unit?
      $scope.taskDefinition = taskService.taskDefinitionFn($scope.unit)

    refreshCharts = Visualisation.refreshAll

    showTaskView = (task) ->
      if not (task or $scope.project.selectedTask)
        task = _.find _.sortBy($scope.project.tasks, 'seq'), (t) -> $scope.taskDefinition(t).target_grade <= $scope.project.target_grade
      else if not task and $scope.project.selectedTask
        task = $scope.project.selectedTask

      $scope.activeTab = $scope.tabs.tasksTab
      $scope.project.selectedTask = task

    #
    # Switcher to task view
    #
    $scope.tabs =
      progressTab:
        title:            'Progress'
        icon:             'fa-line-chart'
        seq:              0
      tasksTab:
        title:            'Tasks'
        icon:             'fa-tasks'
        seq:              1
      tutorialTab:
        title:            'Tutorials'
        icon:             'fa-pencil'
        seq:              2
      groupTab:
        title:            'Groups'
        icon:             'fa-group'
        seq:              3
      learningOutcomeTab:
        title:            'Learning Outcomes'
        icon:             'fa-graduation-cap'
        seq:              4
      portfolioTab:
        title:            'Portfolio'
        icon:             'fa-book'
        seq:              5

    # Set the active tab
    $scope.setActiveTab = (tab) ->
      $scope.activeTab.active = false
      $scope.activeTab = tab
      $scope.activeTab.active = true
      # Actions to take when selecting this tab
      switch tab
        when $scope.tabs.progressTab, $scope.tabs.learningOutcomeTab
          refreshCharts()
        when $scope.tabs.tasksTab
          showTaskView()
      analyticsService.event 'Student Feedback Views', "Switched Tab as #{$scope.unitRole.role}", "#{tab.title} Tab"

    # Kill tabs that aren't applicable
    cleanupTabs = ->
      # Set the active tab if it isn't yet set
      unless $scope.activeTab?
        $scope.activeTab = $scope.tabs.progressTab
      # Kill tabs on conditions (think ng-if to show tabs on conditions)
      unless $scope.unit?.task_outcome_alignments.length > 0
        delete $scope.tabs.learningOutcomeTab
      unless $scope.unit?.group_sets.length > 0
        delete $scope.tabs.groupTab

    # Show the *right* tabs when unit is loaded
    $scope.$watch 'unitLoaded', (newValue) ->
      cleanupTabs() if newValue is true

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
              t = _.find filteredTasks, (t) -> t.status == 'discuss' || t.status == 'demonstrate'
            if not t? # else find resubmit or redo
              t = _.find filteredTasks, (t) -> t.status == 'redo' || t.status == 'fix_and_resubmit'
            if not t? # else find working on it
              t = _.find filteredTasks, (t) -> t.status == 'working_on_it'
            if not t? # else find not_started
              t = _.find filteredTasks, (t) -> t.status == 'not_started'
            $scope.project.selectedTask = t
          else # student... go to task they are working on
            t = _.find filteredTasks, (t) -> t.status == 'working_on_it'
            if not t? # else find resubmit or redo
              t = _.find filteredTasks, (t) -> t.status == 'redo' || t.status == 'fix_and_resubmit'
            if not t? # else find not_started
              t = _.find filteredTasks, (t) -> t.status == 'not_started'
            $scope.project.selectedTask = t

        if not $scope.project.selectedTask?
          $scope.project.selectedTask = filteredTasks[0]
      else # no tasks for student!
        $scope.project.selectedTask = null
      # end if filtered tasks
)
