angular.module('doubtfire.units.states.tasks.overflow', [
])

#
# Get tasks for overflow marking
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/overflow', {
    parent: 'units/tasks'
    url: '/overflow/{taskKey:any}'
    # We can recycle the task inbox, switching the data source scope variable
    templateUrl: "units/states/tasks/inbox/inbox.tpl.html"
    controller: "TaskOverflowStateCtrl"
    params:
      taskKey: dynamic: true
    data:
      task: "Task Overflow"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Auditor']
   }
)

.controller('TaskOverflowStateCtrl', ($scope, newTaskService) ->
  $scope.taskData.source = newTaskService.queryTasksForOverflow.bind(newTaskService)
  $scope.viewType = 'overflow'
  $scope.showSearchOptions = false
  $scope.filters = {
    tutorialIdSelected: 'all'
    taskDefinition: null
    taskDefinitionIdSelected: null
  }
  $scope.taskData.taskDefMode = false
)
