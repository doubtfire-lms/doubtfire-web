angular.module('doubtfire.units.states.all.directives.all-units-list', [])

.config(($stateProvider) ->
  allUnitsStateData =
    url: "/view-all-units"
    views:
      main:
        controller: "AllUnitsList"
        templateUrl: "units/states/all/directives/all-units-list/all-units-list.tpl.html"
    data:
      pageTitle: "_All-Units_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
  $stateProvider.state 'view-all-units', allUnitsStateData
)

.controller("AllUnitsList", ($scope, $state, $timeout, DoubtfireConstants, dateService, GlobalStateService, newUserService, newUnitService) ->
  GlobalStateService.setView('OTHER')

  $scope.externalName = DoubtfireConstants.ExternalName

  # Table sort details
  $scope.sortOrder = "start_date"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  hasRoles = false

  timeoutPromise = $timeout((-> $scope.showSpinner = true), 2000)

  GlobalStateService.onLoad () ->
    $scope.unitRoles = GlobalStateService.loadedUnitRoles.currentValues
    $scope.showSpinner = false
    $scope.dataLoaded = true
    hasRoles = true
    $timeout.cancel(timeoutPromise)

  $scope.typeAhead = (roles) ->
    result = []
    _.each roles, (role) ->
      result.push(role.unit.code)
      result.push(role.unit.name)
    return _.uniq(result)

  checkEnrolled = ->
    return if !$scope.unitRoles?
    $scope.notEnrolled = ->
      # Not enrolled if a tutor and no unitRoles
      ($scope.unitRoles.length is 0 and newUserService.currentUser.role is 'Tutor')

  $scope.$watch 'unitRoles', checkEnrolled

  if newUserService.currentUser.role isnt 'Student'
    newUnitService.query().subscribe(
      (units) ->
        $scope.units = units
    )

  $scope.unit = (unitId) ->
    _.find($scope.units, {id: unitId})

  $scope.currentUser = newUserService.currentUser
)
