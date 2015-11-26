angular.module("doubtfire.projects.project-outcome-alignment", [])

.directive("projectOutcomeAlignment", ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/project-outcome-alignment.tpl.html'
  controller: ($scope, outcomeService, Unit, alertService) ->
    $scope.poaView = {
      activeTab: 'list'
    }

    $scope.targets = outcomeService.calculateTargets($scope.unit, $scope.unit)

    $scope.currentProgress = outcomeService.calculateProgress($scope.unit, $scope.project)

    $scope.selectProgress = () ->
      if !$scope.medians?
        Unit.learningProgressMedians.get { id: $scope.unit.id },
          (response) -> $scope.medians = response
          (response) ->
            if response.data.error?
              alertService.add("danger", "Error: " + response.data.error, 6000)
            else
              alertService.add("danger", "Failed to get unit progress class statistics", 6000)
            $scope.medians = {}

      $scope.poaView.activeTab = 'progress'
)