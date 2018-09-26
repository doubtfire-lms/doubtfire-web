angular.module('doubtfire.teaching-periods.states.edit.directives.teaching-period-units', [])

.directive('teachingPeriodUnits', ->
  replace: true
  restrict: 'E'
  templateUrl: 'teaching-periods/states/edit/directives/teaching-period-units/teaching-period-units.tpl.html'
  controller: ($scope, $state, alertService) ->
    # Table sort details
    $scope.sortOrder = "start_date"
    $scope.reverse = true

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15

)