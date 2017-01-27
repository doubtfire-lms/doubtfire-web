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
      filteredAlignments = $filter('taskDefinitionFilter')($scope.task.unit().task_outcome_alignments, $scope.task.definition.id)
      filteredAlignments = _.map(filteredAlignments, (alignment) ->
        alignment.ilo = $scope.task.unit().outcome(alignment.learning_outcome_id)
        alignment.label = outcomeService.alignmentLabels[alignment.rating]
        alignment
      )
      filteredAlignments = _.sortBy(filteredAlignments, (a) -> a.ilo.ilo_number)
      $scope.alignments = filteredAlignments
    )
)
