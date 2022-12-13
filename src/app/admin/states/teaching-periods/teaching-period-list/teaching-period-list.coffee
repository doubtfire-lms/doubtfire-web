angular.module('doubtfire.admin.states.teachingperiods', ['doubtfire.admin.states.teachingperiods.edit'])

#
# Users with an Administrator system role can create new Teaching Periods.
#
.config(($stateProvider) ->
  stateData = {
    url: "/admin/teaching-periods"
    views:
      main:
        controller: "AdministerTeachingPeriodsState"
        templateUrl: "admin/states/teaching-periods/teaching-period-list/teaching-period-list.tpl.html"
    data:
      pageTitle: "_Teaching-Period Administration_"
      roleWhitelist: ['Admin']
  }
  $stateProvider.state "admin/teachingperiods", stateData
)

.controller("AdministerTeachingPeriodsState", ($scope, $state, $modal, DoubtfireConstants, alertService, newTeachingPeriodService, TeachingPeriodSettingsModal, analyticsService, GlobalStateService) ->
  analyticsService.event 'Edit Teaching Periods View', "Started Edit Teaching Periods View"

  GlobalStateService.setView("OTHER")

  newTeachingPeriodService.cache.values.subscribe((tps) -> $scope.teachingPeriods = tps)

  # Table sort details
  $scope.sortOrder = "startDate"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

  # User settings/create modal
  $scope.showTeachingPeriodModal = () ->
    # If we're given a user, show that user, else create a new one
    TeachingPeriodSettingsModal.show()
)
