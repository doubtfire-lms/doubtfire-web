angular.module('doubtfire.tasks.partials.view-alignment-directive', [])

.directive('viewAlignment', ->
  restrict: 'E'
  templateUrl: 'tasks/partials/templates/view-alignment.tpl.html'
  controller: ($scope, outcomeService) ->

    $scope.targets = outcomeService.calculateTargets($scope.unit, $scope.unit, outcomeService.unitTaskStatusFactor())
    $scope.medians = outcomeService.calculateTaskPotentialContribution($scope.unit, $scope.project, $scope.task)
    $scope.currentProgress = outcomeService.calculateTaskContribution($scope.unit, $scope.project, $scope.task)

)