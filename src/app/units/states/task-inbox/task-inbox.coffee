angular.module('doubtfire.units.states.task-inbox', [
  # 'doubtfire.units.states.task-inbox.task-commenter'
])

#
# Teacher child state for units
#
.config(($stateProvider) ->
  $stateProvider.state 'units#tasks', {
    parent: 'units#index'
    url: '/tasks/:taskId'
    views:
      unitIndex:
        templateUrl: "units/states/task-inbox/task-inbox.tpl.html"
        controller: "UnitTaskInboxFeedback"
    data:
      task: "Task Inbox"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('UnitTaskInboxFeedback', ($scope, $state, $stateParams) ->
  setTaskIdUrlParm = (taskId) ->
    # Change URL of new task without notify
    $state.go('.', {taskId: taskId}, {notify: false})

  if _.isNumber($stateParams.taskId)
    $scope.selectedTask = _.find($scope.unit.tasks, {id: $stateParams.taskId})

  $scope.$watch 'selectedTask', (newTask) ->
    if newTask?
      setTaskIdUrlParm(newTask.id)
    else
      setTaskIdUrlParm(null)
)
