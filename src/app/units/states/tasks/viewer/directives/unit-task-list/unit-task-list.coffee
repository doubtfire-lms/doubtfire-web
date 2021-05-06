angular.module('doubtfire.units.states.tasks.viewer.directives.unit-task-list', [])

.directive('unitTaskList', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/viewer/directives/unit-task-list/unit-task-list.tpl.html'
  scope:
    unit: '='
    # Function to invoke to refresh tasks
    refreshTasks: '=?'
    unitTasks: '='
    selectedTaskDef: '='
  controller: ($scope, $timeout, $filter, gradeService, taskService, listenerService) ->
    listeners = listenerService.listenTo($scope)
    # Set up initial filtered tasks
    $scope.filteredTasks = []
    # Set up filters
    $scope.filters = {
      taskSearch:null
    }
    # Sets new filteredTasks variable
    applyFilters = ->
      filteredTasks = $filter('taskDefinitionName')($scope.unitTasks, $scope.filters.taskSearch)
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
      $scope.selectedTaskDef = task
    

    $scope.isSelectedTask = (task) ->
      # Compare by definition
      task.id == $scope.selectedTaskDef?.id
)