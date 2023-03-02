angular.module('doubtfire.admin.states.units', [])

#
# Convenors of a unit(s) can see a list of all the units they convene
# in this view and make changes to those units.
#
# Users with an Administrator system role can create new units.
#
.config(($stateProvider) ->
  unitsAdminViewStateData =
    url: "/admin/units"
    views:
      main:
        controller: "AdministerUnitsState"
        templateUrl: "admin/states/units/units.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['Admin', 'Convenor']
  $stateProvider.state "admin/units", unitsAdminViewStateData
)
.controller("AdministerUnitsState", ($scope, $state, $modal, DoubtfireConstants, CreateUnitModal, alertService, GlobalStateService, newUnitService) ->
  GlobalStateService.setView("OTHER")
  $scope.dataLoaded = false

  # Map unit role
  GlobalStateService.onLoad () ->
    $scope.unitRoles = GlobalStateService.loadedUnitRoles.currentValues

    GlobalStateService.loadedUnits.values.subscribe(
      (units) ->
        $scope.units = units
    )

    newUnitService.query(undefined, {params: { include_in_active: true }}).subscribe({
      next: (success) ->
        $scope.units = success
        $scope.dataLoaded = true

      error: (failure) ->
        $scope.error = true
        alertService.add("danger", failure, 6000)
        console.log(failure)
    })

  $scope.typeAhead = (units) ->
    result = []
    _.each units, (unit) ->
      result.push(unit.code)
      result.push(unit.name)
    return _.uniq(result)


  # Table sort details
  $scope.sortOrder = "startDate"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  # Get the confugurable, external name of Doubtfire
  $scope.externalName = DoubtfireConstants.ExternalName

  $scope.createUnit = ->
    CreateUnitModal.show $scope.units
)
