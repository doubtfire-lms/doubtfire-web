angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-outcomes-card', [])
#
# Describes more about ILO linkages between a task
#
.directive('taskOutcomesCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-outcomes-card/task-outcomes-card.tpl.html'
  scope:
    taskDef: '='
    unit: '='
  controller: ($scope, $filter, listenerService, outcomeService) ->
    return unless $scope.unit?
    listeners = listenerService.listenTo($scope)
    listeners.push $scope.$watch('taskDef.id', ->
      $scope.alignments = $scope.unit.staffAlignmentsForTaskDefinition($scope.taskDef)
    )
)
