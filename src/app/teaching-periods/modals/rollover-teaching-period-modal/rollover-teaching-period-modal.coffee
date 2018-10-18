angular.module('doubtfire.teaching-periods.modals.rollover-teaching-period-modal', [])

.factory('RolloverTeachingPeriodModal', ($modal) ->
  RolloverTeachingPeriodModal = {}

  RolloverTeachingPeriodModal.show = (teachingPeriod) ->
    $modal.open
      templateUrl: 'teaching-periods/modals/rollover-teaching-period-modal/rollover-teaching-period-modal.tpl.html'
      controller: 'RolloverTeachingPeriodModal'
      resolve:
        teachingperiod: -> teachingPeriod

  RolloverTeachingPeriodModal
)

.controller('RolloverTeachingPeriodModal', ($scope, $modalInstance, ExternalName, alertService, analyticsService, currentUser, TeachingPeriod, teachingperiod, auth) ->
  $scope.teachingperiod = teachingperiod
  $scope.teachingPeriods = TeachingPeriod.query()

  $scope.rolloverTo = {}
)

