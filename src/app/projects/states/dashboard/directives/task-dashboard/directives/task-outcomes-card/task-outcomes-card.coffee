angular.module('doubtfire.projects.states.dashboard.directives.task-dashboard.directives.task-outcomes-card', [])
#
# Describes more about ILO linkages between a task
#
.directive('taskOutcomesCard', ->
  restrict: 'E'
  templateUrl: 'projects/states/dashboard/directives/task-dashboard/directives/task-outcomes-card/task-outcomes-card.tpl.html'
  scope:
    task: '='
  controller: ($scope, $filter, listenerService, outcomeService) ->
    listeners = listenerService.listenTo($scope)
    listeners.push $scope.$watch('task.id', ->
      filteredAlignments = _.map($scope.task.staffAlignments(), (alignment) ->
        alignment.label = outcomeService.alignmentLabels[alignment.rating]
        alignment
      )
      $scope.alignments = filteredAlignments
    )
)
