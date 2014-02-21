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
).controller("UnitsShowCtrl", ($scope, $state, $stateParams, Unit, UnitRole) ->
  UnitRole.query { unit_id: $state.id }, (unitRoles) ->
    # TODO: Handle possible multiple unit roles (e.g. convenor and tutor)
    $scope.unitRole = unitRoles[0] # one role per unit, for now
    $scope.unit = $scope.unitRole.unit # one role per unit, for now
)
