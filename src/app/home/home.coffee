angular.module("doubtfire.home", [])
.config(($stateProvider) ->
  $stateProvider.state("home",
    url: "/home"
    views:
      main:
        controller: "HomeCtrl"
        templateUrl: "home/index.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['basic', 'admin']
  )
).controller("HomeCtrl", ($scope, $state, UnitRole) ->
  $scope.unitRoles = UnitRole.query()
)
