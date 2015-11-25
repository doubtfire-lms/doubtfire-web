angular.module("doubtfire.projects.project-outcome-alignment", [])

.directive("projectOutcomeAlignment", ->
  restrict: 'E'
  templateUrl: 'projects/partials/templates/project-outcome-alignment.tpl.html'
  controller: ($scope) ->
    $scope.poaView = {
      activeTab: 'progress'
    }
)