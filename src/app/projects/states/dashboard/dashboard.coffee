angular.module('doubtfire.projects.states.dashboard', [
  'doubtfire.projects.states.dashboard.directives'
])

#
# Tasks state for projects
#
.config(($stateProvider) ->
  $stateProvider.state 'projects/dashboard', {
    parent: 'projects/index'
    url: '/dashboard/:taskAbbr?tutor'
    controller: 'ProjectsDashboardStateCtrl'
    templateUrl: 'projects/states/dashboard/dashboard.tpl.html'
    params:
      taskAbbr: dynamic: true
    data:
      task: "Dashboard"
      pageTitle: "_Home_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student', 'Auditor']
   }
)

.controller("ProjectsDashboardStateCtrl", ($scope, $urlRouter, $state, $stateParams, listenerService) ->
  # Cleanup
  listeners = listenerService.listenTo($scope)

  # Load in task task abbreviation
  $scope.taskData = {
    selectedTask: null
    onSelectedTaskChange: (task) ->
      setTaskAbbrAsUrlParams(task)
  }

  # Ensure selection events from the Angular (downgraded) task list update the
  # AngularJS scope, so `ng-if="taskData.selectedTask"` panels render.
  listeners.push $scope.$on('StudentTaskSelected', (_event, task) ->
    $scope.taskData.selectedTask = task
  )

  # Sets URL parameters for the task key
  setTaskAbbrAsUrlParams = (task) ->
    taskAbbr = if _.isString(task) then task else task?.definition.abbreviation
    taskAbbr = if taskAbbr then taskAbbr else ''
    # Change URL of new task without notify
    $state.go($state.$current, {taskAbbr: taskAbbr}, {notify: false})

  # Sets selected task from URL parameters
  setSelectedTaskFromUrlParams = (taskAbbr) ->
    $scope.taskData.selectedTask = null unless taskAbbr?
    $scope.taskData.selectedTask = $scope.project.activeTasks().find((t) ->
      t.definition.abbreviation.toLowerCase() == taskAbbr?.toLowerCase()
    )

  # False task abbreviation provided?
  unless setSelectedTaskFromUrlParams($stateParams.taskAbbr)?
    setTaskAbbrAsUrlParams(null)


  # Task complete
  listeners.push $scope.$on('TaskSubmissionUploadComplete', ($event) ->
    # Go back to the dashboard
    $scope.taskData.selectedTask = null
  )
)
