angular.module("wangular-grunt.home", [
]
).config(($stateProvider) ->

  $stateProvider.state("home",
    url: "/home"
    views:
      main:
        controller: "HomeCtrl"
        templateUrl: "home/index.tpl.html"
    data:
      pageTitle: "_Home_"
  )
).controller("HomeCtrl", ($scope, $state, api) ->
)
