angular.module('doubtfire.units.states.units-admin-view', [])

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
        controller: "UnitsAdminViewCtrl"
        templateUrl: "units/states/units-admin-view/units-admin-view.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  headerServiceProvider.state "admin/units#index", unitsAdminViewStateData
)
.controller("UnitsAdminViewCtrl", ($scope, $state, $modal, Unit, UnitCreateModal, analyticsService) ->
  analyticsService.event "Unit Admin", "Listed Units to Manage"
  $scope.units = Unit.query { include_in_active: true }

  $scope.showUnit = (unit) ->
    unitToShow = if unit?
      $state.transitionTo "admin/units#edit", {unitId: unit.id}

  $scope.createUnit = ->
    UnitCreateModal.show $scope.units
)
