angular.module('doubtfire.admin.states.units', [])

#
# Convenors of a unit(s) can see a list of all the units they convene
# in this view and make changes to those units.
#
# Users with an Administrator system role can create new units.
#
.config((headerServiceProvider) ->
  unitsAdminViewStateData =
    url: "/admin/units"
    views:
      main:
        controller: "AdministerUnitsState"
        templateUrl: "admin/states/units/units.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  headerServiceProvider.state "admin/units", unitsAdminViewStateData
)
.controller("AdministerUnitsState", ($scope, $state, $modal, ExternalName, Unit, TeachingPeriod, CreateUnitModal, currentUser, unitService, alertService, analyticsService) ->
  analyticsService.event "Unit Admin", "Listed Units to Manage"

  # Map unit role
  unitService.getUnitRoles (unitRoles) ->
    Unit.query({ include_in_active: true },
      (success) ->
        $scope.units = _.map(success, (unit) ->
          unit.unitRole = _.find(unitRoles, { unit_id: unit.id })
          if unit.teaching_period_id
            unit.teachingPeriod = TeachingPeriod.getTeachingPeriod(unit.teaching_period_id)
          unit
        )
      (failure) ->
        $scope.error = true
    )

  # Table sort details
  $scope.sortOrder = "start_date"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = ExternalName

  $scope.createUnit = ->
    CreateUnitModal.show $scope.units
)
