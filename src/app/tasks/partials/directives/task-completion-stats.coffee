angular.module('doubtfire.tasks.partials.task-completion-stats', [])
.directive('taskCompletionStats', ->
  replace: false
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/task-completion-stats.tpl.html'
  scope:
    unit: "="
  controller: ($scope, Unit) ->
    # Load data if not loaded already
    unless $scope.unit.analytics?.taskCompletionStats?
      Unit.taskCompletionStats.get {id: $scope.unit.id}, (response) ->
        $scope.unit.analytics.taskCompletionStats = response
        $scope.data = response.unit
    else
      $scope.data = $scope.unit.analytics.taskCompletionStats.unit

    $scope.dataModel = {
      viewMode: 'unit'
    }
    $scope.$watch 'dataModel.viewMode', (newValue) ->
      if $scope.unit.analytics?.taskCompletionStats?
        $scope.data = $scope.unit.analytics.taskCompletionStats[newValue]

)
