angular.module('doubtfire.teaching-periods.states.edit.directives.teaching-period-breaks', [])

.directive('teachingPeriodBreaks', ->
  replace: true
  restrict: 'E'
  templateUrl: 'admin/states/teaching-periods/teaching-period-edit/directives/teaching-period-breaks/teaching-period-breaks.tpl.html'
  controller: ($scope, $state, alertService, CreateBreakModal) ->
    # Table sort details
    $scope.sortOrder = "startDate"
    $scope.reverse = true

    $scope.addBreak = (teachingPeriod) ->
      CreateBreakModal.show teachingPeriod
)
