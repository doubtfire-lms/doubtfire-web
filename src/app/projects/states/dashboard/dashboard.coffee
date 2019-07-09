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
      roleWhitelist: ['Tutor', 'Convenor', 'Admin', 'Student']
   }
)

.controller("ProjectsDashboardStateCtrl", ($scope, $rootScope, $urlRouter, $state, $stateParams, UnitRole, unitService, projectService, listenerService) ->
  # Cleanup
  listeners = listenerService.listenTo($scope)

  # Load in task task abbreviation
  $scope.taskData = {
    selectedTask: null
    onSelectedTaskChange: (task) ->
      setTaskAbbrAsUrlParams(task)
  }

  # Sets URL parameters for the task key
  setTaskAbbrAsUrlParams = (task) ->
    taskAbbr = if _.isString(task) then task else task?.definition.abbreviation
    taskAbbr = if taskAbbr then taskAbbr else ''
    # Change URL of new task without notify
    $state.go($state.$current, {taskAbbr: taskAbbr}, {notify: false})

  # Sets selected task from URL parameters
  setSelectedTaskFromUrlParams = (taskAbbr) ->
    $scope.taskData.selectedTask = null unless taskAbbr?
    $scope.taskData.selectedTask = _.find($scope.project.activeTasks(), (t) ->
      t.definition.abbreviation.toLowerCase() == taskAbbr?.toLowerCase()
    )

  # False task abbreviation provided?
  unless setSelectedTaskFromUrlParams($stateParams.taskAbbr)?
    setTaskAbbrAsUrlParams(null)

  # Whenever the state is changed, we look at the taskAbbr in the URL params
  # see if we can set it as an actual taskAbbr object
  listeners.push $scope.$on '$stateChangeStart', ($event, toState, toParams, fromState, fromParams) ->
    taskAbbr = setSelectedTaskFromUrlParams(toParams.taskAbbr)?.definition.abbreviation
    # Use preventDefault to prevent destroying the child state's
    # scope if they are the same states. Otherwise, if they are
    # the same, we destroy the state's scope and recreate it again
    # unnecessarily
    if fromState == toState && fromParams.projectId == toParams.projectId
      $event.preventDefault()
      # Need to call this to change the URL parameter!
      setTaskAbbrAsUrlParams(taskAbbr)

  # Task complete
  listeners.push $scope.$on('TaskSubmissionUploadComplete', ($event) ->
    # Go back to the dashboard
    $scope.taskData.selectedTask = null
  )
)
