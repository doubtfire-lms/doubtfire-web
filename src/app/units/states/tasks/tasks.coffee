angular.module('doubtfire.units.states.tasks', [
  'doubtfire.units.states.tasks.inbox'
  'doubtfire.units.states.tasks.feedback'
])

#
# Teacher child state for units for task-related activites
#
.config(($stateProvider) ->
  $stateProvider.state 'units/tasks', {
    abstract: true
    parent: 'units/index'
    url: '/tasks'
    controller: 'UnitsTasksStateCtrl'
    template: '<ui-view/>'
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
   }
)

.controller('UnitsTasksStateCtrl', ($scope, $state, $stateParams) ->
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
