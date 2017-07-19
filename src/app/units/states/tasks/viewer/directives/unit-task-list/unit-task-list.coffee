angular.module('doubtfire.units.states.tasks.viewer.directives.unit-task-list', [])

.directive('unitTaskList', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/viewer/directives/unit-task-list/unit-task-list.tpl.html'
  scope:
    unit: '='
    # Function to invoke to refresh tasks
    refreshTasks: '=?'
    # Special taskData object (wraps the selectedTask)
    taskData: '='
  controller: ($scope, $timeout, $filter, gradeService, taskService) ->
    # Check taskSource exists
    unless $scope.taskData?
      throw Error "Invalid taskData provided. Must wrap the selectedTask and selectedTaskAbbr"
    # Set up initial filtered tasks
    $scope.filteredTasks = []
    # Set up filters
    $scope.filters = {
      taskDefinition: null,
      taskName:null
    }
    # Sets new filteredTasks variable
    applyFilters = ->
      filteredTasks = $filter('tasksOfTaskDefinition')($scope.taskData.source, $scope.filters.taskDefinition)
      filteredTasks = $filter('orderBy')(filteredTasks, 'task.seq')
      $scope.filteredTasks = filteredTasks
    # Apply filters first-time
    applyFilters()
    # When refreshing tasks, we are just reloading the active tasks
    $scope.refreshTasks = applyFilters
    # Expose grade service names
    $scope.gradeNames = gradeService.grades
    # On task name change, reapply filters
    $scope.taskNameChanged = applyFilters
    # UI call to change currently selected task
    $scope.setSelectedTask = (task) ->
      # Clicking on already selected task will disable that selection
      task = null if $scope.isSelectedTask(task)
      $scope.taskData.selectedTask = task
      scrollToTaskInList(task) if task?
    scrollToTaskInList = (task) ->
      taskEl = document.querySelector("unit-task-list ##{task.taskKeyToIdString()}")
      return unless taskEl?
      funcName = if taskEl.scrollIntoViewIfNeeded? then 'scrollIntoViewIfNeeded' else if taskEl.scrollIntoView? then 'scrollIntoView'
      return unless funcName?
      taskEl[funcName]({behavior: 'smooth', block: 'top'})
    $timeout ->
      scrollToTaskInList($scope.taskData.selectedTask) if $scope.taskData.selectedTask?
    $scope.isSelectedTask = (task) ->
      # Compare by definition
      task.id == $scope.taskData?.selectedTask?.id

)