angular.module('doubtfire.tasks.task-submission-assessor', [])
#
# View a student's submission of a task and allow assessment of status
# triggering
#
.directive('taskSubmissionAssessor', ->
  restrict: 'E'
  templateUrl: 'tasks/task-submission-assessor/task-submission-assessor.tpl.html'
  scope:
    task: '='
  controller: ($scope, $timeout, TaskFeedback, taskService, alertService) ->
    # Cleanup
    listeners = []
    $scope.$on '$destroy', -> _.each(listeners, (l) -> l())

    $scope.clearSelectedTask = -> $scope.task = null

    $scope.taskStatusData =
      keys:   _.sortBy(taskService.markedStatuses, (s) -> taskService.statusSeq[s])
      help:   taskService.helpDescriptions
      icons:  taskService.statusIcons
      labels: taskService.statusLabels
      class:  taskService.statusClass

    # Triggers a new update to the task status
    $scope.triggerTransition = (status) ->
      taskService.updateTaskStatus $scope.task.project().unit, $scope.task.project(), $scope.task, status

    listeners.push $scope.$watch 'task', (newTask) ->
      return unless newTask?.project? # Must have project for task to be mapped
      setDetails = ->
        $scope.hasPdf = newTask.has_pdf
        $scope.taskPdfUrl = TaskFeedback.getTaskUrl(newTask)
        $scope.taskFilesUrl = TaskFeedback.getTaskFilesUrl(newTask)
      if newTask.needsSubmissionDetails()
        $scope.showLoading = $scope.loadedDetails = false
        showLoadingTimeout = $timeout((-> $scope.showLoading = true), 1000)
        success = ->
          setDetails()
          $scope.showLoading = false
          $timeout.cancel(showLoadingTimeout)
        failure = ->
          alertService.add('danger', 'Failed to load submission details', 2000)
          $timeout.cancel(showLoadingTimeout)
          clearSelectedTask()
        newTask.getSubmissionDetails(success, failure)
      else
        setDetails()
)
