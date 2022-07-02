angular.module('doubtfire.admin.modals.rollover-teaching-period-modal', [])

.factory('RolloverTeachingPeriodModal', ($modal) ->
  RolloverTeachingPeriodModal = {}

  RolloverTeachingPeriodModal.show = (teachingPeriod) ->
    $modal.open
      templateUrl: 'admin/modals/rollover-teaching-period-modal/rollover-teaching-period-modal.tpl.html'
      controller: 'RolloverTeachingPeriodModal'
      resolve:
        teachingperiod: -> teachingPeriod

  RolloverTeachingPeriodModal
)

.controller('RolloverTeachingPeriodModal', ($scope, $modalInstance, alertService, analyticsService, newTeachingPeriodService, teachingperiod) ->
  $scope.teachingperiod = teachingperiod
  newTeachingPeriodService.cache.values.subscribe((tps) -> $scope.teachingPeriods = tps )

  $scope.rolloverTo = {}

  $scope.rollover = ->
    newPeriod = newTeachingPeriodService.cache.get(parseInt($scope.rolloverTo, 10))
    $scope.teachingperiod.rollover(newPeriod, false, false).subscribe({
      next: () -> alertService.add('success', "Rollover complete", 2000)
      error: (response) -> alertService.add('danger', response, 6000)
    })
)

