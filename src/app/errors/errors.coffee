angular.module("doubtfire.errors", [
  "ui.router"
]).config(($stateProvider) ->

  $stateProvider.state("not_found",
    url: "/not_found"
    views:
      main:
        controller: "NotFoundCtrl"
        templateUrl: "errors/not_found.tpl.html"
    data:
      pageTitle: "_Not Found_"
  ).state("unauthorised",
    url: "/unauthorised"
    views:
      main:
        controller: "UnauthorisedCtrl"
        templateUrl: "errors/unauthorised.tpl.html"
    data:
      pageTitle: "_Unauthorised_"
  )

).controller("NotFoundCtrl", ($scope) ->

).controller "UnauthorisedCtrl", ($scope) ->
