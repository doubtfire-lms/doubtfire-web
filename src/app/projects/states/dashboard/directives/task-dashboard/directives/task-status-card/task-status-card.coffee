angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-status-card', [])
#
# Status of the card
#
.directive('taskStatusCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, $stateParams, taskService, listenerService, ConfirmationModal) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Reapply triggers available
    reapplyTriggers = ->
      if $stateParams.tutor?
        $scope.triggers = _.map(taskService.statusKeys, taskService.statusData)
      else
        studentTriggers = _.map(taskService.switchableStates.student, taskService.statusData)
        filteredStudentTriggers = $scope.task.filterFutureStates(studentTriggers)
        $scope.triggers = filteredStudentTriggers
    # Required changes when task changes
    listeners.push $scope.$watch('task.id', ->
      return unless $scope.task?
      reapplyTriggers()
    )

    extendAndSubmit = (trigger) ->
      $scope.task.applyForExtension(
        (success) ->
          if $scope.task.isPastTargetDate() && !$scope.task.isOverdue()
            extendAndSubmit(trigger)
          else
            $scope.task.triggerTransition(trigger, $scope.unitRole)
        (failure) ->
          alertService.add("danger", "Extension failed - #{failure.data.error}", 6000)
      )

    # Triggers a new task status
    $scope.triggerTransition = (trigger) ->
      if trigger == 'ready_to_mark' && $scope.task.isPastTargetDate() && !$scope.task.isOverdue()
        ConfirmationModal.show(
          "Request Extensions?",
          "This task is past the target due date, so you will need to request an extension to get feedback. Use confirm to request extensions and proceed with the submission.",
          () -> extendAndSubmit(trigger))
      else
        $scope.triggerStatusChange(trigger)

    # Allow upload of new files for an updated submission
    $scope.updateFilesInSubmission = ->
      taskService.presentTaskSubmissionModal($scope.task, $scope.task.status, true)

    $scope.triggerStatusChange = (trigger) ->
      if (trigger == 'not_started' || trigger == 'working_on_it' || trigger == 'need_help') && $scope.task.inAwaitingFeedbackState() && !$scope.task.isOverdue()
        ConfirmationModal.show(
          "Do you want to change the status?",
          "Changing the status will cancel the previous submission.
          Use confirm to perform the action.",
          () -> $scope.task.triggerTransition(trigger, $scope.unitRole))
      else if (trigger == 'not_started' || trigger == 'working_on_it' || trigger == 'need_help') && $scope.task.inAwaitingFeedbackState() && $scope.task.isOverdue()
        ConfirmationModal.show(
          "Do you want to change the status?",
          "The deadline for this task has passed and going back to previous status will mark the task to Time Exceeded on re-submission.
          Instead use upload new files option to re-submit.
          Use confirm to perform the action.",
          () -> $scope.task.triggerTransition(trigger, $scope.unitRole))
      else
        $scope.task.triggerTransition(trigger, $scope.unitRole)
)
