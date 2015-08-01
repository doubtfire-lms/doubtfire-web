angular.module('doubtfire.units.partials.unit-marking-portfolios-directive', [])

#
# Marking portfolio context
#

.directive('portfolioMarkingContext', ->
  restrict: 'E'
  templateUrl: 'units/partials/templates/portfolio-marking-context.tpl.html'
  controller: ($scope, Unit) ->
    $scope.portfolioDownloadUrl = Unit.getPortfoliosUrl $scope.unit
)