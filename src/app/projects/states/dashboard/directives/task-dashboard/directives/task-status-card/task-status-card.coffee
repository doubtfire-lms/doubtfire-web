angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-status-card', [])
#
# Status of the card
#
.directive('taskStatusCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-status-card/task-status-card.tpl.html'
  scope:
    task: '='
    unitRole: '=?'
  controller: ($scope, taskService, listenerService) ->
    # Cleanup
    listeners = listenerService.listenTo($scope)
    # Reapply triggers available
    reapplyTriggers = ->
      studentTriggers = _.map(taskService.switchableStates.student, taskService.statusData)
      filteredStudentTriggers = $scope.task.filterFutureStates(studentTriggers)
      $scope.triggers = filteredStudentTriggers
      return unless $scope.unitRole?
      tutorTriggers = _.map(taskService.switchableStates.tutor, taskService.statusData)
      $scope.triggers.concat(tutorTriggers)
    # Required changes when task changes
    listeners.push $scope.$watch('task.id', ->
      return unless $scope.task?
      reapplyTriggers()
    )
    # Triggers a new task status
    $scope.triggerTransition = (trigger) ->
      $scope.task.triggerTransition(trigger, $scope.unitRole)
)
