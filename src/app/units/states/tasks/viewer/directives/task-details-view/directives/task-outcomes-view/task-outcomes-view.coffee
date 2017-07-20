angular.module('doubtfire.units.states.tasks.viewer.directives.task-details-view.directives.task-outcomes-view', [])
#
# Describes more about ILO linkages between a task
#
.directive('taskOutcomesView', ->
  restrict: 'E'
  templateUrl: 'units/states/tasks/viewer/directives/task-details-view/directives/task-outcomes-view/task-outcomes-view.tpl.html'
  scope:
    task: '='
    unit: '='
  controller: ($scope, $filter, listenerService, outcomeService) ->
    listeners = listenerService.listenTo($scope)
    listeners.push $scope.$watch('task.id', ->
      $scope.alignments = $scope.unit.staffAlignmentsForTaskDefinition($scope.task)
    )
)
