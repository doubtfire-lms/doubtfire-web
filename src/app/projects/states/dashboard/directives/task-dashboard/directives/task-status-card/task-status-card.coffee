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
    listeners = listenerService.listenTo($scope)
    listeners.push $scope.$watch('task.id', ->
      return unless $scope.task?
      studentTriggers = _.map(taskService.switchableStates.student, taskService.statusData)
      filteredStudentTriggers = $scope.task.filterFutureStates(studentTriggers)
      $scope.triggers = filteredStudentTriggers
      return unless $scope.unitRole?
      tutorTriggers = _.map(taskService.switchableStates.tutor, taskService.statusData)
      $scope.triggers.concat(tutorTriggers)
    )
    $scope.triggerTransition = (trigger) ->
      $scope.task.triggerTransition(trigger, $scope.unitRole)
)
