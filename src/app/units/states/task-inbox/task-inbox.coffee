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
  # Changes the task ID in the URL parameter
  setTaskIdUrlParm = (taskId) ->
    # Change URL of new task without notify
    $state.go('.', {taskId: taskId}, {notify: false})

  # Load in Task ID
  if $stateParams.taskId
    # Temporary item used by task-inbox-list
    $scope.selectedTask = {id: +$stateParams.taskId}

  # Watch for when task has changed
  $scope.$watch 'selectedTask', (newTask) ->
    if newTask?
      setTaskIdUrlParm(newTask.id)
    else
      setTaskIdUrlParm(null)
)
