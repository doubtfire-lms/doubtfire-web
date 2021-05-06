angular.module('doubtfire.units.states.analytics.directives.task-completion-stats', [])

#
# Stats directive that shows the completion statistics of tasks
# throughout an entire unit, which can be broken down into a specific
# task or tutorial
#
.directive('taskCompletionStats', ->
  restrict: 'E'
  templateUrl: 'units/states/analytics/directives/task-completion-stats/task-completion-stats.tpl.html'
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

    overviewTutorial = {
      id: -1
      abbreviation: 'Overview'
      tutor_name: 'All Tutorials'
    }

    $scope.tutorialsForSelector = [overviewTutorial].concat($scope.unit.tutorials)

    $scope.switchToTutorial = (tutorial) ->
      return unless $scope.unit.analytics?.taskCompletionStats?
      $scope.dataModel.selectedTutorial = tutorial
      if tutorial is overviewTutorial
        $scope.data = $scope.unit.analytics.taskCompletionStats.tutorial
        $scope.depth = 1
      else
        $scope.data = $scope.unit.analytics.taskCompletionStats.tutorial[tutorial.id]
        $scope.depth = 0

    $scope.drillDown = ->
      $scope.dataModel.selectedType = 'tutorial'
      $scope.switchToTutorial(overviewTutorial)

    $scope.dataModel = {
      selectedType: 'unit'
      selectedTutorial: overviewTutorial
    }

    $scope.depth = 0

    $scope.$watch 'dataModel.selectedType', (newValue) ->
      if $scope.unit.analytics?.taskCompletionStats?
        $scope.data = $scope.unit.analytics.taskCompletionStats[newValue]
      if newValue is 'tutorial'
        $scope.switchToTutorial(overviewTutorial)
      else
        $scope.depth = 0
    $scope.$watch 'dataModel.selectedTutorial', $scope.switchToTutorial
)
