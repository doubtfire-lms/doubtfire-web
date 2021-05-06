angular.module('doubtfire.teaching-periods.states.edit.directives.teaching-period-units', [])

.directive('teachingPeriodUnits', ->
  replace: true
  restrict: 'E'
  templateUrl: 'admin/states/teaching-periods/teaching-period-edit/directives/teaching-period-units/teaching-period-units.tpl.html'
  controller: ($scope, $state, alertService, RolloverTeachingPeriodModal) ->
    # Table sort details
    $scope.sortOrder = "start_date"
    $scope.reverse = true

    # Pagination details
    $scope.currentPage = 1
    $scope.maxSize = 5
    $scope.pageSize = 15

    # Rollover
    $scope.rolloverTeachingPeriodModal = (teachingPeriod) ->
      # If we're given a user, show that user, else create a new one
      teachingPeriodToRollover = if teachingPeriod? then teachingPeriod else { }
      RolloverTeachingPeriodModal.show teachingPeriodToRollover

)