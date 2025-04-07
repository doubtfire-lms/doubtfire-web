angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard', [])
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
  controller: ($scope, $stateParams, listenerService, newTaskService, DoubtfireConstants, TaskAssessmentModal, fileDownloaderService) ->
    # $scope.overseerEnabled = DoubtfireConstants.IsOverseerEnabled

    $scope.overseerEnabled = () ->
      DoubtfireConstants.IsOverseerEnabled.value && $scope.task?.overseerEnabled

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
        taskSheetPdfUrl: $scope.task.definition.getTaskPDFUrl()
        taskSubmissionPdfUrl: $scope.task.submissionUrl()
        taskSubmissionPdfAttachmentUrl: $scope.task.submissionUrl(true)
        taskFilesUrl: $scope.task.submittedFilesUrl()
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

    $scope.showSubmissionHistoryModal = ->
      TaskAssessmentModal.show($scope.task)

    # Now also load in the assessment details
    if $scope.showFooter
      $scope.taskStatusData =
        keys:   _.sortBy(newTaskService.markedStatuses, (s) -> newTaskService.statusSeq.get(s))
        help:   newTaskService.helpDescriptions
        icons:  newTaskService.statusIcons
        labels: newTaskService.statusLabels
        class:  newTaskService.statusClass

      # Triggers a new update to the task status
      $scope.triggerTransition = (status) ->
        $scope.task.updateTaskStatus(status)

    $scope.downloadSubmission = () ->
      fileDownloaderService.downloadFile($scope.urls.taskSubmissionPdfAttachmentUrl)

    $scope.downloadSubmittedFiles = () ->
      fileDownloaderService.downloadFile($scope.urls.taskFilesUrl)


)
