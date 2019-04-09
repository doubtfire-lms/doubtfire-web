angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard', [
  'doubtfire.projects.states.dashboard.directives.task-dashboard.directives'
])
#
# Dashboard of task-related info
#
.directive('taskDashboard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/task-dashboard.tpl.html'
  scope:
    task: '='
    showFooter: '@?'
    showSubmission: '@?'
  controller: ($scope, $stateParams, Task, TaskFeedback, listenerService, projectService, taskService) ->
    # Is the current user a tutor?
    $scope.tutor = $stateParams.tutor
    # the ways in which the dashboard can be viewed
    $scope.dashboardViews = ["details", "submission", "task"]

    # set the current dashboard view to details by default
    updateCurrentView = ->
      if $scope.showSubmission
        $scope.currentView = $scope.dashboardViews[1]
      else
        $scope.currentView = $scope.dashboardViews[0]

    updateCurrentView()

    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Required changes when task changes
    listeners.push $scope.$watch('task.id', ->
      return unless $scope.task?
      # get the url for the task sheet and the submissions
      $scope.urls = {
        taskSheetPdfUrl: Task.getTaskPDFUrl($scope.task.unit(), $scope.task.definition)
        taskSubmissionPdfUrl: TaskFeedback.getTaskUrl($scope.task)
        taskSubmissionPdfAttachmentUrl: TaskFeedback.getTaskUrl($scope.task, true)
        taskFilesUrl: TaskFeedback.getTaskFilesUrl($scope.task)
      }
      updateCurrentView()
    )

    # Set the selected dashboard view
    $scope.setSelectedDashboardView = (view) ->
      if view in $scope.dashboardViews
        $scope.currentView = view
    # Is the current view?
    $scope.isCurrentView = (view) ->
      return $scope.currentView == view

    # Now also load in the assessment details
    if $scope.showFooter
      $scope.taskStatusData =
        keys:   _.sortBy(taskService.markedStatuses, (s) -> taskService.statusSeq[s])
        help:   taskService.helpDescriptions
        icons:  taskService.statusIcons
        labels: taskService.statusLabels
        class:  taskService.statusClass

      # Triggers a new update to the task status
      $scope.triggerTransition = (status) ->
        taskService.updateTaskStatus $scope.task.project().unit(), $scope.task.project(), $scope.task, status


)
