angular.module('doubtfire.tasks.partials.status-switcher',[])

.directive('statusSwitcher', ->
  replace: true
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/status-switcher.tpl.html'
  scope:
    task: "=task"
    assessingUnitRole: "=assessingUnitRole"
    inMenu: "=inMenu"
  controller: ($scope, taskService) ->
    #
    # Statuses tutors/students may change task to
    #
    $scope.studentStatuses  = taskService.switchableStates.student
    $scope.tutorStatuses    = taskService.switchableStates.tutor
    $scope.taskEngagementConfig = {
      studentTriggers: $scope.studentStatuses.map (status) ->
        { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
      tutorTriggers: $scope.tutorStatuses.map (status) ->
        { status: status, label: taskService.statusLabels[status], iconClass: taskService.statusIcons[status], taskClass: _.trim(_.dasherize(status), '-'), helpText: taskService.helpText(status) }
      }

)