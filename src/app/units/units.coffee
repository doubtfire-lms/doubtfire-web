angular.module("doubtfire.units", []
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
).controller("UnitsShowCtrl", ($scope, $state, $stateParams, Unit) ->
  $scope.unit = Unit.get { id: $stateParams.id }
)
