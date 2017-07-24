angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-outcomes-card', [])
#
# Describes more about ILO linkages between a task
#
.directive('taskOutcomesCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-outcomes-card/task-outcomes-card.tpl.html'
  scope:
    task: '='
    unit: '='
  controller: ($scope, $filter, listenerService, outcomeService) ->
    listeners = listenerService.listenTo($scope)
    listeners.push $scope.$watch('task.id', ->
      $scope.alignments = $scope.unit.staffAlignmentsForTaskDefinition($scope.task)
    )
)
