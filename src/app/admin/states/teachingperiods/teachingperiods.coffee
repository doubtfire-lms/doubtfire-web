angular.module('doubtfire.admin.states.teachingperiods', [])

#
# Convenors of a unit(s) can see a list of all the units they convene
# in this view and make changes to those units.
#
# Users with an Administrator system role can create new units.
#
.config((headerServiceProvider) ->
  teachingPeriodsAdminViewStateData =
    url: "/admin/teachingperiods"
    views:
      main:
        controller: "AdministerTeachingPeriodsState"
        templateUrl: "admin/states/teachingperiods/teachingperiods.tpl.html"
    data:
      pageTitle: "_Teaching-Period Administration_"
      roleWhitelist: ['Admin']
  headerServiceProvider.state "admin/teachingperiods", teachingPeriodsAdminViewStateData
)
.controller("AdministerTeachingPeriodsState", ($scope, $state, $modal, ExternalName, currentUser, alertService, TeachingPeriod, TeachingPeriodSettingsModal) ->

  $scope.teachingPeriods = TeachingPeriod.query()

  # Table sort details
  $scope.sortOrder = "start_date"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = ExternalName

  # User settings/create modal
  $scope.showTeachingPeriodModal = (teachingPeriod) ->
    # If we're given a user, show that user, else create a new one
    teachingPeriodToShow = if teachingPeriod? then teachingPeriod else { }
    TeachingPeriodSettingsModal.show teachingPeriodToShow
)
