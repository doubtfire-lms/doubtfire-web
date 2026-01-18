angular.module('doubtfire.units.states.tasks.definition', [])

#
# Mark tasks by task definition ID
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/definition', {
    parent: 'units/tasks'
    url: '/definition/{taskKey:any}'

    # Use a dedicated template for definition state (still reuses inbox internally)
    templateUrl: "units/states/tasks/definition/definition.tpl.html"
    controller: "TaskDefinitionStateCtrl"

    params:
      taskKey: dynamic: true

    data:
      task: "Task Explorer"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor']
  }
)

.controller('TaskDefinitionStateCtrl', ($scope, newTaskService) ->

  # Ensure taskData exists (prevents "Cannot set property 'source' of undefined")
  $scope.taskData ?= {}

  # Reuse the inbox controller behaviour by swapping the data source
  $scope.taskData.source = newTaskService.queryTasksForTaskExplorer.bind(newTaskService)
  $scope.taskData.taskDefMode = true

  # Show inbox search UI options on the Task Explorer view
  $scope.showSearchOptions = true

  # Initialise filters safely (handles unit/taskDefinitions loading later)
  $scope.filters ?= {}
  $scope.filters.taskDefinitionIdSelected ?= _.first($scope.unit?.taskDefinitions)?.id

  # If taskDefinitions load after controller init, set a default once
  $scope.$watch('unit.taskDefinitions', (defs) ->
    return unless defs? and defs.length > 0
    $scope.filters.taskDefinitionIdSelected ?= defs[0].id
  )
)
