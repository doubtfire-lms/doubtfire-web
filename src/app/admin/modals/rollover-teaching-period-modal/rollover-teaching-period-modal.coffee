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

.controller('RolloverTeachingPeriodModal', ($scope, $modalInstance, ExternalName, alertService, analyticsService, currentUser, TeachingPeriod, teachingperiod, auth) ->
  $scope.teachingperiod = teachingperiod
  $scope.teachingPeriods = TeachingPeriod.query()

  $scope.rolloverTo = {}

  $scope.rollover = ->

    TeachingPeriod.rollover.create { existing_teaching_period_id: $scope.teachingperiod.id, new_teaching_period_id: $scope.rolloverTo },
      (createdTeachingPeriod) ->
        $scope.teachingPeriods.loadedPeriods.push(createdTeachingPeriod)
        alertService.add("success", "Teaching Period created.", 2000)
      (response) ->
        alertService.add("danger", response.data.error, 6000)
)

