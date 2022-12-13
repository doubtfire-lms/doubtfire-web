angular.module('doubtfire.units.states.tasks.definition', [
  'doubtfire.units.states.tasks.inbox.directives'
])

#
# Mark tasks by task definition ID
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/definition', {
    parent: 'units/tasks'
    url: '/definition/{taskKey:any}'
    # We can recycle the task inbox, switching the data source scope variable
    templateUrl: "units/states/tasks/inbox/inbox.tpl.html"
    controller: "TaskDefinitionStateCtrl"
    params:
      taskKey: dynamic: true
    data:
      task: "Task Explorer"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('TaskDefinitionStateCtrl', ($scope, newTaskService) ->
  $scope.taskData.source = newTaskService.queryTasksForTaskExplorer.bind(newTaskService)
  $scope.taskData.taskDefMode = true
  $scope.showSearchOptions = true
  $scope.filters = {
    taskDefinitionIdSelected: _.first($scope.unit.taskDefinitions)?.id
  }
)
