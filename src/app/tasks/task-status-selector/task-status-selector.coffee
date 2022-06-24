angular.module('doubtfire.tasks.task-status-selector',[])

.directive('taskStatusSelector', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/task-status-selector/task-status-selector.tpl.html'
  scope:
    task: "=task"
    assessingUnitRole: "=assessingUnitRole"
    inMenu: "=inMenu"
    triggerTransition: "=triggerTransition"
  controller: ($scope, newTaskService) ->
    $scope.newTaskService = newTaskService

    #
    # Statuses tutors/students may change task to
    #
    $scope.studentStatuses  = newTaskService.switchableStates.student
    $scope.tutorStatuses    = newTaskService.switchableStates.tutor
    $scope.taskEngagementConfig =
      studentTriggers: $scope.studentStatuses.map newTaskService.statusData
      tutorTriggers:   $scope.tutorStatuses.map newTaskService.statusData

    $scope.futureStates = () ->
      _.reject $scope.studentStatuses.map(newTaskService.statusData), (s) -> s.status in newTaskService.rejectFutureStates.get($scope.task.status)
)
