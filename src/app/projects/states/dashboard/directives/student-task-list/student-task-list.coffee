angular.module('doubtfire.projects.states.dashboard.directives.student-task-list', [])
#
# View a list of tasks
#
.directive('studentTaskList', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/student-task-list/student-task-list.tpl.html'
  scope:
    project: '='
    # Special taskData object (wraps the selectedTask)
    taskData: '='
  controller: ($scope, $filter, gradeService) ->
    # Check taskSource exists
    unless $scope.taskData?
      throw Error "Invalid taskData provided. Must wrap the selectedTask and selectedTaskAbbr"
    # Set up initial filtered tasks
    $scope.filteredTasks = []
    # Set up filters
    $scope.filters = {
      taskName: null
    }
    # Sets new filteredTasks variable
    applyFilters = ->
      filteredTasks = $filter('tasksWithName')($scope.project.activeTasks(), $scope.filters.taskName)
      filteredTasks = $filter('orderBy')(filteredTasks, 'definition.seq')
      $scope.filteredTasks = filteredTasks
    # Apply filters first-time
    applyFilters()
    # Expose grade service names
    $scope.gradeNames = gradeService.grades
    # On task name change, reapply filters
    $scope.taskNameChanged = applyFilters
    # UI call to change currently selected task
    $scope.setSelectedTask = (task) ->
      $scope.taskData.selectedTask = task
      $scope.taskData.onSelectedTaskChange?(task)
      scrollToTaskInList(task) if task?
    scrollToTaskInList = (task) ->
      taskEl = document.querySelector("student-task-list ##{task.taskKeyToIdString()}")
      return unless taskEl?
      funcName = if taskEl.scrollIntoViewIfNeeded? then 'scrollIntoViewIfNeeded' else if taskEl.scrollIntoView? then 'scrollIntoView'
      return unless funcName?
      taskEl[funcName]({behavior: 'smooth', block: 'top'})
    $scope.isSelectedTask = (task) ->
      # Compare by definition
      task.definition.id == $scope.taskData?.selectedTask?.definition.id
)
