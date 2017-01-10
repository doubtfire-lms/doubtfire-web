angular.module('doubtfire.units.states.tasks.definition', [])

#
# Mark tasks by task definition ID
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks/definition', {
    parent: 'units/tasks'
    url: '/definition/:taskId'
    # We can recycle the task inbox, switching the data source scope variable
    templateUrl: "units/states/tasks/inbox/inbox.tpl.html"
    controller: "TaskDefinitionStateCtrl"
    data:
      task: "Mark by Task Definition"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('TaskDefinitionStateCtrl', ($scope, Unit) ->
  $scope.taskData.source = Unit.tasksForDefinition
  $scope.showSearchOptions = true
  $scope.filters = {
    taskDefinitionIdSelected: _.first($scope.unit.task_definitions)?.id
  }
)
