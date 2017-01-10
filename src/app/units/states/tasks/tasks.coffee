angular.module('doubtfire.units.states.tasks', [
  'doubtfire.units.states.tasks.inbox'
  'doubtfire.units.states.tasks.feedback'
  'doubtfire.units.states.tasks.definition'
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

.controller('UnitsTasksStateCtrl', ($scope, $state) ->
  # Cleanup
  listeners = []
  $scope.$on '$destroy', -> _.each(listeners, (l) -> l())

  # Task data wraps the URL task ID sourced from the URL,
  # the task source used for the task inbox list, the
  # actual selectedTask reference and the callback for
  # when a task is updated (accepts the new task)
  $scope.taskData = {
    temporaryTaskId: null,
    source: null,
    selectedTask: null,
    onSelectedTaskChange: (task) ->
      taskId = task?.id
      $scope.taskData.temporaryTaskId = taskId
      setTaskIdUrlParm(taskId)
  }

  # Changes the task ID in the URL parameter
  setTaskIdUrlParm = (taskId) ->
    # Change URL of new task without notify
    $state.go($state.$current, {taskId: taskId}, {notify: false})

  # Sets a URL task id to be used by task-inbox-list
  setTemporaryTaskId = (taskId) ->
    # Propagate selected task change downward to search for actual task
    # inside the task inbox list
    $scope.taskData.temporaryTaskId = if !taskId? || _.isEmpty(taskId.trim()) then null else +taskId

  # Child states will use taskId to notify what task has been
  # selected by the child on first load.
  taskId = $state.$current.locals.globals.$stateParams.taskId
  setTemporaryTaskId(taskId)

  # Whenever the state is changed, we look at the task ID and
  # see if we can set it
  listeners.push $scope.$on '$stateChangeStart', ($event, toState, toParams, fromState, fromParams) ->
    setTemporaryTaskId(toParams.taskId)
    # Use preventDefault to prevent destroying the child state's
    # scope if they are the same states. Otherwise, if they are
    # the same, we destroy the state's scope and recreate it again
    # unnecessarily; doing so will cause a re-request in the task
    # list which is not required.
    $event.preventDefault() if fromState == toState
)
