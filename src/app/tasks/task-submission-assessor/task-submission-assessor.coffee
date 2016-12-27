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
    clearSelectedTask = ->
      $scope.task = null

    $scope.taskStatusData =
      keys:   taskService.statusKeys
      help:   taskService.helpDescriptions
      icons:  taskService.statusIcons
      labels: taskService.statusLabels
      class:  taskService.statusClass

    $scope.$watch 'task', (newTask) ->
      return unless newTask?.project? # Must have project for task to be mapped
      setDetails = ->
        $scope.hasPdf = newTask.has_pdf
        $scope.project = newTask.project()
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
