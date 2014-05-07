angular.module("doubtfire.home", [])
.config(($stateProvider) ->
  $stateProvider.state("home",
    url: "/home"
    views:
      main:
        controller: "HomeCtrl"
        templateUrl: "home/index.tpl.html"
      header:
        controller: "BasicHeaderCtrl"
        templateUrl: "common/header.tpl.html"
    data:
      pageTitle: "_Home_"
      roleWhitelist: ['basic', 'admin']
  )
)

.controller("HomeCtrl", ($scope, $state, UnitRole, headerService) ->
  $scope.unitRoles = UnitRole.query()
  headerService.clearLinks()
)
