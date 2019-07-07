angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-status-card', [])
#
# Status of the card
#
.directive('taskStatusCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, $stateParams, taskService, listenerService, ConfirmationModal, ExtensionModal) ->
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
        ""
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
        ExtensionModal.show($scope.task)
      else
        $scope.task.triggerTransition(trigger, $scope.unitRole)

    # Allow upload of new files for an updated submission
    $scope.updateFilesInSubmission = ->
      taskService.presentTaskSubmissionModal($scope.task, $scope.task.status, true)

)
