angular.module('doubtfire.tasks.partials.task-completion-stats', [])
.directive('taskCompletionStats', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-completion-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, Unit) ->
    # Load data if not loaded already
    unless $scope.unit.analytics.taskCompletionStats?
      Unit.taskCompletionStats.get {id: $scope.unit.id}, (response) ->
        $scope.unit.analytics.taskCompletionStats = $scope.data = response
    else
      $scope.data = $scope.unit.analytics.taskCompletionStats
)
