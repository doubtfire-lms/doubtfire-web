angular.module('doubtfire.units.states.all.directives.all-units-list', [])

.config((headerServiceProvider) ->
  allUnitsStateData =
    url: "/view-all-units"
    views:
      main:
        controller: "AllUnitsList"
        templateUrl: "units/states/all/directives/all-units-list/all-units-list.tpl.html"
    data:
      pageTitle: "_All-Units_"
      roleWhitelist: ['Tutor', 'Convenor', 'Admin']
  headerServiceProvider.state 'view-all-units', allUnitsStateData
)

.controller("AllUnitsList", ($scope, $state, $timeout, User, Unit, ExternalName, headerService, currentUser, unitService, analyticsService, dateService) ->
  analyticsService.event 'view-all-units', 'viewed all-units list'

  $scope.externalName = ExternalName

  # Table sort details
  $scope.sortOrder = "start_date"
  $scope.reverse = true

  # Pagination details
  $scope.currentPage = 1
  $scope.maxSize = 5
  $scope.pageSize = 15

  hasRoles = false

  timeoutPromise = $timeout((-> $scope.showSpinner = true), 2000)
  unitService.getUnitRoles (roles) ->
    $scope.unitRoles = roles
    $scope.showSpinner = false
    $scope.dataLoaded = true
    hasRoles = true
    $timeout.cancel(timeoutPromise)

  checkEnrolled = ->
    return if !$scope.unitRoles?
    $scope.notEnrolled = ->
      # Not enrolled if a tutor and no unitRoles
      ($scope.unitRoles.length is 0 and currentUser.role is 'Tutor')

  $scope.$watch 'unitRoles', checkEnrolled

  if currentUser.role isnt 'Student'
    Unit.query (units) ->
      $scope.units = units

  $scope.unit = (unitId) ->
    _.find($scope.units, {id: unitId})

  $scope.currentUser = currentUser
)
