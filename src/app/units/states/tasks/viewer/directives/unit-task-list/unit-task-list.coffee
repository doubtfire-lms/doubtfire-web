angular.module('doubtfire.units.states.tasks.viewer.directives.unit-task-list', [])

.directive('unitTaskList', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/viewer/directives/unit-task-list/unit-task-list.tpl.html'
  scope:
    unit: '='
    # Function to invoke to refresh tasks
    refreshTasks: '=?'
    unitTasks: '='
    selectedTask: '='
  controller: ($scope, $timeout, $filter, gradeService, taskService) ->
    # Set up initial filtered tasks
    $scope.filteredTasks = []
    # Set up filters
    $scope.filters = {
      taskDefinition: null,
      taskName:null
    }
    # Sets new filteredTasks variable
    applyFilters = ->
      filteredTasks = $filter('tasksOfTaskDefinition')($scope.unitTasks, $scope.filters.taskDefinition)
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
      $scope.selectedTask = task

    $scope.isSelectedTask = (task) ->
      # Compare by definition
      task.id == $scope.selectedTask?.id

)