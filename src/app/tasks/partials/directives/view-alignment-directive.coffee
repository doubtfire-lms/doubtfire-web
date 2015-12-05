angular.module('doubtfire.tasks.partials.view-alignment-directive', [])

.directive('viewAlignment', ->
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/view-alignment.tpl.html'
  scope:
    currentProgress: '=?'
    medians: '=?'
    project: '=?'
    task: '=?'
    unit: '='
    alignments: '=?'
    summaryOnly: '=?'
  controller: ($scope, Visualisation, outcomeService) ->
    $scope.targets = outcomeService.calculateTargets($scope.unit, $scope.unit, outcomeService.unitTaskStatusFactor())

    $scope.toggleExpanded = (align) ->
      align.expanded = !align.expanded
      if align.expanded
        Visualisation.refreshAll()

    $scope.alignments = $scope.unit.ilos unless $scope.alignments?

    if $scope.project? and $scope.task?
      $scope.medians = outcomeService.calculateTaskPotentialContribution($scope.unit, $scope.project, $scope.task)
      $scope.currentProgress = outcomeService.calculateTaskContribution($scope.unit, $scope.project, $scope.task)

)