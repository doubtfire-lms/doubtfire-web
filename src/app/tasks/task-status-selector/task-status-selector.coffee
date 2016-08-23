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
  controller: ($scope, taskService) ->
    $scope.taskService = taskService

    #
    # Statuses tutors/students may change task to
    #
    $scope.studentStatuses  = taskService.switchableStates.student
    $scope.tutorStatuses    = taskService.switchableStates.tutor
    $scope.taskEngagementConfig =
      studentTriggers: $scope.studentStatuses.map taskService.statusData
      tutorTriggers:   $scope.tutorStatuses.map taskService.statusData
)
