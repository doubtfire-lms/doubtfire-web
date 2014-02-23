angular.module("doubtfire.units", [
  'doubtfire.units.partials'
]
).config(($stateProvider) ->

  $stateProvider.state("units#show",
    url: "/units/:id"
    views:
      main:
        controller: "UnitsShowCtrl"
        templateUrl: "units/show.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['basic', 'admin']
  )
  .state("admin/units#index",
    url: "/admin/units"
    views:
      main:
        controller: "AdminUnitsCtrl"
        templateUrl: "units/admin.tpl.html"
    data:
      pageTitle: "_Unit Administration_"
      roleWhitelist: ['admin']
  )
)
.controller("UnitsShowCtrl", ($scope, $state, $stateParams, Unit, UnitRole) ->
  UnitRole.query { unit_id: $state.id }, (unitRoles) ->
    # TODO: Handle possible multiple unit roles (e.g. convenor and tutor)
    $scope.unitRole = unitRoles[0] # one role per unit, for now
    $scope.unit = $scope.unitRole.unit # one role per unit, for now
)
.controller("AdminUnitsCtrl", ($scope, $state, $stateParams, $modal, Unit, Convenor) ->
  $scope.units = Unit.query()
  $scope.convenors = Convenor.query()

  $scope.addNewUnit = ->
    $modal.open
      templateUrl: 'units/partials/templates/unit-modal.tpl.html'
      controller: 'UnitModalCtrl'
      resolve:
        convenors: -> $scope.convenors
)
